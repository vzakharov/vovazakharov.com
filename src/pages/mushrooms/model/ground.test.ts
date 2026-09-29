import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { placeOf } from '../ui/scene/clump-layout';
import {
  EDGE_MARGIN,
  meadowCamera,
  meadowFrame,
} from '../ui/scene/meadow-camera';
import { VIEWPORTS } from '../ui/scene/viewports';
import { type Frame, type Ground, scaleAt } from './ground';
import { maxReach } from './mushroom-pose';
import { OPENING_FEET } from './placement';

/** How many steps across and into the distance the frame is walked in. */
const STEPS = 12;

/** The opening feet, and a grid of feet over `frame` from edge to edge. */
function feetOver({ across, near, far }: Frame): Ground[] {
  const steps = Array.from({ length: STEPS + 1 }, (_, step) => step / STEPS);
  return [
    ...OPENING_FEET,
    ...steps.flatMap((down) =>
      steps.map((side) => {
        const z = near + down * (far - near);
        return { x: ((side * 2 - 1) * across) / scaleAt(z), z };
      }),
    ),
  ];
}

/** Each screen as its name and size, and turned. */
const SCREENS = VIEWPORTS.flatMap(([name, width, height]) => [
  { name, width, height },
  { name: `${name} turned`, width: height, height: width },
]);

/**
 * The screens whose camera is held at the zoom floor while their frame is
 * held at its least across: the small phone upright, 320 px wide, where a
 * cap of the widest genes on the frame's near corners would stand 20 px past
 * the edge margin. Every foot there still stands inside the margin, and the
 * room check turns away a foot whose cap would not (`roomFor`).
 */
const FLOOR_HELD: ReadonlySet<string> = new Set(['small phone']);

describe('the frame', () => {
  for (const { name, width, height } of SCREENS) {
    const held = FLOOR_HELD.has(name);
    it(`stands on a ${name} screen, every ${held ? 'foot' : 'cap'} on it inside the edge margin`, () => {
      const camera = meadowCamera(width, height);
      const frame = meadowFrame({ width, height });
      const past: string[] = [];
      for (const foot of feetOver(frame)) {
        const { x, y, size, splay } = placeOf(camera, foot);
        const { toward, away } = maxReach(splay);
        const [left, right] = splay < 0 ? [toward, away] : [away, toward];
        const at = `foot ${foot.x.toFixed(2)}, ${foot.z.toFixed(2)}`;
        assert.ok(
          y >= camera.groundTop && y <= height,
          `${at}: off the ground`,
        );
        assert.ok(
          x >= EDGE_MARGIN && x <= width - EDGE_MARGIN,
          `${at}: past the edge margin`,
        );
        if (
          x - left * size < EDGE_MARGIN - 1e-9 ||
          x + right * size > width - EDGE_MARGIN + 1e-9
        ) {
          past.push(`${at}: its cap past the edge margin`);
        }
      }
      if (held) assert.notDeepEqual(past, [], 'no longer held at the floor');
      else assert.deepEqual(past, []);
    });
  }
});

describe('a turn', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`keeps every foot where it stood on the ground, on a ${name} screen`, () => {
      const cameras = [
        meadowCamera(width, height),
        meadowCamera(height, width),
      ];
      for (const foot of feetOver(meadowFrame({ width, height }))) {
        const [here, turned] = cameras.map((camera) => {
          const { x, y, size } = placeOf(camera, foot);
          return [
            (x - camera.midline) / size,
            (y - camera.groundTop) / camera.ground,
            size / camera.unit,
          ];
        });
        for (const [index, value] of (here ?? []).entries()) {
          const other = turned?.[index] ?? Number.NaN;
          assert.ok(
            Math.abs(value - other) < 1e-9,
            `foot ${foot.x.toFixed(2)}, ${foot.z.toFixed(2)}: ${String(value)} against ${String(other)}`,
          );
        }
      }
    });
  }
});
