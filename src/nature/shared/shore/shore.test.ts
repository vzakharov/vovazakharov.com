import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { assemble, scalarWgsl } from '@/scene/shared/shader';

import {
  bore,
  crestOf,
  peaked,
  PERIOD,
  setsAt,
  turnsAt,
  WAVES,
} from '../swell/swell';
import { SHORE_CUSPED } from './shore-cusped';
import { cusped } from './shore-cusps';
import {
  brokenAt,
  sheetDepth,
  sheltered,
  shoreDelay,
  shoreDepth,
  shoreFacing,
  shoreSlowing,
  surfLevel,
  swellLevel,
} from './shore-level';
import { SHORE_LEVEL } from './shore-level.shader.generated';

const shader = scalarWgsl(assemble([SHORE_LEVEL, SHORE_CUSPED]));

/** A spread of arguments: times through the hour, beds from deep to dry. */
const TIMES = [0, 3.7, 211.25, 1799.9, 3333.3, 3599.99];
const BEDS = [-35, -6, -1.2, -0.4, -0.05, 0, 0.03, 0.2, 0.6];

const same = (name: string, expected: number, ...args: number[]): void => {
  const got = shader(name, ...args);
  assert.ok(
    Math.abs(got - expected) <= 1e-9 * Math.max(1, Math.abs(expected)),
    `${name}(${args.join(', ')}): shader ${String(got)}, script ${String(expected)}`,
  );
};

describe('the shore in WGSL', () => {
  it('times and shapes a wave as the script does', () => {
    for (const tau of TIMES) {
      same('turnsAt', turnsAt(tau), tau);
      same('setsAt', setsAt(tau), tau);
    }
    for (const n of [0, 1, 57, 419]) same('crestOf', crestOf(n), n);
    for (const phase of [0, 0.1, 0.5, 0.94, 0.99]) {
      same('bore', bore(phase), phase);
      for (const sharp of [0, 0.4, 0.75]) {
        same('peaked', peaked(phase, sharp), phase, sharp);
      }
    }
  });

  it('holds a wave up and turns it as the script does', () => {
    for (const bed of BEDS) {
      const depth = shoreDepth(bed);
      same('shoreDepth', depth, bed);
      same('shoreDelay', shoreDelay(depth), depth);
      same('shoreSlowing', shoreSlowing(depth), depth);
      for (const [along, steep] of [
        [0, 0],
        [0.08, 0.08],
        [-0.08, 0.1],
        [0.01, 0.12],
      ] as const) {
        same('shoreFacing', shoreFacing(along, steep, bed), along, steep, bed);
      }
    }
    for (const facing of [-1, -0.2, 0.3, 1]) {
      same('sheltered', sheltered(facing), facing);
    }
    for (const across of [-61.5, -3, 0, 7.25, 48]) {
      same('cusped', cusped(across), across);
    }
  });

  it('raises the surf, the sheet and the level as the script does', () => {
    for (const tau of TIMES) {
      for (const bed of BEDS) {
        for (const shelter of [0.3, 1]) {
          same('brokenAt', brokenAt(tau, bed, shelter), tau, bed, shelter);
          same('surfLevel', surfLevel(tau, bed, shelter), tau, bed, shelter);
          const n = Math.floor(turnsAt(tau));
          same(
            'sheetDepth',
            sheetDepth(n, tau, bed, shelter),
            n,
            tau,
            bed,
            shelter,
          );
          same(
            'swellLevel',
            swellLevel(12, bed, 0.8, 1.1, tau),
            12,
            bed,
            0.8,
            1.1,
            tau,
          );
        }
      }
    }
  });
});

describe('the swell', () => {
  it('lands a whole number of waves an hour, 7 to 10 seconds apart', () => {
    assert.ok(Math.abs(turnsAt(3600) - turnsAt(0) - WAVES) < 1e-9);
    let last = crestOf(0);
    for (let n = 1; n <= WAVES; n += 1) {
      const crest = crestOf(n);
      assert.ok(Math.abs(turnsAt(crest) - n) < 1e-4, `crest ${String(n)}`);
      const gap = crest - last;
      assert.ok(gap > 7 && gap < 10.4, `gap ${String(gap)} at ${String(n)}`);
      last = crest;
    }
    assert.ok(Math.abs(last - crestOf(0) - 3600) < 1e-3);
    assert.ok(Math.abs(PERIOD - 3600 / WAVES) < 1e-12);
  });

  it('comes in sets, never flat and never doubled', () => {
    let low = Infinity;
    let high = 0;
    for (let tau = 0; tau < 3600; tau += 1.7) {
      low = Math.min(low, setsAt(tau));
      high = Math.max(high, setsAt(tau));
    }
    assert.ok(low > 0.5 && low < 0.75, String(low));
    assert.ok(high > 1.3 && high < 1.5, String(high));
  });

  it('keeps a wave 2 tall from crest to trough however sharp', () => {
    for (const sharp of [0, 0.3, 0.75]) {
      const tall = peaked(0, sharp) - peaked(0.5, sharp);
      assert.ok(Math.abs(tall - 2) < 1e-9, String(tall));
    }
  });
});
