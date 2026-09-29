import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Sight } from './flight';
import { type Action, firstMeadow, type Meadow, reduce } from './game';
import type { InsectKind } from './insect-genes';
import { type Flier, INSECT_LIMITS } from './insects';
import {
  type BeeSown,
  FLOWER_LIMIT,
  POLLEN_MOST,
  slotTaken,
  type Sown,
} from './pollen';
import { mulberry32 } from './random';

const SEEDED = ['flower-1', 'flower-2', 'flower-3', 'flower-4'];
const AIR = ['air-1', 'air-2', 'air-3', 'air-4', 'air-5', 'air-6'];
/** How many ring slots the scene would give a flower in this test's meadow. */
const RINGS = 6;

const opening = () => firstMeadow(mulberry32(1));

/**
 * What a scene would see of `meadow`: every flower in sight, seeded and
 * planted, and each with a slot left round it offering the lowest free one —
 * or, `cramped`, none.
 */
function sightOf(meadow: Meadow, cramped = false): Sight {
  const flowers = [...SEEDED, ...meadow.planted.map(({ id }) => id)];
  const free = (parent: string) =>
    Array.from({ length: RINGS }, (_, ring) => ring).find(
      (ring) => !slotTaken(meadow.planted, parent, ring),
    );
  return {
    flowers,
    air: AIR,
    crowded: [],
    room: cramped
      ? []
      : flowers.flatMap((flower) => {
          const ring = free(flower);
          return ring === undefined ? [] : [{ flower, ring }];
        }),
    seededFlowers: SEEDED.length,
  };
}

const release = (
  meadow: Meadow,
  insect: InsectKind,
  seed: number,
  now: number,
): Meadow =>
  reduce(meadow, { kind: 'release', insect, seed, now, ...sightOf(meadow) });

function tick(meadow: Meadow, now: number, cramped = false): Meadow {
  const action: Action = { kind: 'tick', now, ...sightOf(meadow, cramped) };
  return reduce(meadow, action);
}

/** How a run looks at each frame, and whether its scene offers no room to plant. */
type Watched = {
  each?: (before: Meadow, after: Meadow, now: number) => void;
  cramped?: boolean;
};

/** `meadow` ticked every 100 ms from `from` to `to`, `each` seeing every frame. */
function run(
  meadow: Meadow,
  [from, to]: readonly [number, number],
  { each, cramped = false }: Watched = {},
): Meadow {
  let state = meadow;
  for (let now = from; now <= to; now += 100) {
    const next = tick(state, now, cramped);
    each?.(state, next, now);
    state = next;
  }
  return state;
}

const leaving = (state: Meadow) =>
  state.insects.filter(({ leg }) => leg.to.kind === 'away');

/** The flowers of `planted` the bees planted: here, every one. */
const beeSown = (planted: readonly Sown[]): BeeSown[] =>
  planted.filter((each) => 'parent' in each);

function bees(count: number, seed: number): Meadow {
  let meadow = opening();
  for (let index = 0; index < count; index++) {
    meadow = release(meadow, 'bee', seed * 10 + index, index * 300);
  }
  return meadow;
}

const beeOf = (meadow: Meadow, id: string) =>
  meadow.insects.find(
    (each): each is Extract<Flier, { kind: 'bee' }> =>
      each.id === id && each.kind === 'bee',
  );

