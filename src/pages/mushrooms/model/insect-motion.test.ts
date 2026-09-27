import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DRINKING,
  firstFlight,
  type Flight,
  flightAway,
  FLYING,
} from './flight';
import type { Point } from './geometry';
import {
  bodyTurn,
  carriedFrom,
  drinkDip,
  drinking,
  flightPoint,
  flyingTurn,
  heading,
  LANDING,
  landingBob,
  MAX_TILT,
  type Path,
  proboscis,
  REST_LEAN,
  restTurn,
  type Stay,
  tilt,
  turned,
  type Turns,
  wingBeat,
  wrap,
} from './insect-motion';
import { ticked } from './insects';
import { between, mulberry32, type Random } from './random';

/** A leg with its stay, flown from one point to another. */
type Flown = Path & Stay;

const PATH: Flown = {
  start: { x: -40, y: 120 },
  end: { x: 300, y: 260 },
  departs: 1000,
  arrives: 3000,
  leaves: 8000,
  to: { kind: 'cap', id: 'cap' },
  launch: 0,
  speed: 0,
  drink: 0,
};
const PHASES = [0, 0.7, 2, 3.5, 5.9];
const flier = (phase: number) => ({ phase, flutter: 12 });
const times = (from: number, to: number, step: number) =>
  Array.from(
    { length: Math.floor((to - from) / step) + 1 },
    (_, index) => from + index * step,
  );

describe('flightPoint', () => {
  it('starts exactly at the start and ends exactly at the end', () => {
    for (const phase of PHASES) {
      assert.deepEqual(
        flightPoint(PATH, PATH.departs, flier(phase)),
        PATH.start,
      );
      assert.deepEqual(flightPoint(PATH, 0, flier(phase)), PATH.start);
      assert.deepEqual(flightPoint(PATH, PATH.arrives, flier(phase)), PATH.end);
      assert.deepEqual(flightPoint(PATH, 99_999, flier(phase)), PATH.end);
    }
  });

  it('comes in to the end without a jump', () => {
    for (const phase of PHASES) {
      const near = flightPoint(PATH, PATH.arrives - 16, flier(phase));
      const gap = Math.hypot(near.x - PATH.end.x, near.y - PATH.end.y);
      assert.ok(gap < 3, `gap ${String(gap)} a frame before landing`);
    }
  });

  it('moves little from one frame to the next, all the way', () => {
    for (const phase of PHASES) {
      let last = flightPoint(PATH, PATH.departs - 16, flier(phase));
      for (const now of times(PATH.departs, PATH.arrives + 64, 16)) {
        const here = flightPoint(PATH, now, flier(phase));
        assert.ok(Math.hypot(here.x - last.x, here.y - last.y) < 12);
        last = here;
      }
    }
  });

  it('bows off the straight line mid-flight', () => {
    const mid = flightPoint(PATH, 2000, { phase: 0, flutter: 0 });
    const straight = { x: 130, y: 190 };
    assert.ok(Math.hypot(mid.x - straight.x, mid.y - straight.y) > 20);
  });

  it('stays put on a flight to where it already is', () => {
    const still = { ...PATH, end: PATH.start };
    const here = flightPoint(still, 2000, { phase: 1, flutter: 0 });
    assert.deepEqual(here, PATH.start);
  });
});

describe('heading and tilt', () => {
  it('faces the way the curve goes, and lands facing the way it came', () => {
    const toward = Math.atan2(140, 340);
    for (const phase of PHASES) {
      const off = heading(PATH, PATH.departs, { phase });
      const on = heading(PATH, PATH.arrives, { phase });
      assert.ok(Math.abs(off - toward) < 1 && Math.abs(on - toward) < 1);
      assert.notEqual(off, on);
    }
  });

  it('banks into the turn mid-flight and is level at both ends', () => {
    for (const phase of PHASES) {
      assert.equal(Math.abs(tilt(PATH, PATH.departs, { phase })), 0);
      assert.ok(Math.abs(tilt(PATH, PATH.arrives, { phase })) < 1e-9);
      const mid = tilt(PATH, 2000, { phase });
      assert.ok(Math.abs(Math.abs(mid) - MAX_TILT) < 1e-9);
    }
  });
});

