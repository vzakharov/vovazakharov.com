import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  fromMap,
  headingOnMap,
  mapFrame,
  onMap,
  thingScale,
} from './map-frame';

const panel = { middle: { x: 200, y: 150 }, width: 400, height: 300 };
const ORIGIN = [{ x: 0, y: 0 }];
const near = (a: number, b: number) => {
  assert.ok(Math.abs(a - b) < 1e-9, `${a} ≉ ${b}`);
};

describe('mapFrame', () => {
  const wide = [
    { x: -10, y: 0 },
    { x: 10, y: 0 },
  ];

  it('centres the padded box round every point, sun-up, and fits it on both axes', () => {
    const feet = [
      { x: 2, y: 4 },
      { x: 8, y: 6 },
    ];
    const frame = mapFrame(0, feet, feet, panel);
    near(frame.centre.x, 5);
    near(frame.centre.y, 5);
    // 8 × 4 clump sizes padded to 10 × 6: the height binds, 300 / 6.
    near(frame.scale, 50);
    const corner = onMap(frame, { x: 8, y: 6 });
    near(corner.x, 200 + 3 * 50);
    near(corner.y, 150 - 1 * 50);
  });

  it('turns the box with the sun, so a line along the sun stands up the sheet', () => {
    const up = 0.9;
    const line = [0, 20].map((far) => ({
      x: far * Math.sin(up),
      y: far * Math.cos(up),
    }));
    const frame = mapFrame(up, line, line, panel);
    near(frame.scale, 300 / 22);
    const [close, far] = line.map((point) => onMap(frame, point));
    assert.ok(close && far);
    near(close.x, 200);
    near(far.x, 200);
    near(close.y - far.y, 20 * frame.scale);
  });

  it('zooms in at most 2.5 times the fresh meadow’s scale', () => {
    const fresh = mapFrame(0, wide, wide, panel);
    near(fresh.scale, 400 / 22);
    const few = mapFrame(0, [{ x: 0, y: 0 }], wide, panel);
    near(few.scale, 2.5 * fresh.scale);
    assert.deepEqual(few.centre, { x: 0, y: 0 });
  });
});

describe('onMap', () => {
  it('shows the centre at the middle', () => {
    const frame = mapFrame(0.7, [{ x: 3, y: -2 }], ORIGIN, panel);
    assert.deepEqual(onMap(frame, { x: 3, y: -2 }), panel.middle);
  });

  it('puts the sun azimuth up and its right to the right', () => {
    const up = 0.534;
    const frame = mapFrame(up, ORIGIN, ORIGIN, panel);
    const ahead = onMap(frame, { x: Math.sin(up), y: Math.cos(up) });
    near(ahead.x, 200);
    near(ahead.y, 150 - frame.scale);
    const right = onMap(frame, { x: Math.cos(up), y: -Math.sin(up) });
    near(right.x, 200 + frame.scale);
    near(right.y, 150);
  });
});

describe('fromMap', () => {
  it('finds the plane point a screen point shows', () => {
    const frame = mapFrame(2.3, [{ x: 3, y: -2 }], ORIGIN, panel);
    const point = { x: -4.5, y: 7.25 };
    const back = fromMap(frame, onMap(frame, point));
    near(back.x, point.x);
    near(back.y, point.y);
  });
});

describe('headingOnMap', () => {
  it('points the sun-ward heading up and a quarter turn right', () => {
    const frame = mapFrame(1, ORIGIN, ORIGIN, panel);
    const up = headingOnMap(frame, 1);
    near(up.x, 0);
    near(up.y, -1);
    const right = headingOnMap(frame, 1 + Math.PI / 2);
    near(right.x, 1);
    near(right.y, 0);
  });

  it('agrees with onMap along the heading', () => {
    const frame = mapFrame(0.3, ORIGIN, ORIGIN, panel);
    const heading = 2.1;
    const at = onMap(frame, { x: Math.sin(heading), y: Math.cos(heading) });
    const along = headingOnMap(frame, heading);
    near((at.x - 200) / frame.scale, along.x);
    near((at.y - 150) / frame.scale, along.y);
  });
});

describe('thingScale', () => {
  it('scales by size above the floor and holds the floor below it', () => {
    const frame = mapFrame(0, ORIGIN, ORIGIN, panel);
    near(thingScale(frame, 2, 1), frame.scale * 2);
    assert.equal(thingScale(frame, 0.01, 12), 12);
  });
});
