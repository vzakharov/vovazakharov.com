import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { FLIGHT_HABITS, type Perch, type Perches, type Places } from './flight';
import { CLUMP_DISTANCE } from './ground';
import type { InsectKind } from './insect-genes';
import { type Flier, released, startled, type Swarm, ticked } from './insects';
import { perchName } from './perch-room';
import {
  dashesForCover,
  LINGER_MS,
  lingerOf,
  nearestShelter,
  shelteredPerches,
  type Showered,
  stayingDry,
} from './shelter';
import type { Rain } from './weather';

/** Where a perch stands, `x` butterfly sizes along one line at the clump's depth. */
const at = (x: number) => ({ x, y: 0, fromEye: CLUMP_DISTANCE });

const SHELTERS = [
  { id: 'm1', seat: 0 },
  { id: 'm1', seat: 1 },
  { id: 'm2', seat: 0 },
] as const;

const PLACES: Places = {
  'flower f1': at(10),
  'flower f2': at(11),
  'cap m1': at(1.5),
  'cap m2': at(6),
  'shelter m1 0': at(1),
  'shelter m1 1': at(2),
  'shelter m2 0': at(6),
  'air a1': at(4),
  'air a2': at(8),
  'air a3': at(12),
};

/** The dry sight before the scene sights shelters. */
const DRY: Perches = {
  flowers: ['f1', 'f2'],
  caps: ['m1', 'm2'],
  spotted: [],
  air: ['a1', 'a2', 'a3'],
  crowded: [],
  room: [],
  places: PLACES,
};
const SIGHT: Perches = { ...DRY, shelters: SHELTERS };

const RAIN: Rain = { startedAt: 20_000, stopsAt: 30_000 };

const shelter = (id: string, seat: 0 | 1): Perch => ({
  kind: 'shelter',
  id,
  seat,
});

/** A swarm with one of `kinds` released at 0 each, in the dry, and ticked dry until `until`. */
function drySwarm(kinds: readonly InsectKind[], until: number): Swarm {
  let swarm: Swarm = { insects: [], planted: [] };
  for (const [index, kind] of kinds.entries()) {
    const insect = { id: `${kind}-${String(index)}`, seed: 11 + index, kind };
    swarm = released(swarm, insect, SIGHT, 0);
  }
  for (let now = 0; now < until; now += 100) swarm = ticked(swarm, SIGHT, now);
  return swarm;
}

/** A flier of seed 5 under a cap from the shower's start, its stay ending at `leaves`. */
const under = (leaves: number) => ({
  seed: 5,
  legs: 3,
  leg: {
    from: { kind: 'air', id: 'a1' } as const,
    to: shelter('m1', 0),
    departs: RAIN.startedAt,
    arrives: RAIN.startedAt + 1000,
    leaves,
  },
});

const one = (swarm: Swarm): Flier => {
  const [first] = swarm.insects;
  assert.ok(first);
  return first;
};

describe('shelteredPerches', () => {
  it('leaves the perches as they are while dry, and where the scene sights no shelter', () => {
    assert.equal(shelteredPerches(SIGHT, undefined, 0), SIGHT);
    assert.equal(shelteredPerches(SIGHT, RAIN, RAIN.stopsAt), SIGHT);
    assert.equal(shelteredPerches(DRY, RAIN, RAIN.startedAt), DRY);
  });

  it('withdraws every flower and cap top while it rains, keeping the shelters and the air', () => {
    const wet = shelteredPerches(
      { ...SIGHT, beeFlowers: ['f1'] },
      RAIN,
      RAIN.startedAt,
    );
    assert.deepEqual(
      [wet.flowers, wet.beeFlowers, wet.caps, wet.spotted],
      [[], [], [], []],
    );
    assert.deepEqual(
      [wet.shelters, wet.air, wet.raining],
      [SHELTERS, DRY.air, true],
    );
  });
});

describe('nearestShelter', () => {
  const from: Perch = { kind: 'flower', id: 'f1' };

  it('takes the open seat nearest where the insect is, the same every time', () => {
    const blocked = new Set<string>();
    const near = nearestShelter({ from, perches: SIGHT, blocked });
    assert.deepEqual(near, shelter('m2', 0));
    const past = new Set([perchName(shelter('m2', 0))]);
    const next = nearestShelter({ from, perches: SIGHT, blocked: past });
    assert.deepEqual(next, shelter('m1', 1));
  });

  it('never the seat it leaves, and none with every seat blocked', () => {
    const leaving = shelter('m2', 0);
    const blocked = new Set<string>();
    const other = nearestShelter({ from: leaving, perches: SIGHT, blocked });
    assert.deepEqual(other, shelter('m1', 1));
    const all = new Set(
      SHELTERS.map((seat) => perchName({ kind: 'shelter', ...seat })),
    );
    assert.equal(
      nearestShelter({ from, perches: SIGHT, blocked: all }),
      undefined,
    );
  });

  it('takes the first sighted where nothing is placed', () => {
    const perches = { ...SIGHT, places: undefined };
    const first = nearestShelter({ from, perches, blocked: new Set() });
    assert.deepEqual(first, shelter('m1', 0));
  });
});

