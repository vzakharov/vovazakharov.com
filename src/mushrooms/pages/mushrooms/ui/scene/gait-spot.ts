/**
 * Where the gait button stands: beside the map button or the insects' buttons
 * lined up with it, on a spot the other buttons, the pickers, the cross and
 * the sun leave free, so that it moves none of them on any screen.
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
 * The gait button on the first free spot beside the line of buttons the map
 * button heads (`besideLines`). Free is in the sky, every standing button's
 * reach clear of it, every picker's stage `PICK_CLEAR` off it (`PICK_APART`,
 * a four-button row in its band), and the sun's rays `BUTTON_INSET` off it,
 * as they keep off every button. Where none of those spots is free but one
 * is blocked only by a picker's stage, it stands there and gives way to the
 * picker, as the insects' buttons do: a button alone out in the sky reads as
 * nobody's. Failing both, the free spot nearest the map button; then, giving
 * way, the nearest in the sky `BUTTON_INSET` off the rays, then merely clear
 * of them, and only where the sky has no such spot, on the meadow.
 */
export function gaitSpot(
  screen: GaitScreen,
): Pick<Controls, 'gait' | 'yielding'> {
  const { width, height, groundTop, yielding } = screen;
  const { standing, picked } = freeOf(screen);
  const sky = (spot: Circle) => standing(spot, groundTop, BUTTON_INSET);
  const free = (spot: Circle) => sky(spot) && picked(spot);
  const lines = besideLines(screen);
  const freeBeside = lines.find((spot) => free(spot));
  if (freeBeside) return { gait: freeBeside, yielding };
  const givingBeside = lines.find((spot) => sky(spot));
  const freeElsewhere = givingBeside ? undefined : nearestSpot(screen, free);
  if (freeElsewhere) return { gait: freeElsewhere, yielding };
  const giving =
    givingBeside ??
    nearestSpot(screen, sky) ??
    nearestSpot(screen, (spot) => standing(spot, groundTop, 0)) ??
    nearestSpot(screen, (spot) => standing(spot, height, 0));
  if (!giving) {
    throw new Error(
      `No spot for the gait button on a ${String(width)}×${String(height)} screen`,
    );
  }
  return { gait: giving, yielding: [...yielding, 'gait'] };
}

/** The first spot `fits` beside the map button's lines (`besideLines`), or else the nearest on a grid round it. */
function nearestSpot(
  screen: GaitScreen,
  fits: (spot: Circle) => boolean,
): Circle | undefined {
  const { map, width, height } = screen;
  const beside = besideLines(screen).find((spot) => fits(spot));
  if (beside) return beside;
  let nearest: { spot: Circle; distance: number } | undefined;
  // The grid runs through the map button's centre, so the spots in line with it are on it.
  for (let y = map.y % SPOT_STEP; y <= height; y += SPOT_STEP) {
    // A row as far off the map button as the nearest spot yet holds none nearer.
    if (nearest && Math.abs(y - map.y) >= nearest.distance) {
      if (y > map.y) break;
      continue;
    }
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
 * Right of the map button, under it, and under the last insect's button in
 * its column where that column lines up under the map button
 * (`placeColumns`), each their reaches touching.
 */
function besideLines({ map, releases }: GaitScreen): Circle[] {
  const column = Object.values(releases).filter(
    (button) => button.x - button.r === map.x - map.r,
  );
  const lowest = Math.max(...column.map((button) => button.y));
  const columnEnd = column.find((button) => button.y === lowest) ?? map;
  const next = (button: Circle, across: 0 | 1) => {
    const step = tapReach(button.r) + tapReach(GAIT_R);
    return {
      x: button.x + step * across,
      y: button.y + step * (1 - across),
      r: GAIT_R,
    };
  };
  return [next(map, 1), next(map, 0), next(columnEnd, 0)];
}

/**
 * Whether a gait button at a spot stands on the screen above `floor`, clear
 * of the standing buttons and `inset` off the sun's rays (`standing`), and
 * whether it keeps off the pickers' stages (`picked`), as `gaitSpot` has it.
 */
function freeOf({ width, sun, ...controls }: GaitScreen) {
  const reach = tapReach(GAIT_R);
  const { colours, shapes, cross } = flowerPicker(controls);
  // The gait button's own first spot, which `placeControls` holds for it, is no other button's.
  const buttons = standingControls(controls).filter(
    (button) => button !== controls.gait,
  );
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
