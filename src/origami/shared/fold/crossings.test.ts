import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { creaseLines, crossings, pierces } from './crossings.ts';
import type { Vec } from './geometry.ts';
import { over, project } from './proximity.ts';

const crease = (a: number, b: number) => ({
  a,
  b,
  c: 0,
  d: 0,
  crease: true,
  angle: 0,
  start: 0,
  rest: 1,
});

/** A triangle in the plane z = 0, and an edge from 3 to 4 through it. */
const TRIANGLE = [
  [0, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
];

describe('pierces', () => {
  it('sees a segment pass between a triangle’s vertices, its ends off it', () => {
    const x = Float64Array.from([
      ...TRIANGLE.flat(),
      -0.3,
      0.3,
      -0.1,
      0.9,
      0.3,
      0.1,
    ]);
    // Neither end stands over the triangle, so vertex contact alone misses it.
    const seen = new Float64Array(7);
    for (const end of [3, 4]) {
      assert.ok(project(x, end, 0, 1, 2, seen));
      assert.equal(over(seen, 0), false);
    }
    assert.ok(Math.abs(pierces(x, 3, 4, [0, 1, 2]) - 0.1) < 1e-12);
  });

  it('finds nothing for a segment beside the triangle', () => {
    const x = Float64Array.from([
      ...TRIANGLE.flat(),
      0.9,
      0.9,
      -0.1,
      0.9,
      0.9,
      0.1,
    ]);
    assert.equal(pierces(x, 3, 4, [0, 1, 2]), 0);
  });
});

describe('creaseLines', () => {
  it('keys collinear creases alike, whichever way they run', () => {
    const paper: Vec[] = [
      [0, 0.5],
      [0.2, 0.5],
      [1, 0.5],
      [0.8, 0.5],
      [0, 0.6],
      [0.2, 0.6],
    ];
    const lines = creaseLines({
      paper,
      hinges: [crease(0, 1), crease(2, 3), crease(4, 5)],
    });
    const [left] = lines.get(0) ?? [];
    assert.deepEqual([...(lines.get(3) ?? [])], [left]);
    assert.notDeepEqual([...(lines.get(4) ?? [])], [left]);
  });
});

/** The edge 3–4 standing `depth` either side of the triangle, its end 3 on a
 * crease along the paper line the triangle's corner 0 is on when `sharing`. */
const model = (depth: number, sharing: boolean) => ({
  mesh: {
    paper: [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 0],
      [0.5, 0.5],
    ] satisfies Vec[],
    triangles: [[0, 1, 2]] as const,
    bars: [[3, 4, 1]] as const,
    hinges: sharing ? [crease(0, 3)] : [],
  },
  x: Float64Array.from([
    ...TRIANGLE.flat(),
    0.25,
    0.25,
    -depth,
    0.25,
    0.25,
    depth,
  ]),
});

describe('crossings', () => {
  // Sheets 0.02 apart, so 3 gaps is 0.06 and 5 is 0.1.
  const within = 0.01;

  it('leaves out an edge nested within the given gaps on one crease line', () => {
    const { mesh, x } = model(0.06, true);
    assert.equal(crossings(mesh, x, { within, nested: 4 }), 0);
    assert.equal(crossings(mesh, x, { within }), 1);
  });

  it('counts one deeper than the given gaps, or off the crease line', () => {
    const deep = model(0.1, true);
    assert.equal(crossings(deep.mesh, deep.x, { within, nested: 4 }), 1);
    const apart = model(0.06, false);
    assert.equal(crossings(apart.mesh, apart.x, { within, nested: 4 }), 1);
  });
});
