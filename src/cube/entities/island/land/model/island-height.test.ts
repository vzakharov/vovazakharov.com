import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { runInNewContext } from 'node:vm';

import { assemble } from '@/cube/shared/shader';

import { ISLAND_HEIGHT, islandHeight } from './island-height';
import { ISLAND } from './island-height-numbers';

type Xz = { x: number; y: number };

type Point = readonly [number, number];

/**
 * The linked WGSL read as JavaScript: its scalar arithmetic is the same in
 * both once the types are taken off, so the shader's body can be run here.
 */
function wgslHeight(): (xz: Xz) => number {
  const script = assemble([ISLAND_HEIGHT])
    .replaceAll(/^\/{3}.*$/gm, '')
    .replaceAll(
      /\bfn (\w+)\(([^)]*)\) -> f32/g,
      (_, name: string, parameters: string) =>
        `function ${name}(${parameters.replaceAll(/: \w+/g, '')})`,
    );
  const { abs, atan2, cos, exp, log, max, sqrt, tanh } = Math;
  const context = {
    abs,
    atan2,
    cos,
    exp,
    log,
    max,
    sqrt,
    tanh,
    mix: (a: number, b: number, t: number) => a + (b - a) * t,
    clamp: (v: number, low: number, high: number) =>
      Math.min(Math.max(v, low), high),
    result: undefined as ((xz: Xz) => number) | undefined,
  };
  runInNewContext(`${script}\nresult = islandHeight;`, context);
  const { result } = context;
  if (result === undefined) throw new Error('No islandHeight in WGSL');
  return result;
}

/** Points across the island and well out to sea, the crest among them. */
const POINTS: readonly Point[] = [
  ...Array.from(
    { length: 400 },
    (_, index): Point => [
      ((index * 37) % 240) - 150,
      ((index * 53) % 170) - 85,
    ],
  ),
  [0, 0],
  // Where a sea reaching for the horizon asks for its bed.
  [40_000, -3000],
  [-900, 200_000],
];

/** The shore's distance from the crest along `bearing`, by bisection. */
function shoreAlong(bearing: number): number {
  let dry = 0;
  let wet = 120;
  for (let step = 0; step < 40; step += 1) {
    const middle = (dry + wet) / 2;
    const h = islandHeight([
      middle * Math.cos(bearing),
      middle * Math.sin(bearing),
    ]);
    if (h > 0) dry = middle;
    else wet = middle;
  }
  return dry;
}

describe("the island's shape", () => {
  it('the WGSL body says what the TypeScript one does', () => {
    const inShader = wgslHeight();
    for (const [x, z] of POINTS) {
      const here = islandHeight([x, z]);
      assert.ok(
        Math.abs(inShader({ x, y: z }) - here) < 1e-9,
        `at (${x}, ${z}): ${inShader({ x, y: z })} against ${here}`,
      );
    }
  });

  it('stays finite out to the horizon, where a shader asks for the bed', () => {
    const inShader = wgslHeight();
    for (const far of [1e3, 2e4, 1e5]) {
      for (const [x, z] of [
        [far, 0],
        [-far, far],
        [0, -far],
      ] as const) {
        assert.ok(Number.isFinite(islandHeight([x, z])));
        assert.ok(Number.isFinite(inShader({ x, y: z })));
      }
    }
  });

  it('the crest is under the cube and nothing stands higher', () => {
    assert.ok(Math.abs(islandHeight([0, 0]) - ISLAND.crest) < 1e-12);
    for (const [x, z] of POINTS) {
      assert.ok(islandHeight([x, z]) <= ISLAND.crest + 0.15);
    }
  });

  it('the island is some 90 m by 50 m, the cube toward its east end', () => {
    const east = shoreAlong(0);
    const south = shoreAlong(Math.PI / 2);
    const west = shoreAlong(Math.PI);
    const north = shoreAlong(-Math.PI / 2);
    assert.ok(east + west > 82 && east + west < 96, `${east + west} m long`);
    assert.ok(
      north + south > 44 && north + south < 54,
      `${north + south} m wide`,
    );
    assert.ok(east < 26 && west > 58);
  });

  it('the waterline is about 30 m to the south-west of the cube', () => {
    const reach = shoreAlong((3 * Math.PI) / 4);
    assert.ok(reach > 27 && reach < 32, `${reach} m`);
  });

  it('no slope is too steep to walk and the bed keeps falling seaward', () => {
    const step = 0.25;
    for (const [x, z] of POINTS) {
      const here = islandHeight([x, z]);
      const rise = Math.hypot(
        islandHeight([x + step, z]) - here,
        islandHeight([x, z + step]) - here,
      );
      assert.ok(rise / step < 0.3, `slope ${rise / step} at (${x}, ${z})`);
    }
    for (let turn = 0; turn < 24; turn += 1) {
      const bearing = (turn / 24) * 2 * Math.PI;
      const shore = shoreAlong(bearing);
      let last = 0;
      for (let out = 2; out < 300; out += 4) {
        const h = islandHeight([
          (shore + out) * Math.cos(bearing),
          (shore + out) * Math.sin(bearing),
        ]);
        assert.ok(
          h < last,
          `the bed rises ${out} m off the shore at ${bearing}`,
        );
        last = h;
      }
    }
  });
});
