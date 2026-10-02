import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Point } from '../../model/geometry';
import { type Camera, OPENING_EYE } from '../../model/ground';
import { sunLight } from '../../model/light';
import { mulberry32 } from '../../model/random';
import { type MeadowLayout, meadowLayout } from './layout';
import {
  azimuthAt,
  type Crest,
  crestAcross,
  crestAt,
  screenAt,
} from './panorama';
import {
  farRange,
  farSkyline,
  farthestRange,
  farthestSkyline,
  HILL_STEPS,
  hillBands,
  litRidge,
  nearSkyline,
  partedUnderSun,
  PATH_SKIP,
} from './skyline';
import { SUN_RAY_REACH } from './sun-layout';
import { viewAt } from './view';
import { VIEWPORTS, VISITS } from './viewports';

/** A simple polygon's area, by the shoelace formula. */
function area(outline: readonly Point[]): number {
  let twice = 0;
  for (const [index, { x, y }] of outline.entries()) {
    const next = outline[(index + 1) % outline.length] ?? { x, y };
    twice += x * next.y - next.x * y;
  }
  return Math.abs(twice) / 2;
}

/**
 * How sharply an evenly sampled line bends at its sharpest, per the sun's
 * radius `r`: its greatest second difference over the step squared. A corner
 * shows as a second difference of the order of the step, not of its square.
 */
function sharpestBend(line: readonly Point[], r: number): number {
  let sharpest = 0;
  for (const [index, point] of line.slice(2).entries()) {
    const before = line[index + 1] ?? point;
    const first = line[index] ?? before;
    const step = point.x - before.x;
    const bend = Math.abs(point.y - 2 * before.y + first.y) / step ** 2;
    sharpest = Math.max(sharpest, bend * r);
  }
  return sharpest;
}

/** Headings round the whole circle, an eighteenth of a turn apart. */
const HEADINGS = Array.from(
  { length: 18 },
  (_, index) => (index * Math.PI * 2) / 18,
);

/** The view from the opening eye turned to `heading`. */
const turnedTo = (camera: Camera, heading: number) =>
  viewAt(camera, { ...OPENING_EYE, heading });

/** The crests of `layout`'s three ranges, farthest first, as a visit of `seed` draws them. */
function crestsOf(layout: MeadowLayout, seed: number): Crest[] {
  const random = mulberry32(seed);
  return [
    farthestSkyline(random, layout),
    farSkyline(random, layout),
    nearSkyline(random, layout),
  ];
}

describe('the hill bands', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`tile each range exactly and never rise above its skyline, from every heading, on a ${name} screen`, () => {
      for (const seed of VISITS.slice(0, 20)) {
        const layout = meadowLayout(width, height, seed);
        const crests = crestsOf(layout, seed);
        for (const heading of HEADINGS.slice(0, 6)) {
          const view = turnedTo(layout.camera, heading);
          for (const crest of crests) {
            const line = crestAcross(crest, view, HILL_STEPS);
            const floor = layout.groundTop;
            const whole = area([
              ...line,
              { x: line.at(-1)?.x ?? 0, y: floor },
              { x: line[0]?.x ?? 0, y: floor },
            ]);
            const bands = hillBands(line, floor, 16);
            const sum = bands.reduce(
              (total, { outline }) => total + area(outline),
              0,
            );
            // A band's last point dropped before its corner (`PATH_SKIP`)
            // trims at most a sliver a sample wide.
            const sample = (line[1]?.x ?? 0) - (line[0]?.x ?? 0);
            assert.ok(Math.abs(sum - whole) < 16 * sample * PATH_SKIP + 1e-6);
            const top = Math.min(...line.map(({ y }) => y));
            for (const { outline } of bands) {
              for (const { y } of outline) assert.ok(y >= top - 1e-9);
            }
            assert.equal(bands[0]?.down, 0);
            assert.equal(bands.at(-1)?.down, 1);
          }
        }
      }
    });
  }
});

