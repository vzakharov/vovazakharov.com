/**
 * The spirit's eye on the sphere: the planar eye's controls, speeds and
 * easing, over a point on the unit sphere and a tangent heading carried
 * along as it moves. No latitude, longitude or heading angle is held, so a
 * pole is an ordinary point; angles appear only where a place is named
 * (`eyeAt`, `withHeading`, `headingOf`). The look up and down is an offset
 * from the pitch the height gives, eased like the turn (`./look`).
 */

import {
  cross,
  type Elevated,
  type LatLon,
  latLonToUnit,
  planeToWorld,
  R,
  scaled,
  sum,
  unit,
  unitToLatLon,
  type Vec3,
} from '@/island/shared/globe';

import {
  clamp,
  CLIMB_DOUBLINGS_PER_SECOND,
  EASE_SECONDS,
  easing,
  FLOOR_SECONDS,
  type Floored,
  HEIGHTS_PER_SECOND,
  IDLE,
  type Intent as PlaneIntent,
  MAX_HEIGHT,
  MIN_HEIGHT,
  TURN_RADIANS_PER_SECOND,
} from './eye';
import {
  type Looked,
  lookWithin,
  TILT_RADIANS_PER_SECOND,
  type Tilting,
  UNTILTED,
} from './look';
import {
  aheadAt,
  headingAt,
  partOf,
  rotated,
  signedAngle,
  tangent,
  turnBetween,
} from './turns';

/** Where on the sphere, and which way screen-up faces there. */
type Facing = {
  /** Unit vector from the planet's centre. */
  readonly at: Vec3;
  /** Unit tangent at `at` that screen-up faces along. */
  readonly ahead: Vec3;
};

/** A place, height, facing and look: where the eye is, or where it eases to. */
type Poised = Facing & Elevated & Looked;

/** `height` is above `floor`. */
export type Eye = Poised &
  Floored & {
    /** Where the eye is easing to; `height` there is above the floor too. */
    readonly aim: Poised;
  };

/** What the player asks of the eye over one frame: the planar eye's, and the look. */
export type Intent = PlaneIntent & Tilting;

/** No input, the look's included: what a frame with nothing pressed steps by. */
export const STILL: Intent = { ...IDLE, ...UNTILTED };

/** Ground level, in metres above the sea, under unit vector `p`. */
export type GroundAt = (p: Vec3) => number;

/** A named place to open at: heading radians clockwise from north, `0` if absent. */
export type Opening = LatLon & Elevated & { readonly heading?: number };

/** Where `/island` opened on the plane: its origin, at orbit, facing north. */
export const ISLAND_OPENING: Opening = {
  ...unitToLatLon(planeToWorld(0, 0)),
  height: MAX_HEIGHT,
};

const DEGREE = Math.PI / 180;

/** Earth's opening: over the Mediterranean, at orbit, facing north. */
export const EARTH_OPENING: Opening = {
  lat: 38 * DEGREE,
  lon: 15 * DEGREE,
  height: MAX_HEIGHT,
};

/** World #0 is Earth and opens over it; every other world opens at the island's. */
export const openingOf = (world: number): Opening =>
  world === 0 ? EARTH_OPENING : ISLAND_OPENING;

/** The sea counts as ground: nothing under the eye is below it. */
const surfaceAt = (groundAt: GroundAt, p: Vec3) => Math.max(0, groundAt(p));

/** An eye at rest at `place`, its floor the surface there. */
export function eyeAt(place: Opening, groundAt: GroundAt): Eye {
  const at = latLonToUnit(place);
  const ahead = aheadAt(at, place.heading ?? 0);
  const height = clamp(place.height, MIN_HEIGHT, MAX_HEIGHT);
  return {
    at,
    ahead,
    height,
    look: 0,
    floor: surfaceAt(groundAt, at),
    aim: { at, ahead, height, look: 0 },
  };
}

/** `eye` set to `height` at once, no glide: a jump rather than a fall. */
export function withHeight(eye: Eye, height: number): Eye {
  const set = clamp(height, MIN_HEIGHT, MAX_HEIGHT);
  return { ...eye, height: set, aim: { ...eye.aim, height: set } };
}

