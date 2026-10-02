import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/shared/lib/collections';

import { flowerGenes, flowerHead } from '../../model/flower-genes';
import { type Action, MUSHROOM_SLOTS, reduce } from '../../model/game';
import type { Point } from '../../model/geometry';
import {
  type Camera,
  type Eye,
  OPENING_EYE,
  pinholeOf,
} from '../../model/ground';
import { MUSHROOM_SPECIES } from '../../model/mushroom-genes';
import { grownOn } from '../../model/placement';
import { plantedId, type Sown } from '../../model/pollen';
import { mulberry32, nextSeed, type Random } from '../../model/random';
import { FLOWER_SIZE, standingOn } from './flower-layout';
import { flowersOf } from './flower-plots';
import { type Stand, takesFlower } from './flower-sight';
import { type Tuft, tuftSizeAt } from './grass';
import {
  CELL,
  cellOf,
  cellTufts,
  type Lawn,
  LiveLawn,
  TUFTS_PER_CELL,
} from './lawn';
import { type MeadowLayout, meadowLayout } from './layout';
import { roomFor } from './mushroom-room';
import { perchSight } from './perch-sight';
import { bareToTap, tuftAt } from './tuft-tap';
import {
  leaveTufts,
  plantableIn,
  shownSprouts,
  type Sprout,
  tendedIn,
  tendTufts,
} from './tufts';
import { behindHills, cull, ofGround, viewAt } from './view';
import { FLOOR_HELD, VIEWPORTS } from './viewports';
import { type Opened, opened, relaidOn } from './visit-play';

const SCREENS = [...VIEWPORTS, FLOOR_HELD] as const;
/** How many visits each screen is tried over, on a fresh meadow. */
const VISITS = 40;
/** How many visits each screen plays a mix of `+`, `−` and plantings over, and how many turns each. */
const PLAYED = 40;
const TURNS = 16;
/** How many visits each screen pulls every seeded flower of, one at a time. */
const PULLED_VISITS = 6;

const seedOf = (visit: number) => visit * 7919 + 3;
const tuftingOf = (seed: number): Random => mulberry32(seed ^ 0x70_f7_5e);
/** The lawn a visit of `seed` grows on `layout`, as `Grass` seeds it. */
const lawnOf = (layout: MeadowLayout, seed: number): Lawn => ({
  seed: Math.floor(tuftingOf(seed)() * 2 ** 32),
  layout,
});
/** The live tufts of a visit of `seed` on `layout` the opening eye tends (`tendedIn`). */
function tendedOn(layout: MeadowLayout, seed: number): Sprout[] {
  return new LiveLawn(lawnOf(layout, seed))
    .round(OPENING_EYE)
    .filter(tendedIn(viewAt(layout.camera, OPENING_EYE)));
}
/** The tufts of `stand` the opening eye tends as a visit of `seed` grows them, and those that stand. */
function grassOf(stand: Stand, seed: number): [Sprout[], Sprout[]] {
  const grown = tendedOn(stand.layout, seed);
  return [grown, tendTufts(stand, grown)];
}
/** Each pulled flower's cell's tufts, on a visit of `seed`'s lawn on `layout`. */
const grownAtOf = (layout: MeadowLayout, seed: number) => (foot: Point) =>
  cellTufts(lawnOf(layout, seed), cellOf(foot));

/** `stand` with a flower planted on `sprout`, as the scene plants it. */
function plantedOn<Standing extends Stand>(
  stand: Standing,
  { foot }: Sprout,
  seed: number,
): Standing {
  const planted: Sown[] = [
    ...stand.planted,
    { id: plantedId(stand.planted), seed, foot },
  ];
  return { ...stand, planted };
}

/** How far `sprout`'s tuft is drawn off the root of its foot, on `camera`. */
function offFoot(camera: Camera, { foot, tuft }: Sprout): number {
  const root = standingOn(camera, foot);
  return Math.hypot(root.x - tuft.x, root.y - tuft.y);
}

