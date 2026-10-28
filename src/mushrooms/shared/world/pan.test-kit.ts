import { move, type Pan, press, type View } from './pan';

/** A tablet held sideways over a world twice its width. */
export const TABLET: View = { width: 1180, world: 2360, unit: 100 };

export const FRAME = 1 / 60;

/** `pan` pressed at `x` and dragged by `by` in `steps` moves over `seconds`, from `time`. */
export function dragged(
  pan: Pan,
  x: number,
  by: number,
  { time = 0, steps = 10, seconds = 0.2 } = {},
): Pan {
  let moving = press(pan, x, time);
  for (let index = 1; index <= steps; index++) {
    moving = move(
      moving,
      x + (by * index) / steps,
      time + (seconds * index) / steps,
    );
  }
  return moving;
}