describe('lingerOf', () => {
  it('is within `LINGER_MS`, the same for a seed, and differs between seeds', () => {
    const lingers = Array.from({ length: 50 }, (_, seed) => lingerOf({ seed }));
    for (const linger of lingers) {
      assert.ok(linger >= LINGER_MS[0] && linger <= LINGER_MS[1]);
    }
    assert.equal(lingerOf({ seed: 3 }), lingerOf({ seed: 3 }));
    assert.ok(new Set(lingers).size > 40);
  });
});

describe('dashesForCover', () => {
  const wet = shelteredPerches(SIGHT, RAIN, RAIN.startedAt);
  const leg = {
    departs: RAIN.startedAt - 1,
    to: { kind: 'air', id: 'a1' },
  } as const;

  it('sends a leg set off before the shower, once it falls', () => {
    assert.ok(dashesForCover(leg, RAIN, wet));
    assert.ok(!dashesForCover(leg, RAIN, SIGHT));
    assert.ok(!dashesForCover({ ...leg, departs: RAIN.startedAt }, RAIN, wet));
    assert.ok(!dashesForCover({ ...leg, to: shelter('m1', 0) }, RAIN, wet));
  });
});

describe('stayingDry', () => {
  it('stretches a stay under a cap to the stop and the flier’s linger', () => {
    const [stayed] = stayingDry(
      [under(RAIN.startedAt + 1000)],
      RAIN,
      RAIN.startedAt,
    );
    assert.equal(stayed?.leg.leaves, RAIN.stopsAt + lingerOf({ seed: 5 }));
  });

  it('stretches it again for a shower lengthened, and keeps the array when nothing changes', () => {
    const [stayed] = stayingDry([under(0)], RAIN, RAIN.startedAt);
    assert.ok(stayed);
    const kept = [stayed];
    assert.equal(stayingDry(kept, RAIN, RAIN.startedAt + 500), kept);
    const longer = { ...RAIN, stopsAt: RAIN.stopsAt + 4000 };
    const [later] = stayingDry(kept, longer, RAIN.startedAt + 500);
    assert.equal(later?.leg.leaves, longer.stopsAt + lingerOf({ seed: 5 }));
    assert.equal(later.legs, 3);
  });

  it('changes nothing while dry', () => {
    const fliers = [under(0)];
    assert.equal(stayingDry(fliers, RAIN, RAIN.stopsAt), fliers);
    assert.equal(stayingDry(fliers, undefined, 0), fliers);
  });
});