describe('shownSprouts', () => {
  /** The opening eye, and one stepped 3 units in. */
  const EYES: ReadonlyArray<[string, Eye]> = [
    ['the opening eye', OPENING_EYE],
    ['an eye stepped in', { ...OPENING_EYE, y: OPENING_EYE.y + 3 }],
  ];

  for (const [name, width, height] of VIEWPORTS) {
    const layout = meadowLayout(width, height, seedOf(1));
    const grown = [
      ...new LiveLawn(lawnOf(layout, seedOf(1))).round(OPENING_EYE),
    ];
    const left = (layout.camera.world - width) / 2;

    it(`draws every tuft at the opening at the azimuth its layout is seen at, bent, on a ${name} screen`, () => {
      const view = viewAt(layout.camera, OPENING_EYE);
      const { near, behind } = shownSprouts(view, grown);
      // Only what is laid past the brow, which curves below the ground's top
      // row toward the screen's sides, sinks at the opening.
      for (const { sprout: sunk } of behind) {
        assert.ok(behindHills(ofGround(view, sunk.foot)));
      }
      assert.ok(near.length > 0);
      // The lens shows the layout's ground at the azimuth the opening crop's
      // pinhole sees it at, its row bent as the brow is.
      const { x: middle, y: horizon, focal } = pinholeOf(view);
      for (const {
        tuft,
        sprout: { tuft: laid },
      } of near) {
        const azimuth = Math.atan((laid.x - left - middle) / focal);
        const bend = Math.cos(azimuth) * Math.hypot(1, azimuth);
        assert.ok(Math.abs(tuft.x - (middle + focal * azimuth)) < 0.5);
        assert.ok(
          Math.abs(tuft.y - (horizon + (laid.y - horizon) * bend)) < 0.5,
        );
      }
    });

    for (const [eyeName, eye] of EYES) {
      it(`draws each tuft where ${eyeName} places its foot, and takes a tap there, on a ${name} screen`, () => {
        const view = viewAt(layout.camera, eye);
        const { near } = shownSprouts(view, grown);
        for (const {
          tuft,
          sprout: { foot },
        } of near) {
          const placed = ofGround(view, foot);
          assert.ok(!cull(placed));
          assert.ok(Math.abs(tuft.x - placed.x) < 1e-6);
          assert.ok(Math.abs(tuft.y - placed.y) < 1e-6);
          // Sized by the row its foot stands on, wherever on the plane.
          assert.ok(Math.abs(tuft.size - tuftSizeAt(view, placed.y)) < 1e-6);
          // The nearest drawn tuft takes it, this one or one drawn over it.
          const { x, y, size } = tuft;
          assert.ok(tuftAt(near, { x, y: y - size }));
        }
      });
    }
  }
});

/**
 * What is wrong with `standing` as the tufts that stand on `stand` out of
 * `grown`: a tuft that refuses a flower, whose flower would meet a head, or
 * that is not bare to a finger; one off its foot or not of `grown`; or a
 * tuft of `grown` fit to plant on that does not stand.
 */
