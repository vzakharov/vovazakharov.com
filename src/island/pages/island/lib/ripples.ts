import { dot, length, type Vec3 } from '@/island/shared/globe';

import {
  GROUP_CELL,
  GROUP_PERIOD,
  RIPPLE_BANDS,
  RIPPLE_PERIOD,
  RIPPLE_SHARE,
  RIPPLES,
} from './ripple-table';

/**
 * The CPU twin of `seaGroups` and `ripplesAt` in `island-sea.wgsl`, in float64,
 * for measuring what the shader draws: a change to either side is made to
 * both.
 */

const TAU = 2 * Math.PI;
const GROUP_CELLS = GROUP_PERIOD / GROUP_CELL;

type Axis = 0 | 1 | 2;
const each = (f: (axis: Axis) => number): Vec3 => [f(0), f(1), f(2)];
const fract = (value: number) => value - Math.floor(value);
const smoothstep = (low: number, high: number, value: number) => {
  const t = Math.min(Math.max((value - low) / (high - low), 0), 1);
  return t * t * (3 - 2 * t);
};

/** `seaGroupCell`. */
function groupCell(cell: Vec3, grain: Vec3): [number, number] {
  const [x, y, z] = each((axis) => fract((cell[axis] + grain[axis]) * 0.1031));
  const sum = x * (z + 31.32) + y * (y + 31.32) + z * (x + 31.32);
  const [fx, fy, fz] = [x + sum, y + sum, z + sum];
  return [fract((fx + fy) * fz), fract((fx + fz) * fy)];
}

/** `seaGroups`: the two slow fields at `field`, a place taken modulo `GROUP_PERIOD`. */
export function groupsAt(field: Vec3, grain: Vec3): [number, number] {
  const at = each((axis) => field[axis] / GROUP_CELL);
  const low = each((axis) => {
    const base = Math.floor(at[axis]);
    return base - GROUP_CELLS * Math.floor(base / GROUP_CELLS);
  });
  const high = each((axis) =>
    low[axis] + 1 >= GROUP_CELLS ? 0 : low[axis] + 1,
  );
  const eased = each((axis) => {
    const within = fract(at[axis]);
    return within * within * (3 - 2 * within);
  });
  const groups: [number, number] = [0, 0];
  for (let corner = 0; corner < 8; corner++) {
    const takes = (axis: Axis) => ((corner >> axis) & 1) === 1;
    const cell = each((axis) => (takes(axis) ? high[axis] : low[axis]));
    const weight =
      (takes(0) ? eased[0] : 1 - eased[0]) *
      (takes(1) ? eased[1] : 1 - eased[1]) *
      (takes(2) ? eased[2] : 1 - eased[2]);
    const [a, b] = groupCell(cell, grain);
    groups[0] += weight * a;
    groups[1] += weight * b;
  }
  return groups;
}

/** The ripples' slope along the sea, and the mean square slope of the waves a pixel hides. */
export type Rippled = { readonly slope: Vec3; readonly hidden: number };

/** `ripplesAt`: `place` is taken modulo `RIPPLE_PERIOD`, `groups` read off `groupsAt`. */
export function ripplesAt(
  place: Vec3,
  groups: readonly [number, number],
  up: Vec3,
  wind: Vec3,
  footprint: number,
  seconds: number,
  bands: number = RIPPLE_BANDS,
): Rippled {
  const speed = length(wind);
  const heading = each((axis) => wind[axis] / Math.max(speed, 1e-3));
  const variance = 0.003 + 0.005_12 * speed;
  const longest = 0.9 * speed * speed;
  let slope: Vec3 = [0, 0, 0];
  let hidden = 0;
  for (const { vector, band, pace, phase: start, drift } of RIPPLES) {
    const scale = 2 ** band / RIPPLE_PERIOD;
    const turned = each((axis) => fract(place[axis] * scale));
    const number = each((axis) => TAU * scale * vector[axis]);
    const rise = dot(number, up);
    const flat = each((axis) => number[axis] - up[axis] * rise);
    const along = length(flat);
    const toward = each((axis) => flat[axis] / Math.max(along, 1e-6));
    const lying = along / length(number);
    const downwind = Math.max(dot(toward, heading), 0);
    const metres = TAU / Math.max(along, 1e-6);
    const share =
      RIPPLE_SHARE *
      variance *
      lying *
      lying *
      (0.12 + 0.88 * downwind * downwind) *
      (1 - smoothstep(0.6 * longest, 1.2 * longest, metres));
    const seen = band < bands ? smoothstep(2, 6, metres / footprint) : 0;
    const phase =
      TAU *
        (dot(vector, turned) + groups[0] * drift[0] + groups[1] * drift[1]) -
      pace * seconds +
      start;
    const swing = Math.sqrt(2 * share) * seen * Math.cos(phase);
    const before = slope;
    slope = each((axis) => before[axis] + toward[axis] * swing);
    hidden += share * (1 - seen * seen);
  }
  return { slope, hidden };
}
