import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  cross,
  dot,
  R,
  scaled,
  sum,
  unit,
  type Vec3,
} from '@/island/shared/globe';

import { GROUP_PERIOD, RIPPLE_PERIOD } from './ripple-table';
import { groupsAt, ripplesAt } from './ripples';
import { intoPeriod } from './sea-wgsl';

/** `a` stepped `times` along `b`. */
const along = (a: Vec3, b: Vec3, times: number): Vec3 =>
  sum(a, scaled(b, times));
const folded = (v: Vec3, period: number): Vec3 => [
  intoPeriod(v[0], period),
  intoPeriod(v[1], period),
  intoPeriod(v[2], period),
];

/** A patch of open sea, the low sun ahead and the eye behind, the wind blowing toward the eye. */
const UP = unit([0.42, 0.31, 0.85]);
const EAST = unit(cross([0, 1, 0], UP));
const AHEAD = unit(along(EAST, cross(UP, EAST), 0.3));
const ASIDE = unit(cross(AHEAD, UP));
const SUN = unit(along(scaled(AHEAD, Math.cos(0.11)), UP, Math.sin(0.11)));
const TO_EYE = unit(along(scaled(AHEAD, -Math.cos(0.2)), UP, Math.sin(0.2)));
const WIND = along(scaled(AHEAD, -7 * Math.cos(0.6)), ASIDE, 7 * Math.sin(0.6));
const GRAIN: Vec3 = [11, 42, 73];

/** The sun's glint off a rippled sea, as `seaColour` takes it, unscaled. */
function glint(slope: Vec3, hidden: number): number {
  const normal = unit(along(UP, slope, -1));
  const half = unit(sum(TO_EYE, SUN));
  const tilt = Math.max(dot(normal, half), 1e-3);
  const spread = 2 * hidden + 0.0008;
  return Math.min(
    Math.exp((tilt * tilt - 1) / (tilt * tilt * spread)) /
      (Math.PI * spread * tilt ** 4),
    400,
  );
}

/** `size`² samples of the glint `step` metres apart, from the patch's corner `origin`. */
function glintMap(
  size: number,
  step: number,
  origin: number,
  grouped: boolean,
): Float64Array {
  const map = new Float64Array(size * size);
  const corner = along(
    along(scaled(UP, R), AHEAD, origin),
    ASIDE,
    origin * 0.6,
  );
  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      const at = along(along(corner, AHEAD, column * step), ASIDE, row * step);
      const groups = grouped
        ? groupsAt(folded(at, GROUP_PERIOD), GRAIN)
        : ([0, 0] as const);
      const { slope, hidden } = ripplesAt(
        folded(at, RIPPLE_PERIOD),
        groups,
        UP,
        WIND,
        step,
        0,
      );
      map[row * size + column] = Math.log1p(glint(slope, hidden));
    }
  }
  return map;
}

/** An in-place radix-2 FFT of `length` complex values `stride` apart from `start`. */
function fft(
  re: Float64Array,
  im: Float64Array,
  start: number,
  stride: number,
  length: number,
  inverse: boolean,
): void {
  const at = (k: number) => start + k * stride;
  for (let i = 1, j = 0; i < length; i++) {
    let bit = length >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[at(i)], re[at(j)]] = [re[at(j)] ?? 0, re[at(i)] ?? 0];
      [im[at(i)], im[at(j)]] = [im[at(j)] ?? 0, im[at(i)] ?? 0];
    }
  }
  for (let span = 2; span <= length; span <<= 1) {
    const turn = ((inverse ? 2 : -2) * Math.PI) / span;
    for (let base = 0; base < length; base += span) {
      for (let k = 0; k < span / 2; k++) {
        const [c, s] = [Math.cos(turn * k), Math.sin(turn * k)];
        const [a, b] = [at(base + k), at(base + k + span / 2)];
        const [bre, bim] = [re[b] ?? 0, im[b] ?? 0];
        const [tre, tim] = [bre * c - bim * s, bre * s + bim * c];
        const [are, aim] = [re[a] ?? 0, im[a] ?? 0];
        re[b] = are - tre;
        im[b] = aim - tim;
        re[a] = are + tre;
        im[a] = aim + tim;
      }
    }
  }
}

function fft2(
  re: Float64Array,
  im: Float64Array,
  side: number,
  inverse: boolean,
) {
  for (let row = 0; row < side; row++)
    fft(re, im, row * side, 1, side, inverse);
  for (let column = 0; column < side; column++)
    fft(re, im, column, side, side, inverse);
}

