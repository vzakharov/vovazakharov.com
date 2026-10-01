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
const tuftingOf = (seed: number): Random => mulberry32(seed ^ 0x70_f7_5e);
/** The ground's tufts of `stand` as a visit of `seed` grows them, and those that stand. */
function grassOf(stand: Stand, seed: number): [Sprout[], Sprout[]] {
  const grown = growTufts(stand.layout, [], tuftingOf(seed));
  return [grown, tendTufts(stand, grown)];
}

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
    const root = standingOn(stand.layout.camera, foot);
    if (Math.hypot(root.x - tuft.x, root.y - tuft.y) > 1e-6) {
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
 * flowers can leave no spot a flower can stand in sight off every cap and
 * finger pad, its head clear of every other.
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

describe('the ground’s grass', () => {
  for (const [name, width, height] of SCREENS) {
    it(`grows on the ${name} a lawn of \`mostTufts\` over the world, each on its own foot, the same from the same stream`, () => {
      const stand = opened(seedOf(0), width, height, false);
      const { camera } = stand.layout;
      const { world, groundTop, ground } = camera;
      const grown = growTufts(stand.layout, [], tuftingOf(1));
      assert.equal(grown.length, mostTufts(camera));
      assert.ok(grown.length >= (world / 1000) * 52 - 0.5);
      for (const { foot, tuft } of grown) {
        assert.ok(tuft.x >= 0 && tuft.x <= world);
        assert.ok(tuft.y >= groundTop && tuft.y <= groundTop + ground);
        const root = standingOn(camera, foot);
        assert.ok(Math.hypot(root.x - tuft.x, root.y - tuft.y) < 1e-6);
      }
      assert.deepEqual(growTufts(stand.layout, [], tuftingOf(1)), grown);
      const regrown = growTufts(stand.layout, grown, tuftingOf(2));
      assert.deepEqual(
        regrown.map(({ foot }) => foot),
        grown.map(({ foot }) => foot),
      );
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
          const heads = standingFlowers(
            layout,
            stand.flowers,
            stand.planted,
            stand.mushrooms,
          ).map(({ id, seed: grownFrom, place }) => {
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

  it('takes no second flower on a tuft planted, and stands nowhere once the world has no room, past the fourteen flowers a screen once held', () => {
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
      const tufting = tuftingOf(seed);
      let grown = growTufts(stand.layout, [], tufting);
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
        grown = growTufts(layout, grown, tufting);
        const drawn: Tuft[] = tendTufts({ ...stand, layout }, grown).map(
          ({ tuft }) => tuft,
        );
        const standing = standingFlowers(
          layout,
          stand.flowers,
          stand.planted,
          stand.mushrooms,
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
