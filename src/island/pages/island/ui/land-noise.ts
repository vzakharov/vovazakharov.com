import {
  dFdx,
  dFdy,
  dot,
  float,
  Fn,
  length,
  max,
  positionWorld,
  smoothstep,
  uniform,
  vec3,
  vec4,
} from 'three/tsl';
import { type Node, Vector3 } from 'three/webgpu';

import type { Vec3 } from '@/island/shared/globe';

import {
  anchorOf,
  LAND_OCTAVES,
  type LandOctave,
  LATTICE_WRAP,
} from '../lib/land-octaves';
import { latticeValue } from './lattice-value';

type F = Node<'float'>;
type V = Node<'vec3'>;

/** One octave of the land's noise at a fragment, as an eye that far tells it. */
export type OctaveNoise = {
  /** The noise, -1 to 1, gone to 0 — its mean — as its wave nears a pixel's width. */
  readonly value: F;
  /** The noise's slope in world axes over one cell's width, faded as `value` is. */
  readonly slope: V;
  /** How much of the wave the eye tells apart, 1 near and 0 past a pixel. */
  readonly told: F;
  /**
   * The noise for drawing an edge through: gone to its mean while its wave is
   * still several pixels wide, since a threshold turns a wave nearer a pixel
   * into speckle.
   */
  readonly edging: F;
  /** How much of the wave `edging` keeps, 1 near and 0 at a few pixels. */
  readonly edged: F;
};

/** What is seen at a fragment from where the eye is. */
export type Seen = {
  /** The width of ground a pixel covers at the fragment, metres, the longer way. */
  readonly footprint: F;
};

/** What follows the eye about the planet. */
export type Following = {
  /** Per frame, in either look: the eye, metres from the planet's centre. */
  readonly update: (eye: Vec3) => void;
};

export type LandNoise = Seen &
  Following & {
    /** `LAND_OCTAVES` at the fragment, coarsest first. */
    readonly octaves: readonly OctaveNoise[];
  };

/** An octave an eye tells nothing of: what a look that leaves one out reads in its place. */
export const QUIET: OctaveNoise = {
  value: float(0),
  slope: vec3(0),
  told: float(0),
  edging: float(0),
  edged: float(0),
};

/**
 * An octave that is not there: what a look reads in place of one it leaves out
 * near the eye, where averaging it as `QUIET` does would blur every edge drawn
 * through its coarser neighbours.
 */
export const ABSENT: OctaveNoise = {
  ...QUIET,
  told: float(1),
  edged: float(1),
};

/**
 * How far an octave's lattice is pushed about by the next coarser one's slope,
 * cells: enough that no cell's square outline shows through a border drawn
 * along the noise.
 */
const WARP = 0.22;

const wrapped = (cells: V): V =>
  cells.sub(cells.div(LATTICE_WRAP).floor().mul(LATTICE_WRAP));

/**
 * Value noise over `at`, a cell a unit: its slope in `xyz` and the noise, -1
 * to 1, in `w`. Cells repeat after `LATTICE_WRAP`, far past where a wave of
 * them is still told apart.
 */
const latticeNoise = Fn(([at]: [V]) => {
  const cell = at.floor().toVar();
  const within = at.sub(cell).toVar();
  const eased = within.mul(within).mul(within.mul(-2).add(3)).toVar();
  const easing = within.mul(within.oneMinus()).mul(6).toVar();
  const low = wrapped(cell).toVar();
  const high = wrapped(cell.add(1)).toVar();
  const corner = (x: 0 | 1, y: 0 | 1, z: 0 | 1) =>
    latticeValue(
      vec3(
        x === 1 ? high.x : low.x,
        y === 1 ? high.y : low.y,
        z === 1 ? high.z : low.z,
      ),
    ).toVar();
  const a = corner(0, 0, 0);
  const b = corner(1, 0, 0);
  const c = corner(0, 1, 0);
  const d = corner(1, 1, 0);
  const e = corner(0, 0, 1);
  const f = corner(1, 0, 1);
  const g = corner(0, 1, 1);
  const h = corner(1, 1, 1);
  const kx = b.sub(a).toVar();
  const ky = c.sub(a).toVar();
  const kz = e.sub(a).toVar();
  const kxy = a.sub(b).sub(c).add(d).toVar();
  const kyz = a.sub(c).sub(e).add(g).toVar();
  const kzx = a.sub(b).sub(e).add(f).toVar();
  const kxyz = b.add(c).add(e).add(h).sub(a).sub(d).sub(f).sub(g).toVar();
  const { x, y, z } = eased;
  const value = a
    .add(kx.mul(x))
    .add(ky.mul(y))
    .add(kz.mul(z))
    .add(kxy.mul(x).mul(y))
    .add(kyz.mul(y).mul(z))
    .add(kzx.mul(z).mul(x))
    .add(kxyz.mul(x).mul(y).mul(z));
  const slope = vec3(
    kx.add(kxy.mul(y)).add(kzx.mul(z)).add(kxyz.mul(y).mul(z)),
    ky.add(kyz.mul(z)).add(kxy.mul(x)).add(kxyz.mul(z).mul(x)),
    kz.add(kzx.mul(x)).add(kyz.mul(y)).add(kxyz.mul(x).mul(y)),
  ).mul(easing);
  return vec4(slope.mul(2), value.mul(2).sub(1));
});

/** `latticeNoise` over `at`: slope in `xyz`, the noise in `w`. */
export const noiseAt = (at: V) => latticeNoise(at);

/**
 * The land's noise as nodes: each of `LAND_OCTAVES` read at the fragment's own
 * place on the planet, so no pattern of them comes round again, and each faded
 * out before its wave is as narrow as a pixel, so far ground neither shimmers
 * nor draws a moiré. The camera sits at the world's origin, so a fragment's
 * world position is its offset from the eye.
 */
export function landNoise(): LandNoise {
  const footprint = max(
    length(dFdx(positionWorld)),
    length(dFdy(positionWorld)),
  );
  const anchors = LAND_OCTAVES.map(() => uniform(new Vector3()));
  let coarser: V = vec3(0);
  const octave = ({ cell, rows }: LandOctave, anchor: V): OctaveNoise => {
    const [a, b, c] = rows.map((row) => vec3(...row));
    if (a === undefined || b === undefined || c === undefined)
      throw new RangeError('a turn has three rows');
    const turned = vec3(
      dot(a, positionWorld),
      dot(b, positionWorld),
      dot(c, positionWorld),
    );
    const sample = latticeNoise(
      anchor.add(turned.div(cell)).add(coarser.mul(WARP)),
    );
    coarser = sample.xyz;
    const told = smoothstep(cell / 8, cell / 2.5, footprint).oneMinus();
    const edged = smoothstep(cell / 24, cell / 7, footprint).oneMinus();
    return {
      value: sample.w.mul(told),
      edging: sample.w.mul(edged),
      edged,
      slope: a
        .mul(sample.x)
        .add(b.mul(sample.y))
        .add(c.mul(sample.z))
        .mul(told),
      told,
    };
  };
  return {
    octaves: LAND_OCTAVES.map((each, i) => {
      const anchor = anchors[i];
      if (anchor === undefined) throw new RangeError(`no anchor ${String(i)}`);
      return octave(each, anchor);
    }),
    footprint,
    update: (eye) => {
      for (const [i, anchor] of anchors.entries()) {
        const each = LAND_OCTAVES[i];
        if (each !== undefined) anchor.value.set(...anchorOf(eye, each));
      }
    },
  };
}