/**
 * How regular a map is: the highest autocorrelation, as a share of the
 * centre's, past the central lobe. A lattice of glints repeats, and scores
 * near its contrast; a sea's glitter does not.
 */
function regularity(map: Float64Array, size: number): number {
  const side = 2 * size;
  const re = new Float64Array(side * side);
  const im = new Float64Array(side * side);
  const mean = map.reduce((total, v) => total + v, 0) / map.length;
  const hann = (k: number) =>
    0.5 - 0.5 * Math.cos((2 * Math.PI * k) / (size - 1));
  for (let row = 0; row < size; row++)
    for (let column = 0; column < size; column++)
      re[row * side + column] =
        ((map[row * size + column] ?? 0) - mean) * hann(row) * hann(column);
  fft2(re, im, side, false);
  for (let k = 0; k < re.length; k++) {
    re[k] = (re[k] ?? 0) ** 2 + (im[k] ?? 0) ** 2;
    im[k] = 0;
  }
  fft2(re, im, side, true);
  const centre = re[0] ?? 1;
  const at = (dx: number, dy: number) =>
    (re[((dy + side) % side) * side + ((dx + side) % side)] ?? 0) / centre;
  const reach = size / 2;
  const ring = (radius: number) => {
    let [total, count] = [0, 0];
    for (let dy = -reach; dy <= reach; dy++)
      for (let dx = -reach; dx <= reach; dx++)
        if (Math.floor(Math.hypot(dx, dy)) === radius) {
          total += at(dx, dy);
          count++;
        }
    return total / count;
  };
  let lobe = 1;
  while (lobe < reach && ring(lobe) >= 0.2) lobe++;
  const past = 2 * lobe + 2;
  let peak = 0;
  for (let dy = -reach; dy <= reach; dy++)
    for (let dx = -reach; dx <= reach; dx++) {
      const radius = Math.hypot(dx, dy);
      if (radius > past && radius < reach) peak = Math.max(peak, at(dx, dy));
    }
  return peak;
}

/** The worst regularity over a few patches, `step` metres a sample. */
const worst = (step: number, grouped: boolean) =>
  Math.max(
    ...[0, 3001, 6002].map((origin) =>
      regularity(glintMap(128, step, origin, grouped), 128),
    ),
  );

describe('ripplesAt', () => {
  it('beats into a lattice of glints with its phases left to the table alone', () => {
    assert.ok(worst(4, false) > 0.4);
  });

  it('draws no lattice of glints with each wave drifting in its groups', () => {
    for (const step of [1, 4]) {
      assert.ok(worst(step, true) < 0.3, `at ${String(step)} m a sample`);
    }
  });

  it('keeps every wave of a band, so the slopes it hides and shows are the same with groups as without', () => {
    const at: Vec3 = [1234.5, 77.25, 9.5];
    const plain = ripplesAt(at, [0, 0], UP, WIND, 0.3, 0);
    const grouped = ripplesAt(at, groupsAt(at, GRAIN), UP, WIND, 0.3, 0);
    assert.equal(grouped.hidden, plain.hidden);
  });

  it('hides the bands past `bands`, so the slopes it drops are counted in `hidden`', () => {
    const at: Vec3 = [1234.5, 77.25, 9.5];
    const all = ripplesAt(at, [0, 0], UP, WIND, 0.01, 0);
    const coarse = ripplesAt(at, [0, 0], UP, WIND, 0.01, 0, 4);
    const unseen = ripplesAt(at, [0, 0], UP, WIND, 1e6, 0);
    assert.ok(coarse.hidden > all.hidden);
    assert.ok(coarse.hidden < unseen.hidden);
  });
});

describe('groupsAt', () => {
  it('meets itself across the period, so the eye crossing it moves nothing', () => {
    const near: Vec3 = [GROUP_PERIOD - 0.25, 3000.5, 12.75];
    const across: Vec3 = [-0.25, 3000.5, 12.75];
    assert.deepEqual(groupsAt(near, GRAIN), groupsAt(across, GRAIN));
  });

  it('takes a world of its own from its grain', () => {
    const at: Vec3 = [100.5, 200.25, 300.75];
    assert.notDeepEqual(groupsAt(at, GRAIN), groupsAt(at, [12, 42, 73]));
  });
});
