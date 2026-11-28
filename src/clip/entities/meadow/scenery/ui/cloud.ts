import {
  at,
  ellipse,
  type Figure,
  ink,
  noise,
  type Pen,
  type Point,
} from '@/clip/shared/ink';

import { MEADOW_PALETTE } from './palette-meadow';

/** A cloud: where it is, its own puffs by `seed`, and how fast it drifts. */
export type Cloud = Figure & {
  /** Stage units a second it drifts right; negative drifts left. 0 by default. */
  drift?: number;
};

// A cloud is 200 of its own units long, its flat underside at y = 0.
const PUFFS = 5;
// How deep the shade along each puff's underside.
const CLOUD_SHADE = 9;

/** The cloud's puffs: centre and radius, the middle ones biggest. */
function puffs(seed: number): ReadonlyArray<readonly [Point, number]> {
  return Array.from({ length: PUFFS }, (_, n) => {
    const across = n / (PUFFS - 1) - 0.5;
    const radius = (1 - Math.abs(across) * 0.9) * 48 + noise(seed, n) * 8;
    return [[across * 150 + noise(seed, n + 10) * 10, -radius * 0.55], radius];
  });
}

/**
 * A cotton-wool cloud with a flat underside, outlined once round all its
 * puffs and shaded beneath. Its place is the middle of its underside.
 */
export function cloud(pen: Pen, drawn: Cloud = {}): void {
  const { seed = 0, drift = 0, x = 0 } = drawn;
  const all = puffs(seed);
  const shapes = [
    ...all.map(([centre, radius]) => ellipse(centre, radius)),
    ellipse([0, -14], 104, 18),
  ];
  // Each puff's lit part: smaller and raised, its top edge on the puff's.
  const lit = all.map(([[cx, cy], radius]) =>
    ellipse([cx, cy - CLOUD_SHADE], radius - CLOUD_SHADE),
  );
  at(pen, { ...drawn, x: x + drift * pen.playhead }, () => {
    // The outline is every puff stroked, the fill laid over it after, so
    // only the outer edge of the whole shows.
    for (const shape of shapes) ink(pen, shape, { width: 8, seed });
    for (const shape of shapes) {
      ink(pen, shape, { fill: MEADOW_PALETTE.cloudShade, stroke: null, seed });
    }
    for (const shape of lit) {
      ink(pen, shape, { fill: MEADOW_PALETTE.cloud, stroke: null, seed });
    }
  });
}
