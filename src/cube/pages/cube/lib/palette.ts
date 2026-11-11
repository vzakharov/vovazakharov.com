import type { Surface } from '@/cube/entities/world';

/** A colour as WGSL reads it: red, green and blue in `[0, 1]`. */
export type Rgb = readonly [number, number, number];

/** The golden angle, in degrees: floors a turn apart never share a hue. */
const GOLDEN_ANGLE = 137.508;

/** Floor `n`'s hue, in degrees. */
export const hueOf = (n: number): number => (n * GOLDEN_ANGLE) % 360;

/** HSL to RGB, `hue` in degrees and the rest in `[0, 1]`. */
export function hsl(hue: number, saturation: number, lightness: number): Rgb {
  const reach = saturation * Math.min(lightness, 1 - lightness);
  const channel = (offset: number) => {
    const k = (offset + hue / 30) % 12;
    return lightness - reach * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [channel(0), channel(8), channel(4)];
}

/** Saturation and lightness of each surface; the floor's hue is the rest. */
const TONE: Record<Surface, readonly [number, number]> = {
  wall: [0.5, 0.62],
  floor: [0.2, 0.4],
  ceiling: [0.08, 0.86],
  plate: [0.45, 0.3],
  handle: [0.6, 0.18],
};

/** The colour of `surface` in a room of floor `n`. */
export function colourOf(n: number, surface: Surface): Rgb {
  const [saturation, lightness] = TONE[surface];
  return hsl(hueOf(n), saturation, lightness);
}

/** The air of floor `n`: what the screen clears to, seen only past `FAR`. */
export const airOf = (n: number): Rgb => hsl(hueOf(n), 0.25, 0.07);

/** How bright the ambient light is, and how much of the walls' colour it takes. */
const AMBIENT = 0.42;
const AMBIENT_TINT = 0.25;

const tinted = (channel: number): number =>
  AMBIENT * (1 - AMBIENT_TINT + AMBIENT_TINT * channel);

/** The ambient light on floor `n`: white, tinted a little with its walls. */
export function ambientOf(n: number): Rgb {
  const [r, g, b] = colourOf(n, 'wall');
  return [tinted(r), tinted(g), tinted(b)];
}

/**
 * `of` at a depth between floors: `depth` is a floor number plus how many
 * halvings an eye has shrunk past it, so a body shrinking from floor `n` to a
 * person of `n + 1` passes from `of(n)` to `of(n + 1)` and arrives exactly.
 */
export function between(of: (n: number) => Rgb, depth: number): Rgb {
  const n = Math.floor(depth);
  const along = depth - n;
  const [from, to] = [of(n), of(n + 1)];
  return [
    from[0] + (to[0] - from[0]) * along,
    from[1] + (to[1] - from[1]) * along,
    from[2] + (to[2] - from[2]) * along,
  ];
}
