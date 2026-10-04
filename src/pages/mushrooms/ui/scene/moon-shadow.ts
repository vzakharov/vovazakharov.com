import { type Circle, type Point, sample } from '../../model/geometry';

/**
 * The moon's shadow: its disc less a disc as large, moved `offset` (a share
 * of the radius, under 2) toward the angle `lit` — a crescent on the far
 * side, widest opposite `lit`. The outline runs the moon's own rim from one
 * meeting of the two circles round to the other, then back along the moved
 * disc's rim, `steps` chords each.
 */
export function moonShadow(
  { x, y, r }: Circle,
  lit: number,
  offset: number,
  steps: number,
): Point[] {
  const shift = offset * r;
  // Where the two rims meet, as an angle off `lit` on either circle.
  const meet = Math.acos(shift / 2 / r);
  const moved = { x: x + Math.cos(lit) * shift, y: y + Math.sin(lit) * shift };
  const on = (centre: Point) => (angle: number) => ({
    x: centre.x + Math.cos(lit + angle) * r,
    y: centre.y + Math.sin(lit + angle) * r,
  });
  return [
    ...sample(meet, 2 * Math.PI - meet, steps, on({ x, y })),
    ...sample(Math.PI + meet, Math.PI - meet, steps, on(moved)).slice(1, -1),
  ];
}