/** How far the wings swing between `from` and `to`. */
function swing(from: number, to: number, path = PATH): number {
  const beats = times(from, to, 5).map((now) =>
    wingBeat(path, now, { phase: 0 }),
  );
  return Math.max(...beats) - Math.min(...beats);
}

describe('wingBeat', () => {
  const all = times(0, 8000, 7);

  it('stays between closed and open', () => {
    for (const phase of PHASES) {
      for (const now of all) {
        const open = wingBeat(PATH, now, { phase });
        assert.ok(open >= 0 && open <= 1, `open ${String(open)}`);
      }
    }
  });

  it('beats fast in the air and slowly at rest', () => {
    assert.ok(swing(2000, 2200) > 0.9);
    assert.ok(swing(5000, 5200) < 0.3);
  });

  it('never jumps, at take-off, at landing or between', () => {
    for (const phase of PHASES) {
      for (const now of times(PATH.departs - 300, PATH.arrives + 700, 1)) {
        const step = Math.abs(
          wingBeat(PATH, now + 1, { phase }) - wingBeat(PATH, now, { phase }),
        );
        assert.ok(step < 0.05, `step ${String(step)} at ${String(now)}`);
      }
    }
  });
});

describe('landingBob', () => {
  it('dips after landing and is 0 before and after, without a jump', () => {
    assert.equal(landingBob(PATH, PATH.arrives - 1), 0);
    assert.equal(landingBob(PATH, PATH.arrives), 0);
    assert.ok(landingBob(PATH, PATH.arrives + LANDING / 4) > 0);
    assert.equal(landingBob(PATH, PATH.arrives + LANDING), 0);
    for (const now of times(
      PATH.arrives - 50,
      PATH.arrives + LANDING + 50,
      1,
    )) {
      const step = Math.abs(landingBob(PATH, now + 1) - landingBob(PATH, now));
      assert.ok(step < 0.01);
    }
  });
});

/** A perch somewhere on a tall screen, swaying a few pixels about its place. */
function swaying(random: Random): (now: number) => Point {
  const place = { x: between(random, 0, 400), y: between(random, 0, 800) };
  const phase = between(random, 0, Math.PI * 2);
  return (now) => ({
    x: place.x + 4 * Math.sin(now / 700 + phase),
    y: place.y + 3 * Math.cos(now / 900 + phase),
  });
}

/**
 * A butterfly's body turn every 16 ms over a run of legs between swaying
 * perches, the last one away, set frame by frame as `InsectView` sets it:
 * each leg starts where the last frame drew it, turned as it was then.
 */
function turnsOverLegs(seed: number): number[] {
  const random = mulberry32(seed);
  const phased = { phase: between(random, 0, Math.PI * 2), flutter: 12 };
  const rotations: number[] = [];
  let at = { x: -40, y: 300 };
  let sat: number | undefined;
  let facing = 0;
  let departs = 0;
  for (const index of [0, 1, 2, 3, 4]) {
    const away = index === 4;
    const perch = away ? () => ({ x: 480, y: 200 }) : swaying(random);
    const arrives = departs + between(random, FLYING[0], FLYING[1]);
    const leaves = away
      ? arrives
      : arrives + between(random, DRINKING[0], DRINKING[1]);
    const start = at;
    let turns: Turns | undefined;
    for (let now = departs; now < leaves || now === departs; now += 16) {
      const path: Path = {
        departs,
        arrives,
        launch: 0,
        speed: 0,
        drink: 0,
        start,
        end: perch(now),
      };
      const { end } = path;
      if (Math.hypot(end.x - start.x, end.y - start.y) > 1) {
        facing = heading(path, now, phased);
      }
      const flying = flyingTurn(facing, path, now, phased);
      turns = turned(turns, sat, path, now, flying, !away);
      const rotation = bodyTurn(path, now, flying, turns);
      rotations.push(rotation);
      at = flightPoint(path, now, phased);
      sat = rotation;
    }
    departs = leaves + 16 - ((leaves - departs) % 16);
  }
  return rotations;
}

