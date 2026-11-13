import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  type Channel,
  cuesBetween,
  joined,
  shotAt,
  type Track,
  trackOf,
  valueAt,
} from './track';

const HELD: Channel = [[0, 0]];

const track = (over: Partial<Track<string>>): Track<string> => ({
  x: HELD,
  y: HELD,
  z: HELD,
  yaw: HELD,
  elevation: HELD,
  roll: HELD,
  lids: HELD,
  exposure: HELD,
  runs: 4,
  cues: [],
  ...over,
});

describe('valueAt', () => {
  const channel: Channel = [
    [1, 10],
    [3, 20],
    [5, 0, 'linear'],
  ];

  it('holds the first key before it and the last after it', () => {
    assert.equal(valueAt(channel, -1), 10);
    assert.equal(valueAt(channel, 0.5), 10);
    assert.equal(valueAt(channel, 5), 0);
    assert.equal(valueAt(channel, 99), 0);
  });

  it('passes through every key at its moment', () => {
    assert.equal(valueAt(channel, 1), 10);
    assert.equal(valueAt(channel, 3), 20);
  });

  it('eases smoothly unless told otherwise', () => {
    assert.equal(valueAt(channel, 2), 15);
    assert.ok(valueAt(channel, 1.2) < 11, 'leaves at rest');
    assert.ok(valueAt(channel, 2.8) > 19, 'arrives at rest');
    assert.equal(valueAt(channel, 3.5), 15);
    assert.equal(valueAt(channel, 4.5), 5);
  });

  it('carries a motion through a key between an in and an out', () => {
    const through: Channel = [
      [0, 0],
      [1, 1, 'in'],
      [2, 2, 'out'],
    ];
    const pace = (t: number): number =>
      (valueAt(through, t + 1e-4) - valueAt(through, t - 1e-4)) / 2e-4;
    assert.ok(Math.abs(pace(0.999) - pace(1.001)) < 0.01);
    assert.ok(pace(1) > 1.9);
    assert.ok(pace(0.001) < 0.01);
    assert.ok(pace(1.999) < 0.01);
  });

  it('refuses a channel with no key', () => {
    assert.throws(() => valueAt([], 0), RangeError);
  });
});

describe('shotAt', () => {
  it('reads every channel at the one moment', () => {
    const scene = track({
      x: [
        [0, 0],
        [4, 8, 'linear'],
      ],
      lids: [
        [0, 0],
        [2, 1, 'linear'],
      ],
      exposure: [[0, 1]],
    });
    assert.deepEqual(shotAt(scene, 1), {
      x: 2,
      y: 0,
      z: 0,
      yaw: 0,
      elevation: 0,
      roll: 0,
      lids: 0.5,
      exposure: 1,
    });
  });
});

describe('trackOf', () => {
  const REST = { x: 0, y: 0, z: 0, yaw: 0, elevation: 0, roll: 0, lids: 1 };
  const scene = trackOf<string>(
    [
      { mark: 0, ...REST, exposure: 1 },
      { mark: 2, y: 4 },
      { mark: 4, x: 8, ease: 'linear' },
    ],
    [[1, 'step']],
  );

  it('lasts to its last beat and keeps its cues', () => {
    assert.equal(scene.runs, 4);
    assert.deepEqual(scene.cues, [[1, 'step']]);
  });

  it('runs a channel straight through a beat that leaves it out', () => {
    assert.equal(shotAt(scene, 2).x, 4);
    assert.equal(shotAt(scene, 2).y, 4);
    assert.equal(shotAt(scene, 3).y, 4);
    assert.equal(shotAt(scene, 3).exposure, 1);
  });

  it('refuses a first beat that leaves a channel unpinned', () => {
    assert.throws(() => trackOf([{ mark: 0, ...REST }]), /exposure/);
  });

  it('joins two tracks end to start', () => {
    const after = trackOf<string>(
      [
        { mark: 0, ...REST, x: 8, y: 4, exposure: 1 },
        { mark: 1, x: 10 },
      ],
      [[0.5, 'rung']],
    );
    const both = joined(scene, after);
    assert.equal(both.runs, 5);
    assert.equal(shotAt(both, 3).x, 6);
    assert.equal(shotAt(both, 4).x, 8);
    assert.equal(shotAt(both, 5).x, 10);
    assert.deepEqual(both.cues, [
      [1, 'step'],
      [4.5, 'rung'],
    ]);
  });
});

describe('cuesBetween', () => {
  const scene = track({
    cues: [
      [0, 'groan'],
      [1.5, 'step'],
      [1.5, 'splash'],
      [4, 'last'],
    ],
  });

  it('gives a frame the cues marked within it', () => {
    assert.deepEqual(cuesBetween(scene, 0, 0.016), ['groan']);
    assert.deepEqual(cuesBetween(scene, 1.49, 1.51), ['step', 'splash']);
    assert.deepEqual(cuesBetween(scene, 2, 3), []);
  });

  it('sets each cue off once however the frames fall', () => {
    for (const dt of [0.016, 0.1, 0.37, 1.5, 9]) {
      const heard: string[] = [];
      for (let t = 0; t < scene.runs; t += dt) {
        heard.push(...cuesBetween(scene, t, t + dt));
      }
      assert.deepEqual(heard, ['groan', 'step', 'splash', 'last'], `${dt}`);
    }
  });
});
