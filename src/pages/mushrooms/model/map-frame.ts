import type { Sized } from '@/shared/typings';

import {
  distanceBetween,
  type Point,
  type Reach,
  type WithMiddle,
} from './geometry';
import { D_SEE, type Scaling } from './ground';

/**
 * How the map lays the meadow's plane on the screen: `centre` (the eye's
 * plane point) shows at `middle`, the sun's azimuth `sunward` points to the
 * screen's top, and `reach` clump sizes span the panel's shorter half-side
 * at `scale` px each.
 */
export type MapFrame = WithMiddle &
  Reach &
  Scaling & { centre: Point; sunward: number };

/** The panel the map is drawn into, in screen px. */
type Panel = WithMiddle & Sized;

/**
 * Frames every foot around `centre`: the reach is the farthest foot, floored
 * at `D_SEE` so a fresh meadow keeps its opening clump readable, padded by
 * one clump size.
 */
export function mapFrame(
  centre: Point,
  sunward: number,
  feet: readonly Point[],
  { middle, width, height }: Panel,
): MapFrame {
  const farthest = Math.max(
    D_SEE,
    ...feet.map((foot) => distanceBetween(centre, foot)),
  );
  const reach = farthest + 1;
  return {
    centre,
    sunward,
    middle,
    reach,
    scale: Math.min(width, height) / 2 / reach,
  };
}

/** Where a plane point shows on the map, in screen px. */
export function onMap(
  { centre, sunward, middle, scale }: MapFrame,
  point: Point,
): Point {
  const dx = point.x - centre.x;
  const dy = point.y - centre.y;
  const along = dx * Math.sin(sunward) + dy * Math.cos(sunward);
  const across = dx * Math.cos(sunward) - dy * Math.sin(sunward);
  return { x: middle.x + scale * across, y: middle.y - scale * along };
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
