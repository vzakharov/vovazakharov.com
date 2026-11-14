import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { crestOf, shoreClock, turnsAt, WAKE_AT } from '@/cube/entities/island';
import type { Pose } from '@/cube/entities/world';

import { heardFrom, SOUNDING_ISLAND } from './island';
import { type Ears, OPEN_AIR } from './mix';
import { type Stretch, surfAt } from './shore';

const both = ({ leftEar, rightEar }: Ears): number =>
  Math.hypot(leftEar, rightEar);

/** An eye in the middle of a room on floor `n`, facing `yaw`. */
const inside = (n: number, yaw = 0, u = 0.5): Pose => ({
  n,
  x: 0n,
  y: 0n,
  u,
  v: 0.5,
  yaw,
  elevation: 0,
  scale: 1,
  eyeAbove: 0.4,
});

/** An eye over the waking spot, facing `yaw`. */
const awake = (yaw: number) => ({
  eye: [WAKE_AT[0], 1.6, WAKE_AT[2]] as const,
  yaw,
  elevation: 0,
  roll: 0,
});

/** How hard the water is breaking over `stretch`'s bar, `seconds` into the hour. */
const breakingAt = (stretch: Stretch, seconds: number): number =>
  surfAt(SOUNDING_ISLAND.coast, stretch, seconds).breaking;

describe('the island', () => {
  it('has a shore all the way round the cube', () => {
    assert.equal(SOUNDING_ISLAND.coast.shore.length, 32);
    assert.ok(SOUNDING_ISLAND.coast.swing.atShore > 1e-3);
  });

  it('breaks a wave when the sea says that wave arrives', () => {
    // The stretch that faces the swell: where the surf is a surf at all.
    let facing = SOUNDING_ISLAND.coast.shore[0];
    assert.ok(facing);
    for (const other of SOUNDING_ISLAND.coast.shore) {
      if (breakingAt(other, 4) > breakingAt(facing, 4)) facing = other;
    }
    const { tau } = shoreClock(facing.breaks, 0);
    const first = Math.ceil(turnsAt(tau));
    let broke = 0;
    for (let n = first; n < first + 8; n += 1) {
      // The wave the sea draws arriving is the wave the ear hears break.
      const crest = crestOf(n) - tau;
      if (breakingAt(facing, crest) < 0.2) continue;
      broke += 1;
      assert.ok(
        breakingAt(facing, crest) > breakingAt(facing, crest - 1.5),
        `the crest at ${crest.toFixed(2)} s is not the louder moment`,
      );
    }
    // Lulls pass without breaking; most of the eight waves do break.
    assert.ok(broke >= 4, `only ${broke} of 8 waves broke`);
  });
});

describe('heardFrom', () => {
  it('is the open air on the beach, the surf loud and the hum faint', () => {
    const mix = heardFrom(SOUNDING_ISLAND, awake(0), 100);
    assert.ok(mix);
    assert.equal(mix.muffle, OPEN_AIR);
    assert.ok(both(mix.layers.hum) > 0);
    assert.ok(both(mix.layers.hum) < 0.2);
  });

  it('has no sea and no wind indoors, wherever in the room', () => {
    for (const [u, yaw] of [
      [0.95, 0],
      [0.05, Math.PI / 2],
    ] as const) {
      const mix = heardFrom(SOUNDING_ISLAND, inside(1, yaw, u), 100);
      assert.ok(mix);
      assert.ok(mix.muffle < OPEN_AIR);
      assert.equal(both(mix.layers.wash), 0);
      assert.equal(both(mix.layers.wind), 0);
      assert.equal(both(mix.layers.hum), 0);
    }
  });

  it('hums on the floors below the hall, fainter on each, and is gone below the fourth', () => {
    const levels = [2, 3, 4].map((n) => {
      const mix = heardFrom(SOUNDING_ISLAND, inside(n), 100);
      assert.ok(mix);
      return both(mix.layers.hum);
    });
    for (const [n, level] of levels.entries()) {
      assert.ok(level > 0);
      if (n > 0) assert.ok(level < (levels[n - 1] ?? 0));
    }
    assert.equal(heardFrom(SOUNDING_ISLAND, inside(5), 100), null);
  });
});
