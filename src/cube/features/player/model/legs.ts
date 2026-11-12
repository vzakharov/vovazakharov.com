import { lerp, ramp, smooth } from '@/cube/shared/lib/ease';
import { CUBE_METRES, toCube } from '@/cube/shared/outside';
import {
  cross,
  dot,
  loft,
  minus,
  plus,
  type Quad,
  type Ring,
  type Room,
  times,
  unit,
  UP,
  type Vec3,
} from '@/cube/entities/world';

import { type Bearing, EYE_OVER_SAND, type Land } from './roam';

/** The room the outside is drawn in the frame of: floor 1's. */
const FRAME: Room = { n: 1, x: 0n, y: 0n };

/** Bone lengths and girths, in metres: a body 1.6 m to the eye. */
const THIGH = 0.45;
const SHIN = 0.45;
const HIPS_UNDER_EYE = 0.68;
const HIPS_APART = 0.095;
const ANKLE_HIGH = 0.075;
const FOOT_LONG = 0.19;
const STEP = 0.28;

const TROUSERS = 0x4e_53_5c;
const LEG_SIDES = 10;
const TORSO_SIDES = 12;

/**
 * A ring at `centre` square to `along`: `wide` towards `aside`, which is
 * never along it, and `thick` the other way across.
 */
function ringAt(
  centre: Vec3,
  along: Vec3,
  aside: Vec3,
  wide: number,
  thick = wide,
): Ring {
  const across = unit(minus(aside, times(along, dot(aside, along))));
  return {
    centre,
    wide: times(across, wide),
    thick: times(unit(cross(across, along)), thick),
  };
}

/** The knee of a leg from `hip` to `ankle`, bent towards `fore`. */
function kneeOf(hip: Vec3, ankle: Vec3, fore: Vec3): Vec3 {
  const span = minus(ankle, hip);
  const far = Math.min(Math.hypot(...span), THIGH + SHIN - 1e-3);
  const along = unit(span);
  const down = (THIGH * THIGH - SHIN * SHIN + far * far) / (2 * far);
  const out = Math.sqrt(Math.max(0, THIGH * THIGH - down * down));
  const bend = unit(minus(fore, times(along, dot(fore, along))));
  return plus(hip, plus(times(along, down), times(bend, out)));
}

/**
 * One leg in its trouser and its bare foot: its knee bent towards `bend`,
 * `toes` the way the foot points, `aside` the body's right.
 */
function leg(
  hip: Vec3,
  ankle: Vec3,
  bend: Vec3,
  toes: Vec3,
  aside: Vec3,
): Ring[][] {
  const knee = kneeOf(hip, ankle, bend);
  const thigh = unit(minus(knee, hip));
  const shin = unit(minus(ankle, knee));
  const mid = unit(plus(thigh, shin));
  const between = (a: Vec3, b: Vec3, share: number): Vec3 =>
    plus(a, times(minus(b, a), share));
  const trouser = [
    ringAt(hip, thigh, aside, 0.092),
    ringAt(between(hip, knee, 0.5), thigh, aside, 0.08),
    ringAt(knee, mid, aside, 0.064),
    ringAt(between(knee, ankle, 0.45), shin, aside, 0.06),
    ringAt(between(knee, ankle, 0.93), shin, aside, 0.056),
    ringAt(between(knee, ankle, 0.96), shin, aside, 0.02),
  ];
  // The sole faces away from the shin, square to the toes.
  const sole = unit(plus(shin, times(toes, -dot(shin, toes))));
  const along = (ahead: number, low: number): Vec3 =>
    plus(ankle, plus(times(toes, ahead), times(sole, low)));
  const foot = [
    ringAt(between(knee, ankle, 0.9), shin, aside, 0.036),
    ringAt(ankle, shin, aside, 0.036),
    ringAt(along(-0.035, 0.045), toes, aside, 0.032, 0.03),
    ringAt(along(0.05, 0.04), toes, aside, 0.042, 0.032),
    ringAt(along(FOOT_LONG * 0.7, 0.052), toes, aside, 0.048, 0.02),
    ringAt(along(FOOT_LONG, 0.058), toes, aside, 0.042, 0.014),
    ringAt(along(FOOT_LONG + 0.012, 0.06), toes, aside, 0.006, 0.002),
  ];
  return [trouser, foot];
}

