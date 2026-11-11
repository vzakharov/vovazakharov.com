import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DROP, HOLE_SIDE } from '@/cube/entities/world';

import { BODY_RADIUS } from './body';
import {
  dipAt,
  feetAt,
  HOP_TIME,
  hopAt,
  intoShaft,
  LAND_AT,
  LAND_SPEED,
  LANDING_TIME,
  onHole,
  SHAFT_STRAY,
} from './fall';
import { SMALL } from './shrink';

const quarter = { qx: 1, qy: 0 } as const;
const middle = { u: 0.75, v: 0.25 };

describe('the hop', () => {
  it('leaves the slab, is back level at HOP_TIME, and reaches the slab below at LAND_AT', () => {
    assert.equal(feetAt(0), 0);
    assert.ok(feetAt(HOP_TIME / 2) > 0.01);
    assert.ok(Math.abs(feetAt(HOP_TIME)) < 1e-12);
    assert.ok(feetAt(LAND_AT - 0.01) > -DROP);
    assert.ok(Math.abs(feetAt(LAND_AT) + DROP) < 1e-12);
    assert.equal(feetAt(LAND_AT + 1), -DROP);
    const slope = (feetAt(LAND_AT) - feetAt(LAND_AT - 1e-6)) / 1e-6;
    assert.ok(Math.abs(slope + LAND_SPEED) < 1e-4);
  });

  it('takes a small body, not a whole one, and only at the hole', () => {
    assert.ok(2 * BODY_RADIUS * SMALL < HOLE_SIDE);
    assert.ok(2 * BODY_RADIUS > HOLE_SIDE);
    assert.ok(SHAFT_STRAY > 0);
    assert.ok(onHole(middle, quarter));
    assert.ok(onHole({ ...middle, u: middle.u - HOLE_SIDE / 2 }, quarter));
    const off = HOLE_SIDE / 2 + BODY_RADIUS * SMALL;
    assert.ok(!onHole({ ...middle, u: middle.u - off }, quarter));
    assert.ok(!onHole({ ...middle, v: middle.v + off }, quarter));
    assert.ok(!onHole({ u: 0.25, v: 0.25 }, quarter));
  });

  it('carries the body from where it stood into the shaft by the time it is level', () => {
    const from = { u: middle.u - 0.05, v: middle.v + 0.005 };
    const to = intoShaft(from, quarter);
    assert.ok(Math.abs(to.u - (middle.u - SHAFT_STRAY)) < 1e-12);
    assert.equal(to.v, from.v);
    assert.deepEqual(hopAt(from, to, 0), from);
    assert.deepEqual(hopAt(from, to, HOP_TIME), to);
    assert.deepEqual(hopAt(from, to, LAND_AT), to);
    assert.deepEqual(intoShaft(middle, quarter), middle);
  });
});

describe('the landing', () => {
  it('dips fast and straightens slowly, level at both ends', () => {
    assert.equal(dipAt(0), 0);
    assert.ok(dipAt(LANDING_TIME) < 1e-12);
    const dips = Array.from({ length: 101 }, (_, i) =>
      dipAt((i / 100) * LANDING_TIME),
    );
    const deepest = Math.max(...dips);
    assert.ok(deepest > 0.2 && deepest < 0.5);
    assert.ok(dips.indexOf(deepest) < 40, 'before the middle');
  });
});
