import { pathHash, roll, rollWith } from '@/dice/shared/roll';

import type { Rgb } from '@/cube/shared/lib/colour';
import { ROOM_METRES } from '@/cube/shared/lib/room-shape';
import { SHRUB } from '@/cube/shared/lib/shrub';
import { SUN_DISC } from '@/cube/shared/lib/sun-disc';
import { vec3f, type Wgsl, wgsl } from '@/cube/shared/lib/wgsl';
import { HASH } from '@/cube/shared/lib/wgsl-hash';
import {
  beamPatches,
  DOOR_INNER,
  DOORWAY,
  SHELL_TURN,
  SUN,
  SUN_DIR,
  SUN_LIGHT,
  toShell,
} from '@/cube/shared/outside';

import { CORE } from './core';
import { GRADE } from './grade';
import { type Graded, hazed, lensListing } from './lens';
import { LIGHT } from './light';

const f = (value: number): string => value.toFixed(4);

/** What a plant's shadow salts its leaves' outline and the gaps between them with. */
const SALTS = rollWith(
  roll.struct({
    outline: roll.uniform(0, 2 ** 31),
    gaps: roll.uniform(0, 2 ** 31),
  }),
  (path) => pathHash('0')(`cube/doorway-sun/${path}`),
);
const salt = (value: number): string => `${String(Math.floor(value))}u`;

/** `SHRUB`'s outline as WGSL: its radius at height `y` of a plant `tall`. */
const SHRUB_RADIUS = /* wgsl */ `
/// A potted plant's radius \`y\` metres up it, \`tall\` its own draw of
/// height: the pot, the stem, then the foliage's turns. 0 past either end.
fn shrubRadius(y: f32, tall: f32) -> f32 {
  if (y < 0.0) {
    return 0.0;
  }
  if (y < ${f(SHRUB.pot.height)}) {
    return mix(${f(SHRUB.pot.foot)}, ${f(SHRUB.pot.rim)}, y / ${f(SHRUB.pot.height)});
  }
${SHRUB.foliage
  .map(({ at: [base, perTall], radius }, turn) => {
    const height = `${f(base)} + ${f(perTall)} * tall`;
    const below = SHRUB.foliage[turn - 1];
    if (below === undefined) {
      return `  if (y < ${height}) {\n    return ${f(SHRUB.stem / 2)};\n  }`;
    }
    const foot = `${f(below.at[0])} + ${f(below.at[1])} * tall`;
    return `  if (y < ${height}) {\n    return mix(${f(below.radius)}, ${f(radius)}, (y - (${foot})) / (${height} - (${foot})));\n  }`;
  })
  .join('\n')}
  return 0.0;
}`;

/**
 * The low sun through floor 1's doorway, as a room's only light: the beam
 * itself, soft at its edges as a sun half a degree wide leaves them, with a
 * potted plant's shadow in it; the sky the doorway shows and the beam's own
 * landing places lighting the rest; the dust in the beam's way. All of it
 * is reckoned in the shell's frame, where the doorway is in the east face
 * and the sun where the world has it; \`sunlitRoom\` and \`sunShaft\` take a
 * point of the room there. The floor using it says, in that frame, what
 * stands in the beam and where the beam lands:
 *
 *   fn sunShade(p: vec3f, dir: vec3f) -> f32    how much of a ray from \`p\`
 *                                               along \`dir\` its things let by
 *   fn sunBounce(p: vec3f, normal: vec3f) -> vec3f   the light the beam's
 *                                               landing places throw on \`p\`
 */
