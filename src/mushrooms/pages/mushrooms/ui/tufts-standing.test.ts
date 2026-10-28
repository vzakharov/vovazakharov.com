import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/kernel/shared/lib/collections';

import { type Circle, distanceBetween } from '@/mushrooms/shared/lib/geometry';
import {
  mulberry32,
  nextSeed,
  type Random,
} from '@/mushrooms/shared/lib/random';
import { MUSHROOM_SLOTS } from '@/mushrooms/shared/meadow';
import {
  type Camera,
  type Footing,
  groundFootOf,
  OPENING_EYE,
  standingOn,
  viewAt,
} from '@/mushrooms/shared/space';
import {
  flowerGenes,
  flowerHead,
  flowersOf,
  headClear,
  plantedId,
  type Sown,
} from '@/mushrooms/entities/flower/index.node-safe';
import {
  cellOf,
  cellTufts,
  LAWN_CELL,
  LiveLawn,
  TUFTS_PER_CELL,
} from '@/mushrooms/entities/landscape/index.node-safe';
import { MUSHROOM_SPECIES } from '@/mushrooms/entities/mushroom/index.node-safe';
import { roomFor } from '@/mushrooms/features/grow-mushroom/index.node-safe';
import { perchSight } from '@/mushrooms/features/insects-fly/index.node-safe';
import {
  type Sprout,
  takesFlower,
  tendedIn,
  tendTufts,
} from '@/mushrooms/features/plant-flower/index.node-safe';
import {
  bareToTap,
  roomIn,
} from '@/mushrooms/features/plant-flower/index.test-only';

import { type Action, reduce } from '../model/game';
import {
  grassOf,
  lawnOf,
  type MeadowStand,
  plantedOn,
  SCREENS,
  seedOf,
  VISITS,
} from './tufts.test-kit';
import { type Opened, opened } from './visit-play';

/** How many visits each screen plays a mix of `+`, `−` and plantings over, and how many turns each. */
const PLAYED = 40;
const TURNS = 16;

/** How far `sprout`'s tuft is drawn off the root of its foot, on `camera`. */
function offFoot(camera: Camera, { foot, tuft }: Sprout): number {
  const root = standingOn(camera, foot);
  return Math.hypot(root.x - tuft.x, root.y - tuft.y);
}

/** The head of a flower grown from `seed` standing at `place` on the layout, at rest. */
function headAt(seed: number, place: Footing): Circle {
  const head = flowerHead(flowerGenes({ seed }), place.size);
  return { x: place.x + head.x, y: place.y + head.y, ...pick(head, 'r') };
}

/**
 * What is wrong with `standing` as the tufts that stand on `stand` out of
 * `grown`, seen from the opening eye: a tuft that refuses a flower, that is
 * not bare to a finger, or whose flower, planted, would draw its head over
 * another's; one off its foot or not of `grown`; or a tuft of `grown` that
 * has room, is bare, and keeps any flower's head clear (`headClear`), yet
 * does not stand.
 */
function faultsOf(
  stand: MeadowStand,
  grown: readonly Sprout[],
  standing: readonly Sprout[],
): string[] {
  const faults: string[] = [];
  const { camera } = stand.layout;
  const bare = bareToTap(stand);
  const room = roomIn(stand);
  const flowers = flowersOf(stand);
  const heads = flowers.map(({ seed, place }) => headAt(seed, place));
  const others = flowers.map((flower) => ({
    foot: groundFootOf(flower.foot),
    genes: flowerGenes(flower),
  }));
  for (const [index, each] of standing.entries()) {
    const { foot, tuft } = each;
    if (!grown.includes(each)) faults.push('a tuft stands that never grew');
    if (!takesFlower(stand, foot, OPENING_EYE)) faults.push('a tuft refuses');
    if (!bare(tuft)) faults.push('a tuft is covered');
    if (offFoot(camera, each) > 1e-6) {
      faults.push('a tuft stands off its foot');
    }
    const own = headAt(index + 1, standingOn(camera, foot));
    if (heads.some((head) => distanceBetween(head, own) < head.r + own.r)) {
      faults.push('a tuft’s flower would meet a head');
    }
  }
  const stood = new Set(standing);
  const missing = grown.some(
    (each) =>
      !stood.has(each) &&
      room(each.foot) &&
      bare(each.tuft) &&
      headClear(groundFootOf(each.foot), others),
  );
  if (missing) faults.push('a tuft fit to plant on is missing');
  return faults;
}

/**
 * The share of meadows a screen may show with no tuft standing,
 * none unless named: on the 280 px phone, a grown forest and a full band of
 * flowers can leave no spot in sight where a flower can stand clear of every
 * drawn cap, its head clear of every other.
 */
const BARELESS_MOST: Partial<Record<(typeof SCREENS)[number][0], number>> = {
  '280×600': 0.16,
};

/** A tally of the meadows, and those among them with no tuft standing. */
class Barren {
  private meadows = 0;
  private readonly bare: string[] = [];

  count(sprouts: readonly Sprout[], at: string): void {
    this.meadows++;
    if (sprouts.length === 0) this.bare.push(at);
  }

  holdTo(most: number): void {
    assert.ok(
      this.bare.length <= most * this.meadows,
      `${String(this.bare.length)} of ${String(this.meadows)} with no tuft, first ${this.bare.slice(0, 3).join('; ')}`,
    );
  }
}

/** `stand` with `action` reduced into its meadow, its mushrooms following. */
function actedOn(stand: Opened, action: Action): Opened {
  const meadow = reduce(stand.meadow, action);
  return { ...stand, meadow, ...pick(meadow, 'mushrooms') };
}

