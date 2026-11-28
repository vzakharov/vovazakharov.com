import { rng } from '../ink';
import { buffer } from './buffers';

const TILE = 256;

/**
 * The two noise tiles: `snow`, opaque grey pushed towards black and white,
 * for a picture of static; `grain`, black and white flecks over transparency,
 * for noise laid over a picture with a plain draw — blend modes cost far more
 * than that where the canvas rasterizes in software.
 */
export type NoiseKind = 'snow' | 'grain';

// Built once per canvas, pixel by pixel, on a small tile.
function painter(kind: NoiseKind) {
  return (ctx: CanvasRenderingContext2D): void => {
    const image = ctx.createImageData(TILE, TILE);
    const next = rng(kind === 'snow' ? 0x5e_0e : 0x6a_17);
    for (let at = 0; at < image.data.length; at += 4) {
      const u = next() * 2 - 1;
      const strong = Math.sign(u) * Math.abs(u) ** 0.6;
      const [v, alpha] =
        kind === 'snow'
          ? [(strong * 0.5 + 0.5) * 255, 255]
          : [u > 0 ? 255 : 0, Math.abs(u) * 255];
      image.data[at] = v;
      image.data[at + 1] = v;
      image.data[at + 2] = v;
      image.data[at + 3] = alpha;
    }
    ctx.putImageData(image, 0, 0);
  };
}

const patterns = new WeakMap<
  CanvasRenderingContext2D,
  Map<NoiseKind, CanvasPattern>
>();

function pattern(
  ctx: CanvasRenderingContext2D,
  kind: NoiseKind,
): CanvasPattern {
  const owned = patterns.get(ctx) ?? new Map<NoiseKind, CanvasPattern>();
  patterns.set(ctx, owned);
  const cached = owned.get(kind);
  if (cached) return cached;
  const tile = buffer(ctx, `tape:${kind}-tile`, TILE, TILE, painter(kind));
  const made = ctx.createPattern(tile, 'repeat');
  if (!made) throw new Error(`The tape could not make its ${kind} pattern`);
  owned.set(kind, made);
  return made;
}

/**
 * `kind` noise over the rectangle, each grain `grain` stage units across; a
 * new `shift` seed moves the tile, so a frame's noise differs from the last.
 */
export function fillNoise(
  ctx: CanvasRenderingContext2D,
  kind: NoiseKind,
  [x, y, width, height]: readonly [number, number, number, number],
  grain: readonly [number, number],
  shift: number,
): void {
  const [gx, gy] = grain;
  const ox = ((shift >>> 0) % TILE) + TILE;
  const oy = ((shift >>> 8) % TILE) + TILE;
  ctx.save();
  // Grain wants no filtering, and sampling without it costs far less.
  ctx.imageSmoothingEnabled = false;
  ctx.translate(x, y);
  ctx.scale(gx, gy);
  ctx.translate(-ox, -oy);
  ctx.fillStyle = pattern(ctx, kind);
  ctx.fillRect(ox, oy, width / gx, height / gy);
  ctx.restore();
}
