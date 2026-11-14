import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SUN_DIR } from '@/cube/shared/cube-boundary';
import type { Vec3 } from '@/cube/shared/lib/vec';
import { assemble } from '@/cube/shared/shader';
import { toWorld } from '@/cube/entities/island';

import { cubeShadow } from './cube-shadow';
import { CUBE_SHADOW } from './cube-shadow.shader.generated';
import {
  OUTDOOR_FRAME,
  OUTDOOR_FRAME_FLOATS,
  packOutdoorFrame,
} from './outdoor-frame';
import { SKY } from './sky.shader.generated';

describe('cubeShadow', () => {
  const middle = toWorld([0.5, 0, 0.5]);
  const down = (metres: number): Vec3 => [
    middle[0] - SUN_DIR[0] * metres,
    middle[1] - SUN_DIR[1] * metres,
    middle[2] - SUN_DIR[2] * metres,
  ];

  it('is dark down-sun of the cube and lit beside it and up-sun', () => {
    assert.equal(cubeShadow(down(10)), 0);
    assert.equal(cubeShadow(down(-10)), 1);
    const [x, y, z] = down(10);
    assert.equal(cubeShadow([x, y, z + 6]), 1);
  });

  /** How far the edge runs across the shadow, `metres` down-sun. */
  const edge = (metres: number): number => {
    const [x, y, z] = down(metres);
    let wide = 0;
    for (let across = 0; across < 6; across += 0.002) {
      const lit = cubeShadow([x, y, z + across]);
      if (lit > 0.01 && lit < 0.99) wide += 0.002;
    }
    return wide;
  };

  it('softens its edge with distance', () => {
    assert.ok(edge(30) > 2 * edge(5), `${String(edge(30))} ${String(edge(5))}`);
  });

  it('is assembled with the frame and the sun it reads', () => {
    const source = assemble([CUBE_SHADOW]);
    assert.ok(
      source.indexOf('const CUBE_MIN') < source.indexOf('fn cubeShadow'),
    );
    assert.ok(
      source.indexOf('const SUN_DIR') < source.indexOf('fn cubeShadow'),
    );
  });
});

describe('the sky', () => {
  it('binds nothing but the frame', () => {
    const source = assemble([SKY]);
    assert.ok(source.includes('@group(0) @binding(0)'));
    assert.equal(source.match(/@binding\(/g)?.length, 1);
  });
});

describe('packOutdoorFrame', () => {
  it('lays the block out as the struct declares it', () => {
    const data = packOutdoorFrame({
      viewProjection: new Float32Array(16).fill(1),
      inverse: new Float32Array(16).fill(2),
      eye: [3, 4, 5],
      sun: [6, 7, 8],
      seconds: 9,
      hour: 10,
      width: 11,
      height: 12,
    });
    assert.equal(data.length, OUTDOOR_FRAME_FLOATS);
    assert.deepEqual(
      [...data.subarray(32)],
      [3, 4, 5, 1, 6, 7, 8, 0, 9, 10, 11, 12, 1, 0, 0, 0],
    );
    assert.deepEqual([data[0], data[15], data[16], data[31]], [1, 1, 2, 2]);
    const gone = packOutdoorFrame({
      viewProjection: new Float32Array(16),
      inverse: new Float32Array(16),
      eye: [0, 0, 0],
      sun: [0, 0, 1],
      ladderGone: true,
      seconds: 0,
      hour: 0,
      width: 1,
      height: 1,
    });
    assert.deepEqual(
      [...gone.subarray(OUTDOOR_FRAME_FLOATS - 4)],
      [0, 0, 0, 0],
    );
    const members = [...OUTDOOR_FRAME.listing.matchAll(/^ {2}(\w+): /gm)].map(
      ([, name]) => name,
    );
    assert.deepEqual(members, [
      'viewProjection',
      'inverse',
      'eye',
      'sun',
      'clock',
      'state',
    ]);
  });
});
