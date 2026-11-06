/**
 * The board's camera: a pan offset and a scale applied to the world layer as
 * one CSS transform, with the screen ↔ world conversions every gesture needs.
 */

export type Camera = { x: number; y: number; scale: number };
export type Point = { x: number; y: number };
export type Rect = { x: number; y: number; w: number; h: number };

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
      (viewport.w - 2 * margin) / Math.max(bounds.w, 1),
      (viewport.h - 2 * margin) / Math.max(bounds.h, 1),
      1,
    ),
  );
  return {
    scale,
    x: viewport.x + (viewport.w - bounds.w * scale) / 2 - bounds.x * scale,
    y: viewport.y + (viewport.h - bounds.h * scale) / 2 - bounds.y * scale,
  };
}

/** The smallest rectangle holding every one of `rects`; `undefined` for none. */
export function union(rects: readonly Rect[]): Rect | undefined {
  if (rects.length === 0) return undefined;
  const left = Math.min(...rects.map((r) => r.x));
  const top = Math.min(...rects.map((r) => r.y));
  const right = Math.max(...rects.map((r) => r.x + r.w));
  const bottom = Math.max(...rects.map((r) => r.y + r.h));
  return { x: left, y: top, w: right - left, h: bottom - top };
}

export const centreOf = (rect: Rect): Point => ({
  x: rect.x + rect.w / 2,
  y: rect.y + rect.h / 2,
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
    dx === 0 ? Infinity : rect.w / 2 / Math.abs(dx),
    dy === 0 ? Infinity : rect.h / 2 / Math.abs(dy),
  );
  return { x: cx + dx * t, y: cy + dy * t };
}
