import {
  type Build,
  LEAF,
  mass,
  type P3,
  shaded,
  type TreeDetail,
  vertex,
} from './tree-mesh-parts';

/** A bush's masses, the largest first: centre, radii. A far one is the first alone. */
const BUSH: ReadonlyArray<readonly [P3, P3]> = [
  [
    [0, 0.42, 0],
    [0.5, 0.5, 0.48],
  ],
  [
    [0.3, 0.3, 0.12],
    [0.34, 0.3, 0.3],
  ],
  [
    [-0.26, 0.34, -0.2],
    [0.3, 0.34, 0.32],
  ],
];

const BUSH_HEART: P3 = [0, 0.2, 0];

/** A shrub one unit tall: leaf masses down to the ground, no stem to see. */
export function bush(build: Build, detail: TreeDetail) {
  const near = detail === 'near';
  for (const [n, [centre, radii]] of BUSH.slice(0, near ? 3 : 1).entries()) {
    mass(
      build,
      LEAF.bush,
      centre,
      radii,
      BUSH_HEART,
      near ? 7 : 5,
      near ? 4 : 3,
      0.7 + n * 1.9,
    );
  }
}

/** Blades in a tuft, by detail. */
const BLADES: Readonly<Record<TreeDetail, number>> = {
  near: 11,
  mid: 6,
  far: 6,
  least: 6,
};

/**
 * A tuft of dune grass one unit tall: blades fanning out of one foot, each a
 * tapering strip bowed outward, paler toward its tip.
 */
export function tuft(build: Build, detail: TreeDetail) {
  const blades = BLADES[detail];
  for (let b = 0; b < blades; b++) {
    const a = (b / blades) * 2 * Math.PI + (b % 3) * 0.5;
    const out = 0.25 + (0.5 * ((b * 7) % 5)) / 4;
    const tall = 0.62 + (0.38 * ((b * 3) % 4)) / 3;
    const [ox, oz] = [Math.cos(a), Math.sin(a)];
    const [sx, sz] = [-oz * 0.035, ox * 0.035];
    const first = build.positions.length / 3;
    for (const [rise, width] of [
      [0, 1],
      [0.55, 0.7],
      [1, 0],
    ] as const) {
      const away = out * rise * rise;
      const colour = shaded(LEAF.tuft, 0.8 + 0.45 * rise);
      const normal: P3 = [ox * 0.25, 1, oz * 0.25];
      const at = (side: number): P3 => [
        ox * (0.03 + away) + sx * width * side,
        tall * rise - 0.03,
        oz * (0.03 + away) + sz * width * side,
      ];
      vertex(build, at(-1), normal, colour);
      vertex(build, at(1), normal, colour);
    }
    // Each face twice, wound both ways: the back of a blade is lit as its front is.
    for (const row of [0, 2]) {
      const low = first + row;
      build.indices.push(
        low,
        low + 1,
        low + 2,
        low + 2,
        low + 1,
        low + 3,
        low,
        low + 2,
        low + 1,
        low + 2,
        low + 3,
        low + 1,
      );
    }
  }
}