const DOORWAY_SUN = wgsl(
  'doorway-sun',
  /* wgsl */ `
/// The doorway in the shell's east face: its north and south jambs, metres
/// south of the face's north end, and its head over the floor; then the
/// wall's inner and outer faces, metres east.
const DOOR = vec3f(${f(DOORWAY.from)}, ${f(DOORWAY.to)}, ${f(DOORWAY.height)});
const DOOR_FACES = vec2f(${f(DOOR_INNER)}, ${f(ROOM_METRES)});

/// What the doorway shows of the evening outside, as light: sky by the sun,
/// sea and sand.
const SKY_IN = vec3f(3.4, 2.5, 1.8);

/// The most of a mirror the floor is let become, seen along itself.
const SILL_MIRROR = 0.12;

/// How much of the light on a leaf's back comes through it, and its colour.
const LEAF_THROUGH = vec3f(0.16, 0.3, 0.05);

/// How much light a metre of the room's air scatters, and how far forward.
const DUST = 0.007;
const DUST_FORWARD = 0.6;
const SHAFT_STEPS = 12;

/// How far inside the doorway a ray from \`p\` along \`dir\` crosses the plane
/// \`x\` metres east, negative outside it, and how far along the ray that is.
fn doorMargin(p: vec3f, dir: vec3f, x: f32) -> vec2f {
  let far = (x - p.x) / dir.x;
  let hit = p + dir * far;
  return vec2f(min(min(hit.z - DOOR.x, DOOR.y - hit.z), DOOR.z - hit.y), far);
}

/// The share of a beam from \`p\` along \`dir\` that leaves by the doorway,
/// \`spread\` the tangent of half its width: both faces of the wall bound it.
fn throughDoor(p: vec3f, dir: vec3f, spread: f32) -> f32 {
  if (dir.x < 1e-4) {
    return 0.0;
  }
  let outer = doorMargin(p, dir, DOOR_FACES.y);
  // A point in the wall's thickness has only the outer face ahead of it.
  let inner = select(doorMargin(p, dir, DOOR_FACES.x).x, outer.x, p.x > DOOR_FACES.x);
  let soft = max(spread * outer.y, 0.003);
  return smoothstep(-soft, soft, min(inner, outer.x));
}
${SHRUB_RADIUS}

/// How much of a ray from \`p\` along \`dir\` a potted plant lets by, 1 for
/// all of it: \`shrub\` is its axis, metres east and south, and its draw of
/// height. The ray is taken where it passes the axis, so the shadow is the
/// plant's outline from the sun's side, ragged and holed where it is leaves.
fn shrubShade(p: vec3f, dir: vec3f, shrub: vec3f) -> f32 {
  let run = length(dir.xz);
  let flat = dir.xz / run;
  let to = shrub.xy - p.xz;
  let ahead = dot(to, flat);
  let aside = to.x * flat.y - to.y * flat.x;
  let y = p.y + ahead * dir.y / run;
  let radius = shrubRadius(y, shrub.z);
  if (radius <= 0.0 || ahead < -radius) {
    return 1.0;
  }
  let soft = max(SUN_SPREAD * ahead / run, 0.004);
  let leafy = step(${f(SHRUB.foliage[0].at[0])} + ${f(SHRUB.foliage[0].at[1])} * shrub.z, y);
  let at = vec2f(aside, y);
  // Six flat sides come a little inside the radius their corners stand on.
  let edge = radius * 0.93 * (1.0 - 0.32 * leafy * valueNoise(at * 15.0, ${salt(SALTS.outline)}));
  let cover = smoothstep(-soft, soft, edge - abs(aside))
    * smoothstep(-radius, radius, ahead);
  // Gaps between leaves, wider toward the outline, which a sun with width
  // blurs into an even thinning the farther the shadow falls.
  let thin = smoothstep(0.1, 0.95, abs(aside) / edge);
  let gaps = smoothstep(0.52, 0.74, valueNoise(at * 11.0, ${salt(SALTS.gaps)}));
  let sharp = 1.0 / (1.0 + soft * soft * 900.0);
  let open = leafy * thin * 0.9 * mix(0.3, gaps, sharp);
  return 1.0 - cover * (1.0 - open);
}

/// How much of the sun reaches \`p\`: through the doorway, past what stands
/// in the beam.
fn sunAt(p: vec3f) -> f32 {
  return throughDoor(p, SUN_DIR, SUN_SPREAD) * sunShade(p, SUN_DIR);
}

/// How much of a small patch's light reaches \`p\`, per square metre of the
/// patch: the patch at \`at\` facing \`facing\`, the point facing \`normal\`,
/// a little of it reaching round to faces turned just away.
fn patchLight(p: vec3f, normal: vec3f, at: vec3f, facing: vec3f) -> f32 {
  let to = at - p;
  let d2 = dot(to, to);
  let l = to * inverseSqrt(max(d2, 1e-6));
  let lands = max((dot(normal, l) + 0.25) / 1.25, 0.0);
  let leaves = max(-dot(facing, l), 0.0);
  return lands * leaves / (3.14159 * d2 + 0.6);
}

/// The doorway as a light: how much of what it shows falls on \`p\`.
fn doorLight(p: vec3f, normal: vec3f) -> f32 {
  let area = (DOOR.y - DOOR.x) * DOOR.z / 6.0;
  var sum = 0.0;
  for (var i = 0; i < 2; i++) {
    for (var j = 0; j < 3; j++) {
      let at = vec3f(
        DOOR_FACES.x,
        DOOR.z * (f32(j) + 0.5) / 3.0,
        mix(DOOR.x, DOOR.y, (f32(i) + 0.5) / 2.0),
      );
      sum += area * patchLight(p, normal, at, vec3f(-1.0, 0.0, 0.0));
    }
  }
  return sum;
}

/// The sun's light the dust between the eye and the point throws at the
/// eye: the beam as a shaft in the air, strongest looked into. It is added
/// to the point's light, so nothing is blended over anything.
fn sunShaft(s: Surf) -> vec3f {
  let view = turnedToShell(s.view);
  let eye = toShell(s.p) - view * s.far;
  var first = 0.0;
  if (eye.x > DOOR_FACES.x) {
    // An eye outside looks in through the doorway: the air begins at it.
    if (view.x >= 0.0) {
      return vec3f(0.0);
    }
    first = (DOOR_FACES.x - eye.x) / view.x;
  }
  let span = s.far - first;
  if (span <= 0.0) {
    return vec3f(0.0);
  }
  // Each pixel's steps start a different share of a step in, the same every
  // frame, so the shaft's banding becomes a still grain.
  let start = fract(52.9829189 * fract(dot(s.pixel, vec2f(0.06711056, 0.00583715))));
  var lit = 0.0;
  for (var i = 0; i < SHAFT_STEPS; i++) {
    lit += sunAt(eye + view * (first + span * (f32(i) + start) / f32(SHAFT_STEPS)));
  }
  let g = DUST_FORWARD;
  let forward = (1.0 - g * g) / pow(1.0 + g * g - 2.0 * g * dot(view, SUN_DIR), 1.5);
  return SUN_LIGHT * (DUST * 0.25 * forward * lit * span / f32(SHAFT_STEPS));
}

/// The point lit by the sun through the doorway and by nothing else that
/// shines: the beam where it falls, the doorway's sky and the beam's landing
/// places on the rest, \`ambient\` under it all, and the sun's highlight on
/// anything polished. A polished floor is left a mirror showing the doorway.
fn sunlitRoom(s: Surf, m: Material, ambient: vec3f) -> vec3f {
  let at = toShell(s.p);
  let view = turnedToShell(s.view);
  let normal = turnedToShell(normalize(s.normal + m.relief));
  let door = throughDoor(at, SUN_DIR, SUN_SPREAD);
  let sun = door * sunShade(at, SUN_DIR);
  let facing = max(dot(normal, SUN_DIR), 0.0);
  var direct = SUN_LIGHT * (facing * sun);
  if (s.kind == FOLIAGE) {
    direct += SUN_LIGHT * LEAF_THROUGH * (mix(sun, door, 0.5) * (1.0 - facing));
  }
  let fill = ambient + SKY_IN * doorLight(at, normal) + sunBounce(at, normal);
  let shade = cornerShade(s);
  // A polished thing mirrors more the more it is looked along.
  let along = pow(1.0 - max(dot(normal, -view), 0.0), 5.0);
  let floored = m.gloss > 0.0 && s.normal.y > 0.9 && s.kind != PLASTIC;
  // The doorway and the sun in it are so much brighter than the room that a
  // floor let go all the way to a mirror would show nothing of itself.
  let mirror = min(m.gloss * (0.04 + 0.96 * along), select(1.0, SILL_MIRROR, floored));
  let power = mix(6.0, 600.0, m.gloss * m.gloss);
  let half = normalize(SUN_DIR - view);
  let glint = pow(max(dot(normal, half), 0.0), power) * (power + 8.0) / 25.0;
  var colour = m.albedo * (fill * shade + direct) + m.emission
    + SUN_LIGHT * (facing * sun * glint * mirror);
  if (s.kind == PLASTIC) {
    // Plastic's highlight here is the doorway's sky, mirrored blurred.
    colour += SKY_IN * throughDoor(at, reflect(view, normal), SKIN_BLUR)
      * ((0.04 + 0.96 * along) * shade);
  }
  if (floored) {
    let plane = normalize(s.normal + RIPPLE * m.relief);
    let blur = BLUR * (1.0 - m.gloss);
    // Where the frame cannot follow the reflection out of the doorway, the
    // floor shows the sky it opens on.
    let fallback = SKY_IN * throughDoor(at, turnedToShell(reflect(s.view, plane)), blur);
    mirroring = Mirror(mirror, plane, blur, fallback);
  }
  return colour;
}
`,
  CORE,
  HASH,
  LIGHT,
  SUN,
  SUN_DISC,
  SHELL_TURN,
);