describe('the insects of every kind', () => {
  it('holds each kind to its own limit, evicting only that kind’s oldest', () => {
    let meadow = opening();
    let seed = 1;
    for (const kind of ['butterfly', 'fly', 'bee'] as const) {
      for (let count = 0; count < INSECT_LIMITS[kind]; count++) {
        meadow = release(meadow, kind, seed++, 0);
      }
    }
    assert.equal(leaving(meadow).length, 0);
    for (const kind of ['butterfly', 'fly', 'bee'] as const) {
      const after = release(meadow, kind, seed++, 10);
      const [gone, ...more] = leaving(after);
      assert.equal(more.length, 0);
      assert.equal(gone?.kind, kind);
      assert.equal(
        gone.id,
        meadow.insects.find((each) => each.kind === kind)?.id,
      );
    }
  });

  it('never sends two insects of any kinds to one perch', () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      let meadow = opening();
      for (const [index, kind] of (
        ['bee', 'fly', 'butterfly', 'bee', 'fly', 'butterfly', 'bee'] as const
      ).entries()) {
        meadow = release(meadow, kind, seed * 100 + index, index * 200);
      }
      run(meadow, [1500, 60_000], {
        each: (_, after) => {
          const perches = after.insects
            .filter(({ leg }) => leg.to.kind !== 'away')
            .map(({ leg: { to } }) => JSON.stringify(to));
          assert.equal(
            new Set(perches).size,
            perches.length,
            perches.join(' '),
          );
        },
      });
    }
  });

  it('hands back the same meadow from a tick with nothing due, bees and all', () => {
    const meadow = bees(3, 1);
    const due = Math.min(...meadow.insects.map(({ leg }) => leg.leaves));
    assert.equal(tick(meadow, due - 1), meadow);
    const moved = tick(meadow, due);
    assert.notEqual(moved, meadow);
    // A leg with no planting keeps the planted list itself.
    assert.equal(moved.planted, meadow.planted);
  });
});

describe('the bees’ planting', () => {
  it('plants a flower as a bee leaves one it pollinated, and only then', () => {
    let plantings = 0;
    const each = (before: Meadow, after: Meadow, now: number) => {
      const added = beeSown(after.planted.slice(before.planted.length));
      for (const planted of added) {
        plantings++;
        const leaver = after.insects.find(
          ({ leg }) =>
            leg.departs === now &&
            leg.from.kind === 'flower' &&
            leg.from.id === planted.parent,
        );
        assert.ok(
          leaver,
          `${planted.id} with no bee leaving ${planted.parent}`,
        );
        const was = beeOf(before, leaver.id);
        assert.ok(was?.pollen.pollinates === true);
        assert.ok(now >= was.leg.arrives);
      }
    };
    run(bees(3, 1), [1000, 90_000], { each });
    assert.ok(plantings > 0);
  });

  it('never plants past FLOWER_LIMIT, the seeded flowers counted, and fills to it', () => {
    const end = run(bees(3, 2), [1000, 400_000], {
      each: (_, after) => {
        assert.ok(SEEDED.length + after.planted.length <= FLOWER_LIMIT);
      },
    });
    assert.equal(SEEDED.length + end.planted.length, FLOWER_LIMIT);
  });

  it('rings planted flowers round planted ones too, each slot once', () => {
    const end = run(bees(3, 3), [1000, 400_000]);
    const planted = new Set(end.planted.map(({ id }) => id));
    assert.ok(beeSown(end.planted).some(({ parent }) => planted.has(parent)));
    const slots = beeSown(end.planted).map(
      ({ parent, ring }) => `${parent} ${String(ring)}`,
    );
    assert.equal(new Set(slots).size, slots.length);
  });

  it('never plants where the scene offers no room', () => {
    const end = run(bees(3, 1), [1000, 90_000], { cramped: true });
    assert.deepEqual(end.planted, []);
  });

  it('plants the same flowers on a replay of the same actions', () => {
    const first = run(bees(3, 4), [1000, 60_000]);
    const second = run(bees(3, 4), [1000, 60_000]);
    assert.deepEqual(first.planted, second.planted);
    assert.ok(first.planted.length > 0);
  });

  it('keeps each bee’s pollen between none and POLLEN_MOST, and gives no other kind any', () => {
    let meadow = bees(3, 5);
    meadow = release(meadow, 'fly', 9, 0);
    meadow = release(meadow, 'butterfly', 10, 0);
    run(meadow, [1000, 60_000], {
      each: (_, after) => {
        for (const insect of after.insects) {
          if (insect.kind !== 'bee') {
            assert.equal('pollen' in insect, false);
            continue;
          }
          const { specks } = insect.pollen;
          assert.ok(specks >= 0 && specks <= POLLEN_MOST);
        }
      },
    });
  });
});
