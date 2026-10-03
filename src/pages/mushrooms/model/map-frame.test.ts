import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { D_SEE } from './ground';
import { headingOnMap, mapFrame, onMap, thingScale } from './map-frame';

const panel = { middle: { x: 200, y: 150 }, width: 400, height: 300 };
const near = (a: number, b: number) => {
  assert.ok(Math.abs(a - b) < 1e-9, `${a} ≉ ${b}`);
};

describe('mapFrame', () => {
  it('floors the reach at D_SEE, padded by one clump size', () => {
    const frame = mapFrame({ x: 0, y: 0 }, 0, [{ x: 1, y: 1 }], panel);
    near(frame.reach, D_SEE + 1);
    near(frame.scale, 150 / (D_SEE + 1));
  });

  it('reaches the farthest foot from the centre', () => {
    const frame = mapFrame({ x: 5, y: 5 }, 0, [{ x: 5, y: 5 + 30 }], panel);
    near(frame.reach, 31);
  });
});

describe('onMap', () => {
  it('shows the centre at the middle', () => {
    const frame = mapFrame({ x: 3, y: -2 }, 0.7, [], panel);
    assert.deepEqual(onMap(frame, { x: 3, y: -2 }), panel.middle);
  });

  it('puts the sun azimuth up and its right to the right', () => {
    const up = 0.534;
    const frame = mapFrame({ x: 0, y: 0 }, up, [], panel);
    const ahead = onMap(frame, { x: Math.sin(up), y: Math.cos(up) });
    near(ahead.x, 200);
    near(ahead.y, 150 - frame.scale);
    const right = onMap(frame, { x: Math.cos(up), y: -Math.sin(up) });
    near(right.x, 200 + frame.scale);
    near(right.y, 150);
  });
});

describe('headingOnMap', () => {
  it('points the sun-ward heading up and a quarter turn right', () => {
    const frame = mapFrame({ x: 0, y: 0 }, 1, [], panel);
    const up = headingOnMap(frame, 1);
    near(up.x, 0);
    near(up.y, -1);
    const right = headingOnMap(frame, 1 + Math.PI / 2);
    near(right.x, 1);
    near(right.y, 0);
  });

  it('agrees with onMap along the heading', () => {
    const frame = mapFrame({ x: 0, y: 0 }, 0.3, [], panel);
    const heading = 2.1;
    const at = onMap(frame, { x: Math.sin(heading), y: Math.cos(heading) });
    const along = headingOnMap(frame, heading);
    near((at.x - 200) / frame.scale, along.x);
    near((at.y - 150) / frame.scale, along.y);
  });
});

describe('thingScale', () => {
  it('scales by size above the floor and holds the floor below it', () => {
    const frame = mapFrame({ x: 0, y: 0 }, 0, [], panel);
    near(thingScale(frame, 2, 1), frame.scale * 2);
    assert.equal(thingScale(frame, 0.01, 12), 12);
  });
});