/** `eye` turned at once, no glide, to `heading` radians clockwise from north. */
export function withHeading(eye: Eye, heading: number): Eye {
  return {
    ...eye,
    ahead: aheadAt(eye.at, heading),
    aim: { ...eye.aim, ahead: aheadAt(eye.aim.at, heading) },
  };
}

/** Which way screen-up faces, radians clockwise from north. */
export const headingOf = (eye: Eye) => headingAt(eye.at, eye.ahead);

/**
 * The aim moved by `intent` over `dt` seconds, at the eye's own height and
 * along the facing the screen shows now, carried to the aim, so a drag
 * follows what is seen. The move is along a great circle, which carries the
 * aim's facing with it; the turn is then about the aim's point. The look is
 * kept within what the aim's height lets show, so a key held past a limit
 * banks nothing to unwind.
 */
function aimed(eye: Eye, intent: Intent, dt: number): Eye['aim'] {
  const reach = eye.height;
  const right =
    (intent.steer[0] * HEIGHTS_PER_SECOND * dt + intent.shift[0]) * reach;
  const up =
    (intent.steer[1] * HEIGHTS_PER_SECOND * dt + intent.shift[1]) * reach;
  const seen = sum(
    scaled(cross(eye.ahead, eye.at), right),
    scaled(eye.ahead, up),
  );
  const toAim = turnBetween(eye.at, eye.aim.at, eye.ahead);
  const way = rotated(seen, toAim);
  const metres = Math.hypot(right, up);
  const move =
    metres === 0
      ? { axis: eye.aim.at, radians: 0 }
      : { axis: unit(cross(eye.aim.at, way)), radians: metres / R };
  const at = unit(rotated(eye.aim.at, move));
  const carried = rotated(eye.aim.ahead, move);
  const turn = intent.turn * TURN_RADIANS_PER_SECOND * dt + intent.twist;
  const doublings =
    intent.climb * CLIMB_DOUBLINGS_PER_SECOND * dt + intent.doublings;
  const height = clamp(
    eye.aim.height * 2 ** doublings,
    MIN_HEIGHT,
    MAX_HEIGHT,
  );
  const tilt = intent.tilt * TILT_RADIANS_PER_SECOND * dt + intent.nod;
  return {
    at,
    ahead: tangent(rotated(carried, { axis: at, radians: -turn }), at),
    height,
    look: lookWithin(eye.aim.look + tilt, height),
  };
}

/**
 * The eye `dt` seconds on, moved by `intent`: the aim moves first, then the
 * eye eases toward it — along the great circle to the aim's point, carrying
 * its facing, which then turns the shorter way toward the aim's facing
 * carried to the same point; height in its logarithm, so a climb is as
 * smooth at orbit as at the ground; the look straight — then the floor eases toward the surface
 * now under the eye, and the eye is lifted if that left it under
 * `MIN_HEIGHT`.
 */
export function step(
  eye: Eye,
  intent: Intent,
  dt: number,
  groundAt: GroundAt,
): Eye {
  const aim = aimed(eye, intent, dt);
  const toward = easing(dt, EASE_SECONDS);
  const glide = partOf(turnBetween(eye.at, aim.at, eye.ahead), toward);
  const at = unit(rotated(eye.at, glide));
  const carried = tangent(rotated(eye.ahead, glide), at);
  const wanted = tangent(
    rotated(aim.ahead, turnBetween(aim.at, at, aim.ahead)),
    at,
  );
  const ahead = tangent(
    rotated(carried, {
      axis: at,
      radians: signedAngle(carried, wanted, at) * toward,
    }),
    at,
  );
  const eased = eye.height * (aim.height / eye.height) ** toward;
  const look = eye.look + (aim.look - eye.look) * toward;
  const surface = surfaceAt(groundAt, at);
  const floor = eye.floor + (surface - eye.floor) * easing(dt, FLOOR_SECONDS);
  const height = clamp(
    Math.max(eased, surface + MIN_HEIGHT - floor),
    MIN_HEIGHT,
    MAX_HEIGHT,
  );
  return { at, ahead, height, look, floor, aim };
}
