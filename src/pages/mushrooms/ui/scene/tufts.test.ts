import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/shared/lib/collections';

import { flowerGenes, flowerHead } from '../../model/flower-genes';
import { MUSHROOM_SLOTS, reduce } from '../../model/game';
import { MUSHROOM_SPECIES } from '../../model/mushroom-genes';
import { plantedId, type Sown } from '../../model/pollen';
import { mulberry32, nextSeed, type Random } from '../../model/random';
import { FLOWER_SIZE, standingOn } from './flower-layout';
import { standingFlowers } from './flower-plots';
import { type Stand, takesFlower } from './flower-sight';
import type { Tuft } from './grass';
import { roomFor } from './mushroom-room';
import { perchSight } from './perch-sight';
import {
  bareToTap,
  growTufts,
  mostTufts,
  plantableIn,
  type Sprout,
  tendTufts,
  TUFT_LEAST,
  TUFT_REACH,
  tuftAt,
  tuftReach,
} from './tufts';
import { FLOOR_HELD, VIEWPORTS } from './viewports';
import { type Opened, opened, relaidOn } from './visit-play';

const SCREENS = [...VIEWPORTS, FLOOR_HELD] as const;
/** How many visits each screen is tried over, on a fresh meadow. */
const VISITS = 40;
/** How many visits each screen plays a mix of `+`, `−` and plantings over, and how many turns each. */
const PLAYED = 40;
const TURNS = 16;

const seedOf = (visit: number) => visit * 7919 + 3;
const tuftsOf = (stand: Stand, seed: number): Sprout[] =>
  growTufts(stand, mulberry32(seed ^ 0x70_f7_5e));

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

const sprout = (x: number, y: number, size: number): Sprout => ({
  foot: { x, z: 0, size: FLOWER_SIZE },
  tuft: { x, y, size, phase: 0, flank: 0, middle: 0, crown: 0 },
});

describe('tuftAt', () => {
  const sprouts = [
    sprout(100, 300, 6),
    sprout(130, 300, 6),
    sprout(400, 500, 30),
  ];

  it('finds the tuft a finger lands on, the nearest of two that reach', () => {
    assert.equal(tuftAt(sprouts, { x: 104, y: 294 }), sprouts[0]);
    assert.equal(tuftAt(sprouts, { x: 124, y: 294 }), sprouts[1]);
  });

  it('answers a finger’s pad round a small tuft, and its blades round a big one', () => {
    const [small, , big] = sprouts;
    assert.ok(small && big);
    assert.equal(tuftReach(small.tuft), TUFT_REACH);
    assert.ok(tuftReach(big.tuft) > TUFT_REACH);
    assert.equal(
      tuftAt(sprouts, { x: 400, y: 470 + tuftReach(big.tuft) - 1 }),
      big,
    );
  });

  it('leaves the bare ground bare', () => {
    assert.equal(tuftAt(sprouts, { x: 250, y: 400 }), undefined);
    assert.equal(
      tuftAt(sprouts, { x: 100, y: 300 - 6 - TUFT_REACH - 1 }),
      undefined,
    );
  });
});

/**
 * What is wrong with `sprouts` as the bare tufts of `stand`, `kept` the
 * ones shown before: a tuft that refuses a flower, is not bare to a finger,
 * is drawn under `TUFT_LEAST` or reaches into another's reach; more of them
 * than `mostTufts` over the world; or a tuft still fit that moved or went
 * while there was room for it.
 */
