// Offscreen canvases, per target canvas and by name. A cache only: every
// buffer a frame draws through is repainted whole by that frame, so the
// order frames are drawn in never shows.
const buffers = new WeakMap<
  HTMLCanvasElement,
  Map<string, HTMLCanvasElement>
>();

/** The 2D context of `canvas`; throws where the browser gives none. */
export function context2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('The tape needs a 2D canvas context');
  return ctx;
}

/**
 * The offscreen canvas `name` beside `target`'s canvas, `width` × `height`
 * device pixels. `paint` runs when it is made or resized, for a buffer whose
 * content is fixed; a per-frame buffer passes none and repaints it whole.
 */
export function buffer(
  target: CanvasRenderingContext2D,
  name: string,
  width: number,
  height: number,
  paint?: (ctx: CanvasRenderingContext2D) => void,
): HTMLCanvasElement {
  const w = Math.max(1, Math.ceil(width));
  const h = Math.max(1, Math.ceil(height));
  const owned =
    buffers.get(target.canvas) ?? new Map<string, HTMLCanvasElement>();
  buffers.set(target.canvas, owned);
  const canvas =
    owned.get(name) ?? target.canvas.ownerDocument.createElement('canvas');
  const fresh = !owned.has(name);
  owned.set(name, canvas);
  if (fresh || canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    paint?.(context2d(canvas));
  }
  return canvas;
}

/** How many device pixels one stage unit covers under `ctx`'s transform. */
export function deviceScale(ctx: CanvasRenderingContext2D): number {
  const { a, b, c, d } = ctx.getTransform();
  return Math.max(Math.hypot(a, b), Math.hypot(c, d));
}