function faultsOf(
  stand: Stand,
  grown: readonly Sprout[],
  standing: readonly Sprout[],
): string[] {
  const faults: string[] = [];
  const bare = bareToTap(stand);
  const plantable = plantableIn(stand);
  for (const each of standing) {
    const { foot, tuft } = each;
    if (!grown.includes(each)) faults.push('a tuft stands that never grew');
    if (!takesFlower(stand, foot)) faults.push('a tuft refuses');
    if (!plantable(each)) faults.push('a tuft’s flower would meet a head');
    if (!bare(tuft)) faults.push('a tuft is covered');
    if (offFoot(stand.layout.camera, each) > 1e-6) {
      faults.push('a tuft stands off its foot');
    }
  }
  if (grown.some((each) => plantable(each) && !standing.includes(each))) {
    faults.push('a tuft fit to plant on is missing');
  }
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
      ...grownOn(OPENING_EYE, foot),
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
      const away = { ...OPENING_EYE, x: 30 * CELL, y: -12 * CELL };
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
          standing = tendTufts(stand, grown);
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
    const bared = tendTufts(cleared, grown);
    assert.ok(bared.length > standing.length);
    assert.deepEqual(tendTufts(stand, grown), standing);
  });

  it('keeps the head of every flower the child plants apart from every other head, on the screen it opened on and turned', () => {
    for (const [, width, height] of SCREENS) {
      for (let visit = 0; visit < VISITS; visit++) {
        const seed = seedOf(visit);
        let stand: Stand = opened(seed, width, height, visit % 2 === 1);
        const choosing = mulberry32(seed);
        const [grown, first] = grassOf(stand, seed);
        let sprouts = first;
        for (let planting = 0; planting < 5; planting++) {
          const next = sprouts[Math.floor(choosing() * sprouts.length)];
          if (!next) break;
          stand = plantedOn(stand, next, nextSeed(choosing));
          sprouts = tendTufts(stand, grown);
        }
        const own = new Set(stand.planted.map(({ id }) => id));
        for (const [across, down] of [
          [width, height],
          [height, width],
        ] as const) {
          const layout = relaidOn(stand, seed, across, down);
          const heads = flowersOf({ ...stand, layout }).map(
            ({ id, seed: grownFrom, place }) => {
              const head = flowerHead(
                flowerGenes({ seed: grownFrom }),
                place.size,
              );
              return {
                id,
                ...pick(head, 'r'),
                x: place.x + head.x,
                y: place.y + head.y,
              };
            },
          );
          for (const head of heads.filter(({ id }) => own.has(id))) {
            for (const other of heads) {
              if (other === head) continue;
              assert.ok(
                Math.hypot(head.x - other.x, head.y - other.y) >=
                  head.r + other.r,
                `visit ${String(seed)}: ${head.id}'s head meets ${other.id}'s on ${String(across)}×${String(down)}`,
              );
            }
          }
        }
      }
    }
  });

  it('takes no second flower on a tuft planted, and stands nowhere once the world has no room, well past fourteen flowers', () => {
    const seed = 3;
    let stand: Stand = opened(seed, 1180, 820, false);
    const [grown, first] = grassOf(stand, seed);
    let sprouts = first;
    const [tuft] = sprouts;
    assert.ok(tuft);
    const once = plantedOn(stand, tuft, 11);
    assert.equal(takesFlower(once, tuft.foot), false);
    assert.ok(!tendTufts(once, grown).includes(tuft));
    // Each planting takes a tuft's room, so the world fills well within this many.
    for (let planting = 0; planting < 400 && sprouts.length > 0; planting++) {
      const [next] = sprouts;
      assert.ok(next);
      stand = plantedOn(stand, next, stand.planted.length + 20);
      sprouts = tendTufts(stand, grown);
    }
    assert.deepEqual(sprouts, []);
    assert.ok(stand.flowers.length + stand.planted.length > 14);
  });

  it('keeps every flower planted on a tuft through a turn and back, and no tuft standing at its root', () => {
    for (const [, width, height] of SCREENS) {
      const seed = 17;
      let stand: Stand = opened(seed, width, height, false);
      let grown = tendedOn(stand.layout, seed);
      let sprouts = tendTufts(stand, grown);
      for (let planting = 0; planting < 4; planting++) {
        const [next] = sprouts;
        if (!next) break;
        stand = plantedOn(stand, next, stand.planted.length + 40);
        sprouts = tendTufts(stand, grown);
      }
      assert.ok(stand.planted.length > 0);
      for (const [across, down] of [
        [width, height],
        [height, width],
        [width, height],
      ] as const) {
        const layout = relaidOn(stand, seed, across, down);
        grown = tendedOn(layout, seed);
        const drawn: Tuft[] = tendTufts({ ...stand, layout }, grown).map(
          ({ tuft }) => tuft,
        );
        const standing = flowersOf({ ...stand, layout });
        for (const { id } of stand.planted) {
          const flower = standing.find((each) => each.id === id);
          assert.ok(flower, `${id} gone on ${String(across)}×${String(down)}`);
          // A tuft's blades spread about its size round its root.
          for (const tuft of drawn) {
            assert.ok(
              Math.hypot(tuft.x - flower.place.x, tuft.y - flower.place.y) >
                tuft.size,
              `a tuft drawn at ${id}'s root on ${String(across)}×${String(down)}`,
            );
          }
        }
      }
    }
  });

  it('leaves a tuft where a seeded flower pulled up stood, which takes a flower as any tuft does, and comes back once that one is pulled too', () => {
    for (const [name, width, height] of SCREENS) {
      let left = 0;
      let tried = 0;
      for (let visit = 0; visit < PULLED_VISITS; visit++) {
        const seed = seedOf(visit);
        const stand = opened(seed, width, height, visit % 2 === 1);
        const [grown, standing] = grassOf(stand, seed);
        for (const flower of flowersOf(stand)) {
          const at = `${name}, visit ${String(seed)}, ${flower.id}`;
          const pulled = { ...stand, pulled: [flower.id] };
          const tufting = tuftingOf(seed + 1);
          const grownAt = grownAtOf(stand.layout, seed);
          const leaving = leaveTufts(pulled, grownAt, [], tufting);
          assert.equal(leaving.length, 1, at);
          const [spot] = leaving;
          assert.ok(spot);
          assert.deepEqual(spot.foot, {
            ...pick(flower.foot, 'x', 'y'),
            size: FLOWER_SIZE,
          });
          const back = tendTufts(pulled, [...grown, ...leaving]);
          tried += 1;
          if (!back.includes(spot)) continue;
          left += 1;
          assert.ok(back.length > standing.length, at);
          const replanted = plantedOn(pulled, spot, seed + 2);
          assert.equal(
            leaveTufts(replanted, grownAt, leaving, tufting),
            leaving,
            at,
          );
          assert.ok(
            !tendTufts(replanted, [...grown, ...leaving]).includes(spot),
            at,
          );
          const newest = replanted.planted.at(-1);
          assert.ok(newest);
          const repulled = {
            ...replanted,
            pulled: [...replanted.pulled, newest.id],
          };
          assert.equal(
            leaveTufts(repulled, grownAt, leaving, tufting),
            leaving,
            at,
          );
          assert.ok(
            tendTufts(repulled, [...grown, ...leaving]).includes(spot),
            at,
          );
        }
      }
      // A spot stands only where a flower fits and a finger finds it bare, as
      // every tuft does; a mushroom's cap over it keeps some away.
      assert.ok(
        left > tried / 2,
        `${String(left)} of ${String(tried)} seeded flowers on the ${name} left a tuft standing`,
      );
    }
  });
});