function faultsOf(
  stand: Stand,
  sprouts: readonly Sprout[],
  kept: readonly Sprout[],
): string[] {
  const faults: string[] = [];
  const bare = bareToTap(stand);
  const plantable = plantableIn(stand);
  const most = mostTufts(stand.layout.camera);
  for (const { foot, tuft } of sprouts) {
    if (!takesFlower(stand, foot)) faults.push('a tuft refuses');
    if (!plantable({ foot, tuft }))
      faults.push('a tuft’s flower would meet a head');
    if (!bare(tuft)) faults.push('a tuft is covered');
    if (tuft.size < TUFT_LEAST) faults.push('a tuft is drawn small');
    const root = standingOn(stand.layout.camera, foot);
    if (Math.hypot(root.x - tuft.x, root.y - tuft.y) > 1e-6) {
      faults.push('a tuft stands off its foot');
    }
    for (const other of sprouts) {
      if (other.tuft === tuft) continue;
      const apart = Math.hypot(other.tuft.x - tuft.x, other.tuft.y - tuft.y);
      if (apart < tuftReach(tuft) + tuftReach(other.tuft) - 1e-6) {
        faults.push('two tufts’ reaches meet');
      }
    }
  }
  if (sprouts.length > most) faults.push('more tufts than the world grows');
  const stillFit = kept.filter(plantableIn(stand));
  if (
    sprouts.length < most &&
    stillFit.some((each) => !sprouts.includes(each))
  ) {
    faults.push('a tuft still fit went');
  }
  return faults;
}

/**
 * The share of meadows a screen may show with no bare tuft,
 * none unless named: on the 280 px phone, a grown forest and a full band of
 * flowers leave no spot a flower can stand in sight off every cap and
 * finger pad, its head clear of every other, in about one meadow in seven.
 */
const BARELESS_MOST: Partial<Record<(typeof SCREENS)[number][0], number>> = {
  '280×600': 0.16,
};

/** A tally of the meadows, and those among them with no bare tuft. */
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

