/**
 * The board's camera: a pan offset and a scale applied to the world layer as
 * one CSS transform, with the screen ↔ world conversions every gesture needs.
 */

import type { Point, Sized } from '@/kernel/shared/typings';

export type { Point } from '@/kernel/shared/typings';

export type Camera = Point & { scale: number };
export type Rect = Point & Sized;

const MIN_SCALE = 0.05;
const MAX_SCALE = 3;

const clampScale = (scale: number): number =>
  Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));

export const toWorld = (camera: Camera, screen: Point): Point => ({
  x: (screen.x - camera.x) / camera.scale,
  y: (screen.y - camera.y) / camera.scale,
});

/** `camera` zoomed by `factor`, the world point under `anchor` staying put. */
export function zoomAt(camera: Camera, anchor: Point, factor: number): Camera {
  const scale = clampScale(camera.scale * factor);
  const world = toWorld(camera, anchor);
  return {
    scale,
    x: anchor.x - world.x * scale,
    y: anchor.y - world.y * scale,
  };
}

/** The camera showing all of `bounds` inside a `viewport`, with a margin. */
export function fitTo(bounds: Rect, viewport: Rect, margin = 48): Camera {
  const scale = clampScale(
    Math.min(
      (viewport.width - 2 * margin) / Math.max(bounds.width, 1),
      (viewport.height - 2 * margin) / Math.max(bounds.height, 1),
      1,
    ),
  );
  return {
    scale,
    x:
      viewport.x +
      (viewport.width - bounds.width * scale) / 2 -
      bounds.x * scale,
    y:
      viewport.y +
      (viewport.height - bounds.height * scale) / 2 -
      bounds.y * scale,
  };
}

export function union(rects: readonly Rect[]): Rect | undefined {
  if (rects.length === 0) return undefined;
  const left = Math.min(...rects.map((r) => r.x));
  const top = Math.min(...rects.map((r) => r.y));
  const right = Math.max(...rects.map((r) => r.x + r.width));
  const bottom = Math.max(...rects.map((r) => r.y + r.height));
  return { x: left, y: top, width: right - left, height: bottom - top };
}

export const centreOf = (rect: Rect): Point => ({
  x: rect.x + rect.width / 2,
  y: rect.y + rect.height / 2,
});

/**
 * Where the segment from `rect`'s centre towards `target` leaves `rect` — so a
 * line between two items starts and ends at their edges, not under them.
 */
export function edgePoint(rect: Rect, target: Point): Point {
  const { x: cx, y: cy } = centreOf(rect);
  const dx = target.x - cx;
  const dy = target.y - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  const t = Math.min(
    dx === 0 ? Infinity : rect.width / 2 / Math.abs(dx),
    dy === 0 ? Infinity : rect.height / 2 / Math.abs(dy),
  );
  return { x: cx + dx * t, y: cy + dy * t };
}