/** The game's `pathDetailThreshold`, Phaser's default, in device px. */
const PHASER_DETAIL = 1;

/**
 * `outline` in device px at `ratio`, as Phaser's fill keeps it at `detail`:
 * every point but the first and last within `detail` of the last one kept,
 * both ways, is skipped (`FillPath.run`).
 */
function phaserKept(
  outline: readonly Point[],
  ratio: number,
  detail: number,
): Point[] {
  const kept: Point[] = [];
  for (const [index, point] of outline.entries()) {
    const [x, y] = [point.x * ratio, point.y * ratio];
    const last = kept.at(-1);
    const inner = index > 0 && index < outline.length - 1;
    if (
      inner &&
      last &&
      Math.abs(x - last.x) <= detail &&
      Math.abs(y - last.y) <= detail
    ) {
      continue;
    }
    kept.push({ x, y });
  }
  return kept;
}

/** Whether segments `a`–`b` and `c`–`d` cross at a point inside both. */
function cross(a: Point, b: Point, c: Point, d: Point): boolean {
  const side = (p: Point, q: Point, r: Point) =>
    Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));
  return side(a, b, c) * side(a, b, d) < 0 && side(c, d, a) * side(c, d, b) < 0;
}

/** Two edges of the closed `outline`, not side by side, that cross: none for a simple polygon. */
function crossedEdges(outline: readonly Point[]): [number, number] | undefined {
  const count = outline.length;
  const at = (index: number) => outline[index % count] ?? { x: 0, y: 0 };
  for (let i = 0; i < count; i++) {
    for (let j = i + 2; j < count; j++) {
      if (i === 0 && j === count - 1) continue;
      if (cross(at(i), at(i + 1), at(j), at(j + 1))) return [i, j];
    }
  }
  return undefined;
}

/**
 * Each band outline of the first `visits` visits' ranges on a `width` by
 * `height` screen, from 720 headings, at each device px ratio Phaser fills it
 * at, and where it was drawn.
 */
function* filledBands(width: number, height: number, visits: number) {
  for (const seed of VISITS.slice(0, visits)) {
    const layout = meadowLayout(width, height, seed);
    const crests = crestsOf(layout, seed);
    for (let step = 0; step < 720; step++) {
      const view = turnedTo(layout.camera, (step / 720) * Math.PI * 2);
      for (const [range, crest] of crests.entries()) {
        const line = crestAcross(crest, view, HILL_STEPS, 4);
        const bands = hillBands(line, layout.groundTop, 16);
        for (const [band, { outline }] of bands.entries()) {
          for (const ratio of [1, 2, 3]) {
            const at = `seed ${seed}, step ${step}, range ${range}, band ${band}, ×${ratio}`;
            yield { outline, ratio, at };
          }
        }
      }
    }
  }
}

describe('the hill bands as the hills fill them', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`stay simple polygons through Phaser's path detail, from 720 headings, on a ${name} screen`, () => {
      for (const { outline, ratio, at } of filledBands(width, height, 3)) {
        // As `fillPoints` closes it, back to its first point.
        const path = [...outline, ...outline.slice(0, 1)];
        const kept = phaserKept(path, ratio, PHASER_DETAIL);
        // Skipping only repeated points leaves the outline as it was.
        const crossed =
          kept.length === phaserKept(path, ratio, 0).length
            ? undefined
            : crossedEdges(kept);
        assert.equal(crossed, undefined, at);
      }
    });
  }
});

/**
 * The first point of the closed `outline` that Phaser's fill at `detail`
 * skips although it lies on the band's top or bottom edge and the point kept
 * before it does not: the band's edge would then set off from that earlier
 * point, a sliver of the band sloping off its edge over whatever lies beyond.
 */
