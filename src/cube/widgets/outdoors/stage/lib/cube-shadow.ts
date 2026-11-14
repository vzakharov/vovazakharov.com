import { SUN_DIR } from '@/cube/shared/cube-boundary';
import { smoothstep } from '@/cube/shared/lib/ease';
import { SUN_SPREAD } from '@/cube/shared/lib/sun-disc';
import { dot3, moved, scaled, type Vec3 } from '@/cube/shared/lib/vec';
import {
  CUBE_BOX,
  DOOR_LADDER,
  LADDER_ACROSS,
  LADDER_OUT,
  LADDER_UP,
} from '@/cube/entities/island';

import {
  CUBE_CENTRE,
  CUBE_OUTLINE,
  SHADOW_BEHIND,
  SHADOW_CRISP,
} from './cube-shadow-numbers';

/** Where the sun's ray from `p` enters and leaves the cube, in metres along it. */
function through(p: Vec3): [enters: number, leaves: number] {
  let enters = -Infinity;
  let leaves = Infinity;
  for (const axis of [0, 1, 2] as const) {
    const a = (CUBE_BOX.min[axis] - p[axis]) / SUN_DIR[axis];
    const b = (CUBE_BOX.max[axis] - p[axis]) / SUN_DIR[axis];
    enters = Math.max(enters, Math.min(a, b));
    leaves = Math.min(leaves, Math.max(a, b));
  }
  return [enters, leaves];
}

/** How much of the sun the cube leaves `p`. */
function boxLight(p: Vec3): number {
  const off = moved(p, CUBE_CENTRE, -1);
  let out = -Infinity;
  let back: Vec3 = [0, 0, 0];
  for (const { facing, reach } of CUBE_OUTLINE) {
    const across = dot3(facing, off);
    if (Math.abs(across) - reach > out) {
      out = Math.abs(across) - reach;
      back = scaled(facing, -Math.sign(across));
    }
  }
  // A point beside the outline is judged by the ray of the outline's edge.
  const [enters, leaves] = through(moved(p, back, Math.max(out, 0) + 0.001));
  const hit = leaves > Math.max(enters, 0);
  const ahead = -dot3(off, SUN_DIR);
  const run = hit ? Math.max(enters, 0) : Math.max(ahead, 0);
  const behind = hit
    ? smoothstep(0, SHADOW_BEHIND, leaves)
    : out > 0 && ahead > 0
      ? 1
      : 0;
  const soft = SUN_SPREAD * run + SHADOW_CRISP;
  return 1 - (1 - smoothstep(-soft, soft, out)) * behind;
}

/** How much of the sun a bar `half` wide leaves a point `off` from its middle, its edge `soft` wide. */
const barLight = (off: number, half: number, soft: number): number =>
  (1 - smoothstep(half - soft, half + soft, off)) * Math.min(1, half / soft);

/** How much of the sun the ladder leaves `p`. */
function ladderLight(p: Vec3): number {
  const run =
    dot3(moved(DOOR_LADDER.foot, p, -1), LADDER_OUT) /
    dot3(SUN_DIR, LADDER_OUT);
  const at = moved(moved(p, SUN_DIR, run), DOOR_LADDER.foot, -1);
  const up = dot3(at, LADDER_UP);
  const across = Math.abs(dot3(at, LADDER_ACROSS));
  const soft = SUN_SPREAD * Math.max(run, 0) + SHADOW_CRISP;
  const stiles =
    barLight(
      Math.abs(across - DOOR_LADDER.wide / 2),
      DOOR_LADDER.stile.across / 2,
      soft,
    ) *
    barLight(
      Math.abs(up - DOOR_LADDER.length / 2),
      DOOR_LADDER.length / 2,
      soft,
    );
  const step =
    Math.min(Math.max(up, DOOR_LADDER.lowest), DOOR_LADDER.highest) -
    DOOR_LADDER.lowest;
  const rung =
    DOOR_LADDER.lowest +
    Math.round(step / DOOR_LADDER.pitch) * DOOR_LADDER.pitch;
  const rungs =
    barLight(Math.abs(up - rung), DOOR_LADDER.rung.tall / 2, soft) *
    barLight(across, DOOR_LADDER.wide / 2, soft);
  return (
    1 -
    Math.max(stiles, rungs) * smoothstep(SHADOW_BEHIND, 3 * SHADOW_BEHIND, run)
  );
}

/**
 * How much of the sun reaches `p` in the world frame: 1 in the sun, 0 in the
 * shadow of the cube and its ladder, the edge as wide as the sun's disc makes
 * it at the distance the shadow has run. A point on the cube's own sunlit
 * faces is in the sun; one on the ladder is not in the ladder's shadow. With
 * `ladderGone` the cube casts alone.
 */
export const cubeShadow = (p: Vec3, { ladderGone = false } = {}): number =>
  boxLight(p) * (ladderGone ? 1 : ladderLight(p));