/** `stand` one turn on: a mushroom grown or thinned, or a flower planted by a bee or by the child. */
function turned(
  stand: Opened,
  sprouts: readonly Sprout[],
  random: Random,
  growing: Random,
): Opened {
  const roll = random();
  if (roll < 0.25) {
    const own = nextSeed(growing);
    const foot = roomFor(stand, own);
    if (!foot || stand.mushrooms.length >= MUSHROOM_SLOTS) return stand;
    const species =
      MUSHROOM_SPECIES[Math.floor(random() * MUSHROOM_SPECIES.length)] ??
      'fly-agaric';
    return actedOn(stand, {
      kind: 'grow',
      species,
      seed: own,
      ...foot,
    });
  }
  if (roll < 0.4) return actedOn(stand, { kind: 'remove' });
  if (roll < 0.65) {
    const { room } = perchSight(stand);
    const slot = room[Math.floor(random() * room.length)];
    if (!slot) return stand;
    const { planted } = stand;
    const sown: Sown = {
      id: plantedId(planted),
      seed: nextSeed(random),
      parent: slot.flower,
      ...pick(slot, 'ring'),
    };
    return { ...stand, planted: [...planted, sown] };
  }
  const tuft = sprouts[Math.floor(random() * sprouts.length)];
  return tuft ? plantedOn(stand, tuft, nextSeed(random)) : stand;
}

describe('the ground’s grass', () => {
  for (const [name, width, height] of SCREENS) {
    it(`grows on the ${name} a lawn by cells, each a pure function of its index, the same walking away and back`, () => {
      const stand = opened(seedOf(0), width, height, false);
      const lawn = lawnOf(stand.layout, seedOf(0));
      for (const cell of [
        { i: 0, j: 2 },
        { i: -3, j: -1 },
        { i: 40, j: -25 },
      ]) {
        const tufts = cellTufts(lawn, cell);
        assert.equal(tufts.length, TUFTS_PER_CELL);
        for (const { foot } of tufts) assert.deepEqual(cellOf(foot), cell);
        assert.deepEqual(cellTufts(lawn, cell), tufts);
      }
      assert.notDeepEqual(
        cellTufts(lawn, { i: 0, j: 0 }).map(({ foot }) => foot),
        cellTufts(lawn, { i: 1, j: 0 }).map(({ foot }) => foot),
      );
      const live = new LiveLawn(lawn);
      const here = [...live.round(OPENING_EYE)];
      const away = { ...OPENING_EYE, x: 30 * LAWN_CELL, y: -12 * LAWN_CELL };
      const there = live.round(away);
      assert.ok(there.every(({ foot }) => !here.some((h) => h.foot === foot)));
      // Every cell of `here` left the live lawn, so coming back grows it anew.
      assert.deepEqual(live.round(OPENING_EYE), here);
    });
  }

  for (const [name, width, height] of SCREENS) {
    const most = BARELESS_MOST[name] ?? 0;
    const bound = most === 0 ? 'always' : `in all but ${String(most * 100)}%`;

    it(`stands on the ${name} wherever a flower fits and nowhere else, a tuft standing ${bound}`, () => {
      const barren = new Barren();
      for (let visit = 0; visit < VISITS; visit++) {
        const seed = seedOf(visit);
        for (const forest of [false, true]) {
          const stand = opened(seed, width, height, forest);
          const [grown, standing] = grassOf(stand, seed);
          assert.deepEqual(
            faultsOf(stand, grown, standing),
            [],
            `visit ${String(seed)}`,
          );
          barren.count(standing, `visit ${String(seed)}`);
        }
      }
      barren.holdTo(most);
    });

    it(`keeps so on the ${name} through \`+\`, \`−\`, the bees’ plantings and the child’s, the grass itself never moving`, () => {
      const barren = new Barren();
      for (let visit = 0; visit < PLAYED; visit++) {
        const seed = seedOf(visit);
        const random = mulberry32(seed ^ 0x1d_ea);
        const growing = mulberry32(seed ^ 0x9e_0a);
        let stand = opened(seed, width, height, visit % 2 === 1);
        const [grown, first] = grassOf(stand, seed);
        let standing = first;
        for (let turn = 0; turn < TURNS; turn++) {
          stand = turned(stand, standing, random, growing);
          standing = tendTufts(stand, grown, OPENING_EYE);
          const at = `visit ${String(seed)}, turn ${String(turn)}`;
          assert.deepEqual(faultsOf(stand, grown, standing), [], at);
          barren.count(standing, at);
        }
      }
      barren.holdTo(most);
    });
  }

  it('brings back the tufts a mushroom kept away once it goes', () => {
    const seed = seedOf(3);
    const stand = opened(seed, 1180, 820, true);
    const [grown, standing] = grassOf(stand, seed);
    const cleared = { ...stand, mushrooms: [] };
    const bared = tendTufts(cleared, grown, OPENING_EYE);
    assert.ok(bared.length > standing.length);
    assert.deepEqual(tendTufts(stand, grown, OPENING_EYE), standing);
  });

  it('stands the tufts round an eye far off the opening, each taking the flower it is tapped for there', () => {
    const seed = seedOf(5);
    const stand = opened(seed, 1180, 820, true);
    const lawn = new LiveLawn(lawnOf(stand.layout, seed));
    for (const eye of [
      { x: 30, y: 25, heading: 1.2 },
      { x: -40, y: -60, heading: Math.PI },
    ]) {
      const grown = lawn
        .round(eye)
        .filter(tendedIn(viewAt(stand.layout.camera, eye)));
      const standing = tendTufts(stand, grown, eye);
      assert.ok(standing.length > grown.length / 10, JSON.stringify(eye));
      for (const { foot } of standing) {
        assert.ok(takesFlower(stand, foot, eye), JSON.stringify(eye));
      }
    }
  });
});