describe('a shower over the swarm', () => {
  it('sends a sitter to the nearest shelter the moment it starts, at the kind’s shelter pace', () => {
    for (const kind of ['butterfly', 'fly', 'bee'] as const) {
      const dry = drySwarm([kind], RAIN.startedAt);
      const wet = ticked({ ...dry, rain: RAIN }, SIGHT, RAIN.startedAt);
      const { leg, legs } = one(wet);
      assert.equal(leg.to.kind, 'shelter', kind);
      assert.equal(leg.departs, RAIN.startedAt);
      assert.equal(legs, one(dry).legs + 1);
      const pace = FLIGHT_HABITS[kind].sheltering ?? FLIGHT_HABITS[kind];
      // No perch here stands farther than 6 sizes from its nearest shelter.
      const most = Math.max(pace.flying[1], (1000 * 6) / pace.cruising);
      assert.ok(leg.arrives - leg.departs <= most + 1e-6, kind);
      assert.equal(leg.leaves, RAIN.stopsAt + lingerOf(one(dry)));
    }
  });

  it('re-targets a flier mid-flight, and one hovering in the air', () => {
    const released0 = released(
      { insects: [], planted: [] },
      { id: 'b', seed: 4, kind: 'butterfly' },
      SIGHT,
      0,
    );
    const { leg } = one(released0);
    const mid = (leg.departs + leg.arrives) / 2;
    const rain = { startedAt: mid, stopsAt: mid + 10_000 };
    const wet = ticked({ ...released0, rain }, SIGHT, mid);
    assert.equal(one(wet).leg.to.kind, 'shelter');
    assert.equal(one(wet).leg.departs, mid);

    const airOnly = { ...SIGHT, flowers: [], caps: [] };
    const hovering = released(
      { insects: [], planted: [] },
      { id: 'b', seed: 4, kind: 'bee' },
      airOnly,
      0,
    );
    const hover = one(hovering).leg;
    assert.equal(hover.to.kind, 'air');
    const during = hover.arrives + 10;
    const shower = { startedAt: during, stopsAt: during + 10_000 };
    const sheltered = ticked({ ...hovering, rain: shower }, airOnly, during);
    assert.equal(one(sheltered).leg.to.kind, 'shelter');
  });

  it('dashes once a shower: a later tick, or a shower lengthened, sends no second leg', () => {
    const dry = drySwarm(['butterfly', 'fly'], RAIN.startedAt);
    let wet: Swarm = ticked({ ...dry, rain: RAIN }, SIGHT, RAIN.startedAt);
    const legs = wet.insects.map((each) => each.legs);
    const longer = { ...RAIN, stopsAt: RAIN.stopsAt + 5000 };
    for (let now = RAIN.startedAt; now < RAIN.stopsAt; now += 100) {
      wet = ticked({ ...wet, rain: now < 25_000 ? RAIN : longer }, SIGHT, now);
    }
    assert.deepEqual(
      wet.insects.map((each) => each.legs),
      legs,
    );
    for (const flier of wet.insects) {
      assert.equal(flier.leg.to.kind, 'shelter');
      assert.equal(flier.leg.leaves, longer.stopsAt + lingerOf(flier));
    }
  });

  it('roams the air with no shelter open, and keeps dry habits where the scene sights none', () => {
    const dry = drySwarm(['butterfly'], RAIN.startedAt);
    const none = { ...SIGHT, shelters: [] };
    const roaming = ticked({ ...dry, rain: RAIN }, none, RAIN.startedAt);
    assert.equal(one(roaming).leg.to.kind, 'air');
    const unsighted = {
      ...drySwarm(['butterfly'], RAIN.startedAt),
      rain: RAIN,
    };
    assert.equal(ticked(unsighted, DRY, RAIN.startedAt), unsighted);
  });

  it('lets each out after the stop, by its own linger, back to its habits', () => {
    const dry = drySwarm(['butterfly', 'fly', 'bee'], RAIN.startedAt);
    let swarm: Swarm & Showered = { ...dry, rain: RAIN };
    for (
      let now = RAIN.startedAt;
      now <= RAIN.stopsAt + LINGER_MS[1] + 100;
      now += 50
    ) {
      swarm = { ...ticked(swarm, SIGHT, now), rain: RAIN };
      for (const flier of swarm.insects) {
        const out = RAIN.stopsAt + lingerOf(flier);
        const sheltering = flier.leg.to.kind === 'shelter';
        assert.equal(sheltering, now < out, `${flier.kind} at ${String(now)}`);
      }
    }
  });

  it('flies a newcomer in the rain straight to a shelter, and a startled one to another', () => {
    const wet = released(
      { insects: [], planted: [], rain: RAIN },
      { id: 'b', seed: 9, kind: 'butterfly' },
      SIGHT,
      RAIN.startedAt + 1000,
    );
    const { leg } = one(wet);
    assert.equal(leg.to.kind, 'shelter');
    const now = leg.arrives + 100;
    const moved = startled({ ...wet, rain: RAIN }, 'b', SIGHT, now);
    const after = one(moved).leg;
    assert.equal(after.to.kind, 'shelter');
    assert.notDeepEqual(after.to, leg.to);
    assert.equal(after.leaves, RAIN.stopsAt + lingerOf({ seed: 9 }));
  });

  it('flies exactly as without shelters while dry', () => {
    const kinds = ['butterfly', 'fly', 'bee', 'butterfly'] as const;
    let plain: Swarm = { insects: [], planted: [] };
    let sighted: Swarm = { insects: [], planted: [] };
    for (const [index, kind] of kinds.entries()) {
      const insect = { id: `i${String(index)}`, seed: 30 + index, kind };
      plain = released(plain, insect, DRY, index * 500);
      sighted = released(sighted, insect, SIGHT, index * 500);
    }
    for (let now = 2000; now < 60_000; now += 100) {
      plain = ticked(plain, DRY, now);
      sighted = ticked({ ...sighted, rain: undefined }, SIGHT, now);
    }
    assert.deepEqual(sighted.insects, plain.insects);
  });
});
