/**
 * Where the gait button stands: beside the map button, on a spot the other
 * buttons, the pickers, the cross and the sun leave free, so that it moves
 * none of them on any screen.
 */

import type { Circle } from '../../model/geometry';
import type { MeadowLayout } from './layout';
import { PICK_APART, PICK_CLEAR } from './picker-rows';
import { type Controls, flowerPicker, standingControls } from './sky-layout';
import { SUN_RAY_REACH } from './sun-layout';
import { apart, BUTTON_INSET, tapReach } from './tap-reach';

/** The gait button's radius: drawn smaller than a finger, though one reaches it as far (`tapReach`). */
const GAIT_R = 22;
/** The step, in CSS px, of the grid round the map button a spot is looked for on. */
const SPOT_STEP = 4;

/** What the gait button keeps off: the screen's edges, every control, the cross and the sun. */
type GaitScreen = Controls &
  Pick<MeadowLayout, 'width' | 'height' | 'groundTop' | 'sun' | 'cross'>;

/**
 * The gait button right of the map button, their reaches touching; under it
 * where that spot is not free; else the free spot nearest the map button.
 * Free is in the sky, every standing button's reach clear of it, every
 * picker's stage `PICK_CLEAR` off it (`PICK_APART`, a four-button row in its
 * band), and the sun's rays `BUTTON_INSET` off it, as they keep off every
 * button. A sky too full for any such spot has it stand over a picker's
 * row instead, as the insects' buttons do there, and give way to it; one
 * too full for that too, anywhere on the screen its reach clears the rays.
 */
export function gaitSpot(
  screen: GaitScreen,
): Pick<Controls, 'gait' | 'yielding'> {
  const { width, height, groundTop, yielding } = screen;
  const { standing, picked } = freeOf(screen);
  const free = nearestSpot(
    screen,
    (spot) => standing(spot, groundTop, BUTTON_INSET) && picked(spot),
  );
  if (free) return { gait: free, yielding };
  const giving =
    nearestSpot(screen, (spot) => standing(spot, groundTop, BUTTON_INSET)) ??
    nearestSpot(screen, (spot) => standing(spot, height, 0));
  if (!giving) {
    throw new Error(
      `No spot for the gait button on a ${String(width)}×${String(height)} screen`,
    );
  }
  return { gait: giving, yielding: [...yielding, 'gait'] };
}

/** The first spot `fits`: right of the map button, under it, or the nearest on a grid round it. */
function nearestSpot(
  { map, width, height }: GaitScreen,
  fits: (spot: Circle) => boolean,
): Circle | undefined {
  const step = tapReach(map.r) + tapReach(GAIT_R);
  const right = { ...map, x: map.x + step, r: GAIT_R };
  const under = { ...map, y: map.y + step, r: GAIT_R };
  if (fits(right)) return right;
  if (fits(under)) return under;
  let nearest: { spot: Circle; distance: number } | undefined;
  // The grid runs through the map button's centre, so the spots in line with it are on it.
  for (let y = map.y % SPOT_STEP; y <= height; y += SPOT_STEP) {
    for (let x = map.x % SPOT_STEP; x <= width; x += SPOT_STEP) {
      const distance = Math.hypot(x - map.x, y - map.y);
      if (nearest && distance >= nearest.distance) continue;
      const spot = { x, y, r: GAIT_R };
      if (fits(spot)) nearest = { spot, distance };
    }
  }
  return nearest?.spot;
}

/**
 * Whether a gait button at a spot stands on the screen above `floor`, clear
 * of the standing buttons and `inset` off the sun's rays (`standing`), and
 * whether it keeps off the pickers' stages (`picked`), as `gaitSpot` has it.
 */
function freeOf({ width, sun, ...controls }: GaitScreen) {
  const reach = tapReach(GAIT_R);
  const { colours, shapes, cross } = flowerPicker(controls);
  const buttons = standingControls(controls);
  const fourAbreast = [...controls.picker, ...shapes];
  const fiveAbreast = [...controls.housePicker, ...colours, cross];
  const rays = sun.r * SUN_RAY_REACH;
  return {
    standing: (spot: Circle, floor: number, inset: number) =>
      spot.x - GAIT_R >= BUTTON_INSET &&
      spot.y - GAIT_R >= BUTTON_INSET &&
      spot.x + GAIT_R <= width - BUTTON_INSET &&
      spot.y + reach <= floor &&
      buttons.every((button) => apart(spot, button, 0)) &&
      Math.hypot(spot.x - sun.x, spot.y - sun.y) >= reach + inset + rays,
    picked: (spot: Circle) =>
      // The four-button rows keep `PICK_APART` off a button in their band,
      // as off every control beside them.
      fourAbreast.every((pick) =>
        apart(
          spot,
          pick,
          Math.abs(spot.y - pick.y) < tapReach(pick.r) + reach
            ? PICK_APART
            : PICK_CLEAR,
        ),
      ) && fiveAbreast.every((pick) => apart(spot, pick, PICK_CLEAR)),
  };
}
