import { pick } from '@/shared/lib/collections';
import type { Sized } from '@/shared/typings';

import type { Point, WithMiddle } from './geometry';
import type { Scaling } from './ground';

/**
 * How the map lays the meadow's plane on the screen: `centre`, a plane
 * point, shows at `middle`, the sun's azimuth `sunward` points to the
 * screen's top, at `scale` px a clump size.
 */
export type MapFrame = WithMiddle &
  Scaling & { centre: Point; sunward: number };

/** The panel the map is drawn into, in screen px. */
type Panel = WithMiddle & Sized;

/** The most a map zooms in on a few things, against the fresh meadow's scale. */
const MOST_ZOOM = 2.5;

/** A plane point turned sun-up: `across` to the map's right, `along` up it. */
function sunUp(sunward: number, { x, y }: Point) {
  return {
    across: x * Math.cos(sunward) - y * Math.sin(sunward),
    along: x * Math.sin(sunward) + y * Math.cos(sunward),
  };
}

/**
 * The box round `points`, sun-up and padded by one clump size: its middle
 * on the plane, and the scale that fits it to `panel` on both axes.
 */
function boxed(sunward: number, points: readonly Point[], panel: Panel) {
  const turned = points.map((point) => sunUp(sunward, point));
  const acrosses = turned.map(({ across }) => across);
  const alongs = turned.map(({ along }) => along);
  const [left, right] = [Math.min(...acrosses) - 1, Math.max(...acrosses) + 1];
  const [low, high] = [Math.min(...alongs) - 1, Math.max(...alongs) + 1];
  const across = (left + right) / 2;
  const along = (low + high) / 2;
  return {
    centre: {
      x: across * Math.cos(sunward) + along * Math.sin(sunward),
      y: -across * Math.sin(sunward) + along * Math.cos(sunward),
    },
    scale: Math.min(panel.width / (right - left), panel.height / (high - low)),
  };
}

/**
 * Frames `points` — every foot and the eye — in the box round them, sun-up,
 * padded by one clump size and fitted to `panel` on both axes; zoomed in at
 * most `MOST_ZOOM` times the scale that frames `fresh`, the fresh meadow's
 * points, so a few things do not fill the sheet.
 */
export function mapFrame(
  sunward: number,
  points: readonly Point[],
  fresh: readonly Point[],
  panel: Panel,
): MapFrame {
  const { centre, scale } = boxed(sunward, points, panel);
  const most = MOST_ZOOM * boxed(sunward, fresh, panel).scale;
  return {
    ...pick(panel, 'middle'),
    centre,
    sunward,
    scale: Math.min(scale, most),
  };
}

/** Where a plane point shows on the map, in screen px. */
export function onMap(
  { centre, sunward, middle, scale }: MapFrame,
  point: Point,
): Point {
  const { across, along } = sunUp(sunward, {
    x: point.x - centre.x,
    y: point.y - centre.y,
  });
  return { x: middle.x + scale * across, y: middle.y - scale * along };
}

/** The plane point that shows at `at` on the map, in screen px: `onMap` undone. */
export function fromMap(
  { centre, sunward, middle, scale }: MapFrame,
  at: Point,
): Point {
  const across = (at.x - middle.x) / scale;
  const along = (middle.y - at.y) / scale;
  return {
    x: centre.x + across * Math.cos(sunward) + along * Math.sin(sunward),
    y: centre.y - across * Math.sin(sunward) + along * Math.cos(sunward),
  };
}

/** The screen direction, as a unit vector, that a plane heading points on the map. */
export function headingOnMap({ sunward }: MapFrame, heading: number): Point {
  return { x: Math.sin(heading - sunward), y: -Math.cos(heading - sunward) };
}

/**
 * The px size a thing of `size` clump sizes is painted at, floored at `least`
 * so a crowded field overlaps rather than vanishes.
 */
export const thingScale = ({ scale }: MapFrame, size: number, least: number) =>
  Math.max(scale * size, least);
