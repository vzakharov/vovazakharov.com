import type { Address, Pose, Standing } from '@/cube/entities/world';

/** Seconds between writes while the walk keeps moving within one room. */
export const WRITE_EVERY = 0.5;

const standingOf = ({ n, x, y, u, v, yaw, elevation }: Pose): Standing => ({
  n,
  x,
  y,
  u,
  v,
  yaw,
  elevation,
});

const sameRoom = (a: Standing, b: Standing): boolean =>
  a.n === b.n && a.x === b.x && a.y === b.y;

const samePlace = (a: Standing, b: Standing): boolean =>
  sameRoom(a, b) &&
  a.u === b.u &&
  a.v === b.v &&
  a.yaw === b.yaw &&
  a.elevation === b.elevation;

/** One frame of a walk: its pose, whether it stands, and the seconds it took. */
export type Follow = (pose: Pose, standing: boolean, seconds: number) => void;

/**
 * Follows a walk from floor `floor`, landed on through `hatch`, frame by
 * frame, handing `write` the fragment `encode` spells for it: at once on its
 * first frame and on a new room or floor, and within a room at most every
 * `WRITE_EVERY` seconds while it moves and once more when it stops. A frame
 * not standing writes nothing, so mid-shrink the fragment stays the last
 * standing place; landing a floor down makes the room landed in the hatch.
 * Only the latest write lands, and a failed encoding or a floor the walk did
 * not land on goes to `onError`.
 */
export function followAddress(
  floor: number,
  hatch: Address['hatch'],
  encode: (address: Address) => Promise<string>,
  write: (fragment: string) => void,
  onError: (error: Error) => void,
): Follow {
  let on = floor;
  let landed = hatch;
  let written: Standing | null = null;
  let previous: Standing | null = null;
  let since = 0;
  let issued = 0;
  return (pose, standing, seconds) => {
    since += seconds;
    if (!standing) return;
    const { n, x, y } = pose;
    if (n === on + 1) {
      on = n;
      landed = { x, y };
    } else if (n !== on) {
      onError(
        new Error(`Floor ${String(n)} was not landed on from ${String(on)}`),
      );
      return;
    }
    const here = standingOf(pose);
    const moving = previous !== null && !samePlace(here, previous);
    previous = here;
    if (written !== null) {
      if (samePlace(here, written)) return;
      if (sameRoom(here, written) && moving && since < WRITE_EVERY) return;
    }
    written = here;
    since = 0;
    issued += 1;
    const ticket = issued;
    encode({ hatch: landed, at: here })
      .then((fragment) => {
        if (ticket === issued) write(fragment);
      })
      .catch(onError);
  };
}
