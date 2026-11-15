import { hsl, hueOf, type Rgb } from '@/cube/shared/lib/colour';

/**
 * A sign's board on floor `n`, its ink and its second line's ink: an estate
 * agent's red while the room sells, green once it is the viewer's.
 */
export const signOf = (
  n: number,
  sold: boolean,
): { board: Rgb; ink: Rgb; price: Rgb } => ({
  board: hsl(hueOf(n), 0.12, 0.95),
  ink: sold ? hsl(150, 0.6, 0.3) : hsl(355, 0.7, 0.42),
  price: hsl(hueOf(n), 0.6, 0.18),
});

/**
 * `of` at a depth between floors: `depth` is a floor number plus how many
 * halvings an eye has shrunk past it, so a body shrinking from floor `n` to a
 * person of `n + 1` passes from `of(n)` to `of(n + 1)` and arrives exactly.
 * A depth on a floor asks `of` for that floor alone, so the deepest floor
 * needs none below it.
 */
export function between(of: (n: number) => Rgb, depth: number): Rgb {
  const n = Math.floor(depth);
  const along = depth - n;
  const from = of(n);
  if (along === 0) return from;
  const to = of(n + 1);
  return [
    from[0] + (to[0] - from[0]) * along,
    from[1] + (to[1] - from[1]) * along,
    from[2] + (to[2] - from[2]) * along,
  ];
}
