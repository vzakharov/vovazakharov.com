import { mix } from './colour';
import { PALETTE } from './palette';

/** The duskness, 0 to 1 (`duskness`), a thing's paint was toned for. */
export type Dusked = { dusk: number };

/** What distance takes a colour toward `dusk` of the way to full dusk: the day's `air`, turning to `airDusk`. */
export function hazeAir(dusk: number): number {
  return mix(PALETTE.air, PALETTE.airDusk, dusk);
}

/** Takes a colour `haze` of the way toward the air at `dusk` (`hazeAir`). */
export function hazeTone(
  haze: number,
  dusk: number,
): (colour: number) => number {
  const air = hazeAir(dusk);
  return (colour) => mix(colour, air, haze);
}
