/**
 * The spirit's eye: a point over the island plane that falls, climbs and
 * glides with no bob. Height changes multiplicatively, so every doubling
 * takes the same time, and sideways speed is proportional to height, so
 * going far means climbing first.
 *
 * Input moves an aim — place, height and heading; the eye eases toward it
 * with time constant `EASE_SECONDS`, so a wheel notch, a key press or a turn
 * reads as a glide rather than a step. The ground the height is measured from, `floor`, eases toward
 * the surface under the eye too, so terrain passing below does not jolt it.
 */

import { type Elevated, type PlanePoint, R } from '@/island/shared/globe';

export type Vec2 = readonly [number, number];

type Headed = {
  /** Which way screen-up faces on the plane, radians clockwise from north. */
  readonly heading: number;
};

/** A place, height and heading: where the eye is, or where it eases to. */
type Placed = PlanePoint & Elevated & Headed;

/** In plane metres; `height` is above `floor`. */
export type Eye = Placed & {
  /**
   * The level, in metres above the sea, `height` stands on: the surface
   * under the eye, eased. Eye and surface are never closer than
   * `MIN_HEIGHT`.
   */
  readonly floor: number;
  /** Where the eye is easing to; `height` there is above the floor too. */
  readonly aim: Placed;
};

/**
 * What the player asks of the eye over one frame. `steer`, `climb` and
 * `turn` are held, each component in `[-1, 1]` and applied per second;
 * `shift`, `doublings` and `twist` are what arrived since the last frame,
 * applied whole.
 */
export type Intent = {
  /** Held sideways intent: screen-right, screen-up. */
  readonly steer: Vec2;
  /** Held climb: `1` climbs at `CLIMB_DOUBLINGS_PER_SECOND`, `-1` falls. */
  readonly climb: number;
  /** Held turn: `1` turns clockwise at `TURN_RADIANS_PER_SECOND`. */
  readonly turn: number;
  /** The eye's own move, screen-right and screen-up, in its heights. */
  readonly shift: Vec2;
  /** How many times over the height doubles; negative halves it. */
  readonly doublings: number;
  /** Radians the heading turns clockwise. */
  readonly twist: number;
};

/** Ground level, in metres above the sea, at plane point `(x, y)`. */
export type GroundAt = (x: number, y: number) => number;

export const MIN_HEIGHT = 2;

/** About 20,000 km: the whole planet in view, the island a patch on it. */
export const MAX_HEIGHT = 20_000_000;

/**
 * Doublings a held climb key makes per second: orbit to two metres, 23
 * halvings, in about nine seconds.
 */
export const CLIMB_DOUBLINGS_PER_SECOND = 2.5;

/** Ground crossed per second by a held steer key, in heights. */
export const HEIGHTS_PER_SECOND = 1;

/**
 * How fast a held turn key turns the heading: a quarter turn in about a
 * second. An angle, so it reads the same at every height.
 */
export const TURN_RADIANS_PER_SECOND = (80 * Math.PI) / 180;

const FULL_TURN = 2 * Math.PI;

/** Time constant of the glide from where the eye is toward its aim. */
const EASE_SECONDS = 0.15;

/**
 * Time constant of the floor following the surface: long enough that ground
 * the eye crosses at its own height's scale smooths out.
 */
const FLOOR_SECONDS = 0.6;

/**
 * The furthest the eye goes from the island's centre on the plane, three
 * quarters of the way to the antipode, past which the plane's frame folds.
 */
const PLANE_LIMIT = 0.75 * Math.PI * R;

/** No input: what a frame with nothing pressed steps by. */
export const IDLE: Intent = {
  steer: [0, 0],
  climb: 0,
  turn: 0,
  shift: [0, 0],
  doublings: 0,
  twist: 0,
};

const clamp = (value: number, low: number, high: number) =>
  Math.min(high, Math.max(low, value));

/** The sea counts as ground: nothing under the eye is below it. */
const surfaceAt = (groundAt: GroundAt, x: number, y: number) =>
  Math.max(0, groundAt(x, y));