/** `rings` of the world, in the frame the outside is drawn in. */
const framed = (rings: readonly Ring[]): Ring[] =>
  rings.map(({ centre, wide, thick }) => ({
    centre: toCube(centre),
    wide: times(wide, 1 / CUBE_METRES),
    thick: times(thick, 1 / CUBE_METRES),
  }));

/**
 * The body's own trunk, legs and feet as its eye sees them out of doors, in
 * the frame of floor 1's room: grey trousers, bare feet, in the hands' manner.
 *
 * On its feet the legs stand under the eye and stride with `swing`; sitting
 * or lying they stretch from the seat the way it heads, and the trunk leans
 * from there to the eye; afloat they trail behind and kick.
 */
export function legsOf(
  { eye, yaw, seat, swing, afloat }: Bearing,
  land: Land,
): Quad[] {
  const [eyeX, eyeY, eyeZ] = eye;
  const over = eyeY - land.height(eyeX, eyeZ);
  // How far the body is up on its feet rather than down on its seat.
  const up = seat === null ? 1 : smooth(ramp(over, 0.85, 1.35));
  const heading = seat === null ? yaw : lerp(seat.lies, yaw, up);
  const fore: Vec3 = [Math.cos(heading), 0, Math.sin(heading)];
  const right: Vec3 = [-fore[2], 0, fore[0]];
  const under: readonly [number, number] = [
    eyeX - 0.06 * fore[0],
    eyeZ - 0.06 * fore[2],
  ];
  const [hipX, hipZ] =
    seat === null
      ? under
      : [lerp(seat.at[0], under[0], up), lerp(seat.at[1], under[1], up)];
  const floor = Math.max(land.height(hipX, hipZ), eyeY - EYE_OVER_SAND);
  const hips: Vec3 = afloat
    ? plus(eye, plus(times(fore, -0.5), [0, -0.32, 0]))
    : [
        hipX,
        Math.max(floor + (seat ? 0.1 : 0.32), eyeY - HIPS_UNDER_EYE),
        hipZ,
      ];
  const quads = ([-1, 1] as const).flatMap((side) => {
    const hip = plus(hips, times(right, side * HIPS_APART));
    const stride = side * swing * STEP * up;
    // Lying, the leg lies out along the heading; standing, it is under the hip.
    const reach = afloat ? -0.8 : lerp(0.86, 0, up) + stride;
    const [x, z] = [hip[0] + fore[0] * reach, hip[2] + fore[2] * reach];
    const ankle: Vec3 = afloat
      ? [x, hips[1] - 0.22 + 0.12 * side * swing, z]
      : [x, Math.max(land.height(x, z), eyeY - EYE_OVER_SAND) + ANKLE_HIGH, z];
    const lain = 1 - up;
    const toes = afloat
      ? unit(plus(times(fore, -1), [0, -0.3, 0]))
      : unit(plus(times(fore, 1 - 0.75 * lain), [0, lain, 0]));
    const bend = afloat ? UP : unit(plus(fore, [0, 0.6 * lain, 0]));
    const [trouser, foot] = leg(hip, ankle, bend, toes, right);
    return [
      ...loft(framed(trouser ?? []), FRAME, {
        surface: 'fabric',
        paint: TROUSERS,
        sides: LEG_SIDES,
      }),
      ...loft(framed(foot ?? []), FRAME, { surface: 'skin', sides: 8 }),
    ];
  });
  const neck = plus(hips, times(minus(eye, hips), 0.7));
  const spine = unit(minus(neck, hips));
  const at = (share: number): Vec3 =>
    plus(hips, times(minus(neck, hips), share));
  const trunk = [
    ringAt(at(-0.08), spine, right, 0.02, 0.02),
    ringAt(at(0), spine, right, 0.17, 0.11),
    ringAt(at(0.35), spine, right, 0.15, 0.1),
    ringAt(at(0.8), spine, right, 0.18, 0.11),
    ringAt(at(1), spine, right, 0.17, 0.09),
    ringAt(at(1.06), spine, right, 0.03, 0.02),
  ];
  return [
    ...quads,
    ...loft(framed(trunk), FRAME, { surface: 'fabric', sides: TORSO_SIDES }),
  ];
}