describe('bodyTurn', () => {
  it('never spins: at most ~0.2 rad a frame, flying, landing, resting and taking off', () => {
    for (const seed of Array.from({ length: 60 }, (_, index) => index * 977)) {
      const rotations = turnsOverLegs(seed);
      for (const [index, rotation] of rotations.entries()) {
        const last = rotations[index - 1] ?? rotation;
        const step = Math.abs(wrap(rotation - last));
        assert.ok(
          step <= 0.2,
          `seed ${String(seed)}: ${String(step)} rad at frame ${String(index)}`,
        );
      }
    }
  });

  it('settles facing up the screen, give or take, however it came in', () => {
    const span = { departs: 0, arrives: 2000 };
    for (const landing of times(-3.14, 3.14, 0.01)) {
      const turns = turned(undefined, undefined, span, 2000, landing, true);
      const settled = bodyTurn(span, 5000, landing, turns);
      assert.ok(Math.abs(settled) <= REST_LEAN + 1e-9);
      assert.ok(Math.abs(wrap(settled - restTurn(landing))) < 1e-9);
    }
  });

  it('takes off turned the way it sat, and turns into its heading', () => {
    const span = { departs: 1000, arrives: 3000 };
    const turns = turned(undefined, 2.5, span, 1000, -2.9, true);
    assert.ok(Math.abs(wrap(bodyTurn(span, 1000, -2.9, turns) - 2.5)) < 1e-9);
    assert.ok(Math.abs(wrap(bodyTurn(span, 2000, -2.9, turns) + 2.9)) < 1e-9);
  });
});

/** A flight on `before` cut short at `cut` by `after`, as the view flies it. */
type Cut = { before: Flown; after: Flown; cut: number };

function pointAt({ before, after, cut }: Cut, now: number): Point {
  return flightPoint(now < cut ? before : after, now, flier(0));
}

function wingsAt({ before, after, cut }: Cut, now: number): number {
  return wingBeat(now < cut ? before : after, now, { phase: 0 });
}

function stepAt(flight: Cut, now: number, frame: number): number {
  const [here, next] = [pointAt(flight, now), pointAt(flight, now + frame)];
  return Math.hypot(next.x - here.x, next.y - here.y);
}

describe('a leg that cuts a flight short', () => {
  const butterfly = { id: 'b', kind: 'butterfly', seed: 4321 } as const;
  const first = firstFlight(
    butterfly,
    { caps: ['cap'], flowers: [], air: [], crowded: [] },
    0,
  );
  const cut = (first.leg.departs + first.leg.arrives) / 2;
  const before: Flown = {
    ...first.leg,
    launch: 0,
    speed: 0,
    drink: 0,
    start: { x: -40, y: 300 },
    end: { x: 200, y: 520 },
  };
  const cuts: Record<string, Flight> = {
    'sent away mid-flight': flightAway({ ...butterfly, ...first }, cut),
    'its cap gone mid-flight':
      ticked(
        [{ ...butterfly, ...first }],
        { caps: ['other'], flowers: [], air: [], crowded: [] },
        cut,
      )[0] ?? first,
  };

  for (const [name, { leg }] of Object.entries(cuts)) {
    const after: Flown = {
      ...leg,
      ...carriedFrom(before, cut),
      start: flightPoint(before, cut, flier(0)),
      end: { x: 480, y: 200 },
    };
    const flight = { before, after, cut };

    it(`flies on without a jump when ${name}`, () => {
      assert.equal(leg.departs, cut);
      assert.equal(after.launch, 1);
      assert.equal(after.speed, 1);
      for (const now of times(cut - 5, cut + 5, 1)) {
        assert.ok(stepAt(flight, now, 1) < 1);
        assert.ok(
          Math.abs(wingsAt(flight, now + 1) - wingsAt(flight, now)) < 0.05,
        );
      }
    });

    it(`does not stop dead when ${name}`, () => {
      assert.ok(stepAt(flight, cut, 16) > stepAt(flight, cut - 16, 16) / 4);
      assert.ok(swing(cut, cut + 200, after) > 0.9);
    });
  }
});

const DRUNK_AT = { kind: 'flower', id: 'flower-4' } as const;
const FLOWER: Flown = { ...PATH, to: DRUNK_AT };

/** The largest change in `value` from one ms to the next between `from` and `to`. */
function largestStep(
  value: (now: number) => number,
  from: number,
  to: number,
): number {
  return Math.max(
    ...times(from, to, 1).map((now) => Math.abs(value(now + 1) - value(now))),
  );
}