const withinPlane = <P extends PlanePoint>(point: P): P => {
  const d = Math.hypot(point.x, point.y);
  if (d <= PLANE_LIMIT) return point;
  const k = PLANE_LIMIT / d;
  return { ...point, x: point.x * k, y: point.y * k };
};

/** An eye at rest at `place`, its floor the surface there. */
export function eyeAt(
  place: PlanePoint & { height: number; heading?: number },
  groundAt: GroundAt,
): Eye {
  const { x, y } = withinPlane(place);
  const height = clamp(place.height, MIN_HEIGHT, MAX_HEIGHT);
  const heading = place.heading ?? 0;
  return {
    x,
    y,
    height,
    floor: surfaceAt(groundAt, x, y),
    heading,
    aim: { x, y, height, heading },
  };
}

/** `eye` set to `height` at once, no glide: a jump rather than a fall. */
export function withHeight(eye: Eye, height: number): Eye {
  const set = clamp(height, MIN_HEIGHT, MAX_HEIGHT);
  return { ...eye, height: set, aim: { ...eye.aim, height: set } };
}

/** Screen-right and screen-up turned into plane east and north. */
function onPlane(heading: number, [right, up]: Vec2): Vec2 {
  const sin = Math.sin(heading);
  const cos = Math.cos(heading);
  return [up * sin + right * cos, up * cos - right * sin];
}

/**
 * The aim moved by `intent` over `dt` seconds, at the eye's own height and
 * along the heading the screen faces now, so a drag follows what is seen.
 */
function aimed(eye: Eye, intent: Intent, dt: number): Eye['aim'] {
  const reach = eye.height;
  const [east, north] = onPlane(eye.heading, [
    intent.steer[0] * HEIGHTS_PER_SECOND * dt + intent.shift[0],
    intent.steer[1] * HEIGHTS_PER_SECOND * dt + intent.shift[1],
  ]);
  const doublings =
    intent.climb * CLIMB_DOUBLINGS_PER_SECOND * dt + intent.doublings;
  return withinPlane({
    x: eye.aim.x + east * reach,
    y: eye.aim.y + north * reach,
    height: clamp(eye.aim.height * 2 ** doublings, MIN_HEIGHT, MAX_HEIGHT),
    heading:
      eye.aim.heading +
      intent.turn * TURN_RADIANS_PER_SECOND * dt +
      intent.twist,
  });
}

/** How far toward a target a quantity eases over `dt` with time constant `tau`. */
const easing = (dt: number, tau: number) => 1 - Math.exp(-dt / tau);

/**
 * The eye `dt` seconds on, moved by `intent`: the aim moves first, then the
 * eye eases toward it — in the logarithm of height, so a climb is as smooth
 * at orbit as at the ground — then the floor eases toward the surface now
 * under the eye, and the eye is lifted if that left it under `MIN_HEIGHT`.
 * The aim's heading stays within half a turn of north, and the eye's moves
 * by the same whole turns, so the two never ease the long way round.
 */
export function step(
  eye: Eye,
  intent: Intent,
  dt: number,
  groundAt: GroundAt,
): Eye {
  const aim = aimed(eye, intent, dt);
  const toward = easing(dt, EASE_SECONDS);
  const x = eye.x + (aim.x - eye.x) * toward;
  const y = eye.y + (aim.y - eye.y) * toward;
  const eased = eye.height * (aim.height / eye.height) ** toward;
  const heading = eye.heading + (aim.heading - eye.heading) * toward;
  const turns = Math.round(aim.heading / FULL_TURN) * FULL_TURN;
  const surface = surfaceAt(groundAt, x, y);
  const floor = eye.floor + (surface - eye.floor) * easing(dt, FLOOR_SECONDS);
  const height = clamp(
    Math.max(eased, surface + MIN_HEIGHT - floor),
    MIN_HEIGHT,
    MAX_HEIGHT,
  );
  return {
    x,
    y,
    height,
    floor,
    heading: heading - turns,
    aim: { ...aim, heading: aim.heading - turns },
  };
}