/** `stand` one turn on: a mushroom grown or thinned, or a flower planted by a bee or by the child. */
function turned(
  stand: Opened,
  sprouts: readonly Sprout[],
  random: Random,
  growing: Random,
): Opened {
  const roll = random();
  const { meadow } = stand;
  if (roll < 0.25) {
    const own = nextSeed(growing);
    const foot = roomFor(stand, own);
    if (!foot || meadow.mushrooms.length >= MUSHROOM_SLOTS) return stand;
    const species =
      MUSHROOM_SPECIES[Math.floor(random() * MUSHROOM_SPECIES.length)] ??
      'fly-agaric';
    const grown = reduce(meadow, { kind: 'grow', species, seed: own, foot });
    return { ...stand, meadow: grown, ...pick(grown, 'mushrooms') };
  }
  if (roll < 0.4) {
    const thinned = reduce(meadow, { kind: 'remove' });
    return { ...stand, meadow: thinned, ...pick(thinned, 'mushrooms') };
  }
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

describe('the tufts the child plants on', () => {
  for (const [name, width, height] of SCREENS) {
    const most = BARELESS_MOST[name] ?? 0;
    const bound = most === 0 ? 'always' : `in all but ${String(most * 100)}%`;

    it(`grows on the ${name} as many as \`mostTufts\` over the world, each taking one, bare to a finger and at least TUFT_LEAST, and one ${bound}`, () => {
      const barren = new Barren();
      for (let visit = 0; visit < VISITS; visit++) {
        const seed = seedOf(visit);
        for (const forest of [false, true]) {
          const stand = opened(seed, width, height, forest);
          const sprouts = tuftsOf(stand, seed);
          assert.deepEqual(
            faultsOf(stand, sprouts, []),
            [],
            `visit ${String(seed)}`,
          );
          barren.count(sprouts, `visit ${String(seed)}`);
        }
      }
      barren.holdTo(most);
    });

    it(`keeps them so on the ${name} through \`+\`, \`−\`, the bees’ plantings and the child’s, a tuft still fit never moving`, () => {
      const barren = new Barren();
      for (let visit = 0; visit < PLAYED; visit++) {
        const seed = seedOf(visit);
        const random = mulberry32(seed ^ 0x1d_ea);
        const growing = mulberry32(seed ^ 0x9e_0a);
        const tufting = mulberry32(seed ^ 0x70_f7_5e);
        let stand = opened(seed, width, height, visit % 2 === 1);
        let sprouts = tendTufts(stand, [], tufting);
        for (let turn = 0; turn < TURNS; turn++) {
          stand = turned(stand, sprouts, random, growing);
          const kept = sprouts;
          sprouts = tendTufts(stand, kept, tufting);
          const at = `visit ${String(seed)}, turn ${String(turn)}`;
          assert.deepEqual(faultsOf(stand, sprouts, kept), [], at);
          barren.count(sprouts, at);
        }
      }
      barren.holdTo(most);
    });
  }

  it('keeps the head of every flower the child plants apart from every other head, on the screen it opened on and turned', () => {
    for (const [, width, height] of SCREENS) {
      for (let visit = 0; visit < VISITS; visit++) {
        const seed = seedOf(visit);
        let stand: Stand = opened(seed, width, height, visit % 2 === 1);
        const tufting = mulberry32(seed ^ 0x70_f7_5e);
        const choosing = mulberry32(seed);
        let sprouts = tendTufts(stand, [], tufting);
        for (let planting = 0; planting < 5; planting++) {
          const next = sprouts[Math.floor(choosing() * sprouts.length)];
          if (!next) break;
          stand = plantedOn(stand, next, nextSeed(choosing));
          sprouts = tendTufts(stand, sprouts, tufting);
        }
        const own = new Set(stand.planted.map(({ id }) => id));
        for (const [across, down] of [
          [width, height],
          [height, width],
        ] as const) {
          const layout = relaidOn(stand, seed, across, down);
          const heads = standingFlowers(
            layout,
            stand.flowers,
            stand.planted,
            stand.mushrooms,
          ).map(({ id, seed: grown, place }) => {
            const head = flowerHead(flowerGenes({ seed: grown }), place.size);
            return {
              id,
              ...pick(head, 'r'),
              x: place.x + head.x,
              y: place.y + head.y,
            };
          });
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

  it('refuses a second flower on a tuft already planted, and grows none once the world has no room, past the fourteen flowers a screen once held', () => {
    const seed = 3;
    let stand: Stand = opened(seed, 1180, 820, false);
    const tufting = mulberry32(seed);
    let sprouts = tendTufts(stand, [], tufting);
    const [first] = sprouts;
    assert.ok(first);
    const once = plantedOn(stand, first, 11);
    assert.equal(takesFlower(once, first.foot), false);
    // Each planting takes a tuft's room, so the world fills well within this many.
    for (let planting = 0; planting < 400 && sprouts.length > 0; planting++) {
      const [next] = sprouts;
      assert.ok(next);
      stand = plantedOn(stand, next, stand.planted.length + 20);
      sprouts = tendTufts(stand, sprouts, tufting);
    }
    assert.deepEqual(sprouts, []);
    assert.deepEqual(growTufts(stand, mulberry32(seed + 1)), []);
    assert.ok(stand.flowers.length + stand.planted.length > 14);
  });

  it('keeps every flower planted on a tuft through a turn and back, and no tuft at its root', () => {
    for (const [, width, height] of SCREENS) {
      const seed = 17;
      let stand: Stand = opened(seed, width, height, false);
      const tufting = mulberry32(seed);
      let sprouts = tendTufts(stand, [], tufting);
      for (let planting = 0; planting < 4; planting++) {
        const [next] = sprouts;
        if (!next) break;
        stand = plantedOn(stand, next, stand.planted.length + 40);
        sprouts = tendTufts(stand, sprouts, tufting);
      }
      assert.ok(stand.planted.length > 0);
      for (const [across, down] of [
        [width, height],
        [height, width],
        [width, height],
      ] as const) {
        const layout = relaidOn(stand, seed, across, down);
        const shown = { ...stand, layout };
        const standing = standingFlowers(
          layout,
          stand.flowers,
          stand.planted,
          stand.mushrooms,
        );
        // Every tuft the grass draws: the bare ones, tended afresh.
        const drawn: Tuft[] = tendTufts(shown, [], tufting).map(
          ({ tuft }) => tuft,
        );
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
});