describe('drinking and proboscis', () => {
  it('drinks at a flower, from after landing until just before leaving', () => {
    assert.equal(drinking(FLOWER, FLOWER.arrives), 0);
    assert.equal(proboscis(FLOWER, FLOWER.arrives - 500), 0);
    assert.equal(drinking(FLOWER, 5000), 1);
    assert.ok(proboscis(FLOWER, 5000) > 0.8);
    assert.equal(drinking(FLOWER, FLOWER.leaves), 0);
    assert.equal(proboscis(FLOWER, FLOWER.leaves + 100), 0);
    const step = largestStep((now) => proboscis(FLOWER, now), 0, 9000);
    assert.ok(step < 0.01, `step ${String(step)}`);
  });

  it('never drinks on a cap, whose rest is the slow open and close', () => {
    for (const now of times(0, 9000, 7)) {
      assert.equal(drinking(PATH, now), 0);
      const rest =
        1 - 0.7 * (0.5 - 0.5 * Math.cos((Math.PI * 2 * now) / 2600 + 1));
      const settled = now > PATH.arrives + 500;
      if (settled) assert.equal(wingBeat(PATH, now, { phase: 1 }), rest);
    }
  });

  it('holds its wings half shut while drinking', () => {
    const drinkSwing = times(5000, 7000, 5).map((now) =>
      wingBeat(FLOWER, now, { phase: 0 }),
    );
    assert.ok(Math.max(...drinkSwing) <= 0.6 + 1e-9);
    assert.ok(swing(5000, 7600) > 0.6);
  });

  it('curls up without a jump when a drink is cut short', () => {
    const cut = 5000;
    const after: Flown = {
      ...PATH,
      ...carriedFrom(FLOWER, cut),
      departs: cut,
      arrives: cut + 2000,
      leaves: cut + 8000,
    };
    const reach = (now: number) =>
      now < cut ? proboscis(FLOWER, now) : proboscis(after, now);
    assert.equal(after.drink, 1);
    assert.ok(largestStep(reach, cut - 50, cut + 600) < 0.01);
    assert.equal(reach(cut + 500), 0);
    const wings = (now: number) =>
      wingBeat(now < cut ? FLOWER : after, now, { phase: 0 });
    assert.ok(largestStep(wings, cut - 50, cut + 50) < 0.05);
  });
});

describe('drinkDip', () => {
  const hop = { ...FLOWER, from: { kind: 'flower', id: 'flower-9' } } as const;
  const next = {
    ...hop,
    from: DRUNK_AT,
    to: { kind: 'cap', id: 'cap' },
    departs: hop.leaves,
    arrives: hop.leaves + 2000,
    leaves: hop.leaves + 9000,
  } as const;
  const dipAt = (now: number) =>
    (now < next.departs ? drinkDip(hop, now) : drinkDip(next, now))?.dip ?? 0;

  it('leaves the flower alone while no butterfly is on it', () => {
    assert.equal(drinkDip({ ...PATH, from: PATH.to }, 5000), undefined);
    assert.equal(drinkDip(next, next.departs + 1200), undefined);
  });

  it('sags under the butterfly while it drinks, and springs back as it leaves', () => {
    assert.equal(drinkDip(hop, hop.arrives)?.dip, 0);
    assert.equal(drinkDip(hop, 5000)?.id, DRUNK_AT.id);
    assert.ok(Math.abs((drinkDip(hop, 5000)?.dip ?? 0) - 0.18) < 1e-3);
    assert.equal(drinkDip(next, next.departs)?.id, DRUNK_AT.id);
    assert.ok((drinkDip(next, next.departs + 220)?.dip ?? 0) < 0);
    assert.ok(largestStep(dipAt, hop.arrives - 50, next.departs + 1300) < 0.01);
  });

  it('flickers its petals as the butterfly leaves, and only then', () => {
    assert.equal(drinkDip(hop, 5000)?.flicker, 0);
    assert.equal(drinkDip(next, next.departs)?.flicker, 0);
    const flicker = (now: number) => drinkDip(next, now)?.flicker ?? 0;
    const most = Math.max(
      ...times(next.departs, next.departs + 300, 5).map((now) => flicker(now)),
    );
    assert.ok(most > 0.05);
    assert.ok(largestStep(flicker, next.departs, next.departs + 1300) < 0.01);
  });
});