function edgeSkipped(
  outline: readonly Point[],
  ratio: number,
  detail: number,
): Point | undefined {
  const ys = outline.map(({ y }) => y);
  const edges = new Set([Math.min(...ys), Math.max(...ys)]);
  const path = [...outline, ...outline.slice(0, 1)];
  let last: Point | undefined;
  for (const [index, point] of path.entries()) {
    const inner = index > 0 && index < path.length - 1;
    if (
      inner &&
      last &&
      Math.abs(point.x - last.x) * ratio <= detail &&
      Math.abs(point.y - last.y) * ratio <= detail
    ) {
      if (edges.has(point.y) && last.y !== point.y) return point;
      continue;
    }
    last = point;
  }
  return undefined;
}

describe('the hill bands along their edges', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`keep every point where a band's edge sets off through Phaser's path detail, from 720 headings, on a ${name} screen`, () => {
      for (const { outline, ratio, at } of filledBands(width, height, 5)) {
        assert.equal(edgeSkipped(outline, ratio, PHASER_DETAIL), undefined, at);
      }
    });
  }
});

describe('the far hills under the sun', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`stay under the sun's rays from every heading, on a ${name} screen`, () => {
      for (const seed of VISITS.slice(0, 40)) {
        const layout = meadowLayout(width, height, seed);
        const { sun, camera } = layout;
        const rays = sun.r * SUN_RAY_REACH;
        const crests = crestsOf(layout, seed).slice(0, 2);
        for (const heading of HEADINGS) {
          const view = turnedTo(camera, heading);
          const x = screenAt(view, azimuthAt(camera, sun.x));
          for (const crest of crests) {
            for (let dx = -rays; dx <= rays; dx += rays / 16) {
              const under = sun.y + Math.sqrt(rays ** 2 - dx ** 2);
              assert.ok(
                crestAt(crest, view, x + dx) >= under - 1e-6,
                `visit ${String(seed)}, heading ${heading.toFixed(2)}: a far hill on the rays`,
              );
            }
          }
        }
      }
    });

    it(`bend no sharper where the sun lowers them than they roll anyway, below its disc, from every heading, on a ${name} screen`, () => {
      for (const seed of VISITS.slice(0, 100)) {
        const layout = meadowLayout(width, height, seed);
        const { sun, camera } = layout;
        for (const range of [farthestRange, farRange]) {
          const unparted = range(mulberry32(seed), layout);
          const parted = partedUnderSun(unparted, layout);
          for (const heading of HEADINGS) {
            const view = turnedTo(camera, heading);
            const line = crestAcross(parted, view, HILL_STEPS);
            assert.ok(
              sharpestBend(line, sun.r) <=
                sharpestBend(
                  crestAcross(unparted.crest, view, HILL_STEPS),
                  sun.r,
                ) +
                  0.25,
              `visit ${String(seed)}, heading ${heading.toFixed(2)}: a corner in the lowered hills`,
            );
            const x = screenAt(view, azimuthAt(camera, sun.x));
            for (let dx = -sun.r; dx <= sun.r; dx += sun.r / 8) {
              assert.ok(
                crestAt(parted, view, x + dx) >= sun.y + sun.r,
                `visit ${String(seed)}, heading ${heading.toFixed(2)}: a far hill on the disc`,
              );
            }
          }
        }
      }
    });
  }
});

describe('the lit ridge', () => {
  it('rims only the slopes that face the sun', () => {
    const layout = meadowLayout(1180, 820, 3);
    const light = sunLight(layout);
    // The sun stands to the right on a tablet: a rising slope faces away,
    // a falling one toward it.
    assert.ok(light.toward.x > 0);
    const rising = [
      { x: 0, y: 100 },
      { x: 10, y: 90 },
    ];
    const falling = [
      { x: 0, y: 90 },
      { x: 10, y: 100 },
    ];
    assert.equal(litRidge(rising, light, 4).length, 0);
    assert.equal(litRidge(falling, light, 4).length, 1);
  });
});