/** A potted plant standing in the beam: its axis in metres east and south in its room, and its draw of height. */
export type Shrub = {
  at: readonly [east: number, south: number];
  draw: number;
};

/** A room lit by the sun through floor 1's doorway, as numbers. */
type Sunlit = Graded & {
  /** The potted plants that shade the beam. */
  shrubs: readonly Shrub[];
  /** What the floor and the walls throw back of the beam, on average. */
  floor: Rgb;
  walls: Rgb;
};

/**
 * The light and the lens of floor 1's room with its lamps off and the low
 * sun in its doorway: `themeLight` and `themeLens`, leaving its theme
 * `themeMaterial` to write.
 */
export const sunlit = (id: string, look: Sunlit): Wgsl => {
  const patches = beamPatches(SUN_DIR);
  const bounces = patches.map(({ middle, facing, flux }) => {
    const thrown = facing[1] > 0.5 ? look.floor : look.walls;
    const light: Rgb = [
      thrown[0] * flux * SUN_LIGHT[0],
      thrown[1] * flux * SUN_LIGHT[1],
      thrown[2] * flux * SUN_LIGHT[2],
    ];
    return `Bounce(${vec3f(middle)}, ${vec3f(facing)}, ${vec3f(light)})`;
  });
  const shrubs = look.shrubs.map(({ at: [east, south], draw }) => {
    const [x, , z] = toShell([east, 0, south], ROOM_METRES);
    return `vec3f(${f(x)}, ${f(z)}, ${f(draw)})`;
  });
  return wgsl(
    `${id}/sunlit`,
    /* wgsl */ `
const SHRUBS = array<vec3f, ${String(shrubs.length)}>(${shrubs.join(', ')});

fn sunShade(p: vec3f, dir: vec3f) -> f32 {
  var shade = 1.0;
  for (var i = 0; i < ${String(shrubs.length)}; i++) {
    shade *= shrubShade(p, dir, SHRUBS[i]);
  }
  return shade;
}

/// A place the beam lands: where, the way it faces, and the light it
/// throws back times its size.
struct Bounce {
  at: vec3f,
  facing: vec3f,
  light: vec3f,
};

const BOUNCES = array<Bounce, ${String(bounces.length)}>(
  ${bounces.join(',\n  ')},
);

fn sunBounce(p: vec3f, normal: vec3f) -> vec3f {
  var sum = vec3f(0.0);
  for (var i = 0; i < ${String(bounces.length)}; i++) {
    let bounce = BOUNCES[i];
    sum += bounce.light * patchLight(p, normal, bounce.at, bounce.facing);
  }
  return sum;
}

fn themeLight(s: Surf, m: Material) -> vec3f {
  return ${hazed(`sunlitRoom(s, m, ${vec3f(look.ambient)})`, look)} + sunShaft(s);
}
${lensListing(look)}
`,
    DOORWAY_SUN,
    GRADE,
  );
};
