import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  arc,
  cross,
  latLonToUnit,
  R,
  scaled,
  sum,
  unit,
  type Vec3,
} from '@/island/shared/globe';

import { COAST_STEEPEST, coastCutReach, detailedCoast } from './coast-detail';
import { stream } from './stream.test-kit';

const SEED = 11;
const DISC_METRES = 1_000_000;
const CENTRE = latLonToUnit({ lat: 0.3, lon: 0.2 });
const NORTH = unit(cross(cross(CENTRE, [0, 1, 0]), CENTRE));
const EAST = cross(NORTH, CENTRE);

/** A land cap 1 000 km around `CENTRE`, its coast the true distance. */
const field = (p: Vec3) => DISC_METRES - R * arc(p, CENTRE);
const coast = detailedCoast(field, SEED);

/** The point `r` metres from the centre along the ground, `angle` from east. */
function at(r: number, angle: number): Vec3 {
  const toward = sum(
    scaled(EAST, Math.cos(angle)),
    scaled(NORTH, Math.sin(angle)),
  );
  return unit(
    sum(scaled(CENTRE, Math.cos(r / R)), scaled(toward, Math.sin(r / R))),
  );
}

/** A point within `within` metres of the field's coast. */
function nearCoast(next: () => number, within: number): Vec3 {
  return at(DISC_METRES + within * (2 * next() - 1), 2 * Math.PI * next());
}

/** Where along the ray at `angle` the coast cut at `finest` crosses zero. */
function crossing(angle: number, finest: number): number {
  let land = DISC_METRES - 5000;
  let sea = DISC_METRES + 5000;
  for (let k = 0; k < 40; k += 1) {
    const middle = (land + sea) / 2;
    if (coast(at(middle, angle), finest) > 0) land = middle;
    else sea = middle;
  }
  return land;
}

describe('detailedCoast', () => {
  it('is a pure function of the seed and the place', () => {
    const next = stream(3);
    let differing = 0;
    for (let k = 0; k < 50; k += 1) {
      const p = nearCoast(next, 2000);
      assert.equal(coast(p), coast(p));
      assert.equal(coast(p, 300), detailedCoast(field, SEED)(p, 300));
      if (coast(p) !== detailedCoast(field, SEED + 1)(p)) differing += 1;
    }
    assert.equal(differing, 50);
  });

  it('leaves the distance far from the coast as the field has it', () => {
    for (const r of [0, 500_000, 980_000, 1_020_000, 1_500_000]) {
      for (let k = 0; k < 16; k += 1) {
        const p = at(r, (2 * Math.PI * k) / 16);
        assert.equal(coast(p), field(p), `${r} m from the centre`);
      }
    }
  });

  it('moves the coast by under 4 km, and by hundreds of metres', () => {
    const next = stream(5);
    let most = 0;
    for (let k = 0; k < 2000; k += 1) {
      const p = nearCoast(next, 1000);
      most = Math.max(most, Math.abs(coast(p) - field(p)));
    }
    // About a pixel from 820 km up, so Earth's coast holds from orbit.
    assert.ok(most < 4000, `${most} m`);
    assert.ok(most > 500, `${most} m`);
  });

  it('stands from the whole coast by no more than `coastCutReach`', () => {
    const next = stream(7);
    for (let k = 0; k < 5000; k += 1) {
      const p = nearCoast(next, 6000);
      const finest = 3 * 2 ** (13 * next());
      const off = Math.abs(coast(p, finest) - coast(p));
      assert.ok(off <= coastCutReach(finest), `${off} at cut ${finest}`);
    }
    assert.equal(coastCutReach(0), 0);
  });

  it('is the field itself at a cut past its longest bend', () => {
    const next = stream(9);
    for (let k = 0; k < 100; k += 1) {
      const p = nearCoast(next, 2000);
      assert.equal(coast(p, 20_000), field(p));
    }
  });

  it('is no steeper than `COAST_STEEPEST`, at every cut', () => {
    const next = stream(13);
    const step = 0.5;
    let steepest = 0;
    for (let k = 0; k < 4000; k += 1) {
      const r = DISC_METRES + 6000 * (2 * next() - 1);
      const angle = 2 * Math.PI * next();
      const finest = next() < 0.5 ? 0 : 3 * 2 ** (10 * next());
      // Along the coast and across it, each step half a metre of ground.
      const along = Math.abs(
        coast(at(r, angle + step / r), finest) - coast(at(r, angle), finest),
      );
      const across = Math.abs(
        coast(at(r + step, angle), finest) - coast(at(r, angle), finest),
      );
      steepest = Math.max(steepest, along / step, across / step);
    }
    assert.ok(steepest <= COAST_STEEPEST, `${steepest}`);
    assert.ok(steepest > 1.2, `${steepest}: no bend steeper than the field`);
  });

  it('has calm and rough stretches, the calm ones bending least', () => {
    let calm = 0;
    let rough = 0;
    const next = stream(15);
    for (let k = 0; k < 400; k += 1) {
      const share = coast.calm?.(nearCoast(next, 1000)) ?? -1;
      assert.ok(share >= 0 && share <= 1, `${share}`);
      if (share === 1) calm += 1;
      if (share === 0) rough += 1;
    }
    // A stretch is all one or the other on about a third of the coast each.
    assert.ok(calm > 60 && rough > 60, `${calm} calm, ${rough} rough`);
  });

  it('bends the coastline at every scale it is read at', () => {
    for (const [finest, span, least] of [
      [5000, 40_000, 50],
      [200, 1000, 2],
      [0, 40, 0.1],
    ] as const) {
      const shifts = Array.from({ length: 9 }, (_, k) =>
        crossing(1 + (k * span) / 8 / DISC_METRES, finest),
      );
      const wander = Math.max(...shifts) - Math.min(...shifts);
      assert.ok(wander > least, `cut ${finest}: ${wander} m over ${span} m`);
    }
  });
});
