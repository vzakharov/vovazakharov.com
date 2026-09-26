import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  beckon,
  BECKON_DEPTH,
  BECKON_EASE,
  bloom,
  BLOOM_DURATION,
  breath,
  drift,
  emerge,
  EMERGE_DURATION,
  launch,
  LAUNCH_DURATION,
  shake,
  SHAKE_DURATION,
  sink,
  SINK_DURATION,
  sway,
  widthFor,
  wobble,
  WOBBLE_DEPTH,
  WOBBLE_DURATION,
  WOBBLE_REST,
} from './motion';

/** The wobble as a share of its deepest squash. */
const edge = (t: number) => Math.abs(wobble(t)) / WOBBLE_DEPTH;

const samples = (duration: number) =>
  Array.from({ length: 400 }, (_, index) => (index / 400) * duration);

describe('wobble', () => {
  it('squashes first, then bounces back through rest', () => {
    assert.ok(wobble(0) < 0);
    assert.ok(samples(WOBBLE_DURATION).some((t) => wobble(t) > 0));
  });

  it('dies away, and is nothing outside its span', () => {
    const early = Math.max(...samples(0.3).map((t) => Math.abs(wobble(t))));
    const late = Math.max(
      ...samples(0.3).map((t) => Math.abs(wobble(t + WOBBLE_DURATION - 0.3))),
    );
    assert.ok(late < early / 20);
    assert.equal(wobble(-0.1), 0);
    assert.equal(wobble(WOBBLE_DURATION), 0);
  });

  it('is still visible for most of its span, and gone once it ends', () => {
    // Two or three bounces over about a second: past a tenth of its depth
    // somewhere after 0.6 s.
    assert.ok(samples(0.4).some((t) => edge(t + 0.6) > 0.1));
    assert.ok(WOBBLE_DURATION > 1.2);
    // The span ends where the bounce reaches the rest line, so cutting it
    // there is a step too small to see.
    const tail = samples(0.05).map((t) => t + WOBBLE_DURATION - 0.05);
    assert.ok(tail.every((t) => edge(t) < WOBBLE_REST * 1.15));
  });
});

describe('bloom', () => {
  it('opens and settles back to rest', () => {
    assert.equal(bloom(0), 0);
    assert.ok(bloom(BLOOM_DURATION * 0.2) > 0.15);
    assert.ok(bloom(BLOOM_DURATION * 0.99) < 0.05);
    assert.equal(bloom(BLOOM_DURATION), 0);
  });
});

describe('the idle loops', () => {
  it('stay small and centred on rest', () => {
    for (const t of samples(20)) {
      assert.ok(Math.abs(breath(t, 1)) < 0.03);
      assert.ok(Math.abs(sway(t, 2)) <= 1);
    }
  });

  it('keep the volume through a squash', () => {
    for (const stretch of [-0.2, 0, 0.2]) {
      assert.ok(Math.abs((1 + stretch) * widthFor(stretch) ** 2 - 1) < 1e-9);
    }
  });
});

describe('drift', () => {
  it('wraps round its span, going either way', () => {
    assert.equal(drift(90, 20, 1, 100), 10);
    assert.equal(drift(10, -20, 1, 100), 90);
  });
});

describe('emerge', () => {
  it('grows from nothing, past full size, and settles at it', () => {
    assert.ok(Math.abs(emerge(0)) < 1e-9);
    assert.ok(samples(EMERGE_DURATION).some((t) => emerge(t) > 1.05));
    assert.ok(Math.abs(emerge(EMERGE_DURATION - 0.01) - 1) < 0.01);
    assert.equal(emerge(EMERGE_DURATION), 1);
  });

  it('never dips below the ground on the way', () => {
    assert.ok(samples(EMERGE_DURATION).every((t) => emerge(t) >= 0));
  });
});

describe('sink', () => {
  it('lifts a little, then goes down to nothing and stays there', () => {
    assert.equal(sink(0), 1);
    assert.ok(samples(SINK_DURATION).some((t) => sink(t) > 1));
    assert.ok(sink(SINK_DURATION - 0.01) < 0.1);
    assert.equal(sink(SINK_DURATION), 0);
  });
});

describe('shake', () => {
  it('goes to either side, each swing smaller, within one', () => {
    const swings = samples(SHAKE_DURATION).map((t) => shake(t));
    assert.ok(swings.some((x) => x > 0.5));
    assert.ok(swings.some((x) => x < -0.3));
    assert.ok(swings.every((x) => Math.abs(x) <= 1));
    const half = SHAKE_DURATION / 2;
    const reach = (from: number) =>
      Math.max(...samples(half).map((t) => Math.abs(shake(t + from))));
    assert.ok(reach(half) < reach(0));
  });

  it('starts and ends at rest, and is nothing outside its span', () => {
    assert.equal(shake(0), 0);
    assert.ok(Math.abs(shake(SHAKE_DURATION - 1e-3)) < 0.01);
    assert.equal(shake(-0.1), 0);
    assert.equal(shake(SHAKE_DURATION), 0);
  });
});

describe('launch', () => {
  it('pops past its size near where it stood, then shrinks away as it goes', () => {
    assert.deepEqual(launch(-0.1), { scale: 1, travel: 0 });
    assert.equal(launch(0).scale, 1);
    const popped = samples(LAUNCH_DURATION).find((t) => launch(t).scale > 1.15);
    assert.ok(popped !== undefined && launch(popped).travel < 0.2);
    assert.ok(launch(LAUNCH_DURATION - 0.01).scale < 0.1);
    assert.deepEqual(launch(LAUNCH_DURATION), { scale: 0, travel: 1 });
  });

  it('travels only forward, and never shrinks below nothing', () => {
    const travels = samples(LAUNCH_DURATION).map((t) => launch(t).travel);
    assert.ok(travels.every((x, index) => x >= (travels[index - 1] ?? 0)));
    assert.ok(samples(LAUNCH_DURATION).every((t) => launch(t).scale >= 0));
  });
});

describe('beckon', () => {
  const never = { litAt: -Infinity, unlitAt: -Infinity };
  const lit = { litAt: 10, unlitAt: Infinity };
  const letGo = { litAt: 10, unlitAt: 14 };

  it('is nothing for a mushroom never selected, or before its selection', () => {
    for (const t of samples(20)) assert.equal(beckon(t, never), 0);
    assert.equal(beckon(9, lit), 0);
  });

  it('swells taller and back, for as long as the selection holds', () => {
    const swells = samples(6).map((t) => beckon(t + 10 + BECKON_EASE, lit));
    assert.ok(swells.some((x) => x > BECKON_DEPTH * 0.9));
    assert.ok(swells.some((x) => x < -BECKON_DEPTH * 0.9));
    assert.ok(swells.every((x) => Math.abs(x) <= BECKON_DEPTH));
  });

  it('starts from rest, and dies out after a release, with no jump at either end', () => {
    assert.equal(beckon(10, lit), 0);
    const step = 1 / 60;
    for (const t of samples(6).map((x) => x + 9)) {
      const jump = Math.abs(beckon(t + step, letGo) - beckon(t, letGo));
      assert.ok(jump < BECKON_DEPTH * 0.2);
    }
    assert.equal(beckon(14 + BECKON_EASE, letGo), 0);
  });
});
