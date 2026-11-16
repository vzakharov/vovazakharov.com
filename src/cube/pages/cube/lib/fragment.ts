import type { Address, Hatched, Pose, Standing } from '@/cube/entities/world';

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

/**
 * One frame of a walk: its pose, whether it stands, the seconds it took, and
 * whether a portal carried it to that pose.
 */
export type Follow = (
  pose: Pose,
  standing: boolean,
  seconds: number,
  carried?: boolean,
) => void;

/**
 * Follows a walk from floor `floor`, fallen as deep as `fallen`, frame by
 * frame, handing `write` the fragment `encode` spells for it: at once on its
 * first frame and on a new room or floor, and within a room at most every
 * `WRITE_EVERY` seconds while it moves and once more when it stops. A frame
 * not standing writes nothing, so mid-shrink the fragment stays the last
 * standing place; landing a floor down makes the room landed in the hatch.
 * A frame a portal carried the walk to keeps its hatch on whatever floor it
 * comes out, and the next fragment is `write`'s to `push`: a history entry
 * of its own, the one before it where the walk went in. Only the latest
 * write lands, and a failed encoding or a floor the walk neither landed on
 * nor was carried to goes to `onError`.
 */
export function followAddress(
  floor: number,
  { hatch, fell = floor }: Hatched,
  encode: (address: Address) => Promise<string>,
  write: (fragment: string, push: boolean) => void,
  onError: (error: Error) => void,
): Follow {
  let on = floor;
  let landed = { hatch, fell };
  /** Whether the next fragment written is a history entry of its own. */
  let push = false;
  let written: Standing | null = null;
  let previous: Standing | null = null;
  let since = 0;
  let issued = 0;
  return (pose, standing, seconds, carried = false) => {
    since += seconds;
    const { n, x, y } = pose;
    if (carried) {
      on = n;
      push = true;
    }
    if (!standing) return;
    if (n === on + 1) {
      on = n;
      landed = { hatch: { x, y }, fell: n };
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
    const { fell: deep, ...fallen } = landed;
    encode({ ...fallen, ...(deep === n ? {} : { fell: deep }), at: here })
      .then((fragment) => {
        if (ticket !== issued) return;
        write(fragment, push);
        push = false;
      })
      .catch(onError);
  };
}
