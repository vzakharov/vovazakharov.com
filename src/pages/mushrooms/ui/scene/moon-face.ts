import { type Circle, type Point, sample } from '../../model/geometry';

/** The moon's face, as `moonFace` lays it on the disc: every piece inside it. */
export type MoonFace = {
  /** The dim seas round the face, as a child finds on the real moon: each a rim and, inside it, its deeper core. */
  seas: Point[][];
  /** Two closed, sleepy eyes and a smile: each a crescent bowed downward. */
  features: Point[][];
  /** Two round cheeks, a touch warmer than the face. */
  cheeks: Circle[];
};

const STEPS = 16;

/**
 * Each sea: its middle and size in the moon's radii, then how much its rim
 * wobbles and where the wobble starts, so no two read as the same oval.
 */
const SEAS = [
  [{ x: -0.4, y: -0.52 }, 0.2, 0.12, 0.4],
  [{ x: 0.24, y: -0.62 }, 0.13, 0.14, 2.1],
  [{ x: 0.56, y: 0.44 }, 0.12, 0.14, 1.3],
  [{ x: -0.58, y: 0.5 }, 0.09, 0.16, 4],
  [{ x: 0.7, y: -0.18 }, 0.06, 0.2, 0.9],
  [{ x: -0.12, y: 0.72 }, 0.07, 0.18, 3.1],
] as const;
/** A sea's core: its size as a share of the sea's, and how far off its middle, up and to the left, in the sea's sizes. */
const CORE = { size: 0.55, off: 0.18 } as const;
/**
 * The right eye and the smile, each its middle off the moon's, its half
 * width, and how deep its outer and inner rims bow, in radii; the left eye
 * mirrors the right.
 */
const EYE = [{ x: 0.32, y: -0.1 }, 0.17, [0.12, 0.04]] as const;
const SMILE = [{ x: 0, y: 0.28 }, 0.25, [0.16, 0.06]] as const;
/** The right cheek, the left mirroring it. */
const CHEEK = { x: 0.5, y: 0.14, r: 0.12 } as const;

const mirrored = ({ x, y }: Point): Point => ({ x: -x, y });

/**
 * A crescent bowed downward round `centre`, `rx` either side: the outer rim an
 * ellipse's lower half `outer` deep, back along one `inner` deep, so it ends
 * in two points level with `centre`.
 */
function bowed(
  centre: Point,
  rx: number,
  [outer, inner]: readonly [number, number],
): Point[] {
  const rim = (ry: number) => (angle: number) => ({
    x: centre.x + rx * Math.cos(angle),
    y: centre.y + ry * Math.sin(angle),
  });
  return [
    ...sample(0, Math.PI, STEPS, rim(outer)),
    ...sample(Math.PI, 0, STEPS, rim(inner)).slice(1, -1),
  ];
}

/** A round blob of `size` round `centre`, its rim swelling and pinching by `wobble` twice round from `phase`. */
function blob(
  centre: Point,
  size: number,
  wobble: number,
  phase: number,
): Point[] {
  return sample(0, Math.PI * 2, STEPS * 2, (angle) => {
    const reach = size * (1 + wobble * Math.sin(2 * angle + phase));
    return {
      x: centre.x + Math.cos(angle) * reach,
      y: centre.y + Math.sin(angle) * reach,
    };
  }).slice(0, -1);
}

/**
 * The moon's face on `moon`: soft seas, a sleeping smile and round cheeks, the
 * kind face the seas make on the real moon, drawn as patches rather than
 * lines so it stays the moon's own markings.
 */
export function moonFace({ x, y, r }: Circle): MoonFace {
  const at = (point: Point): Point => ({
    x: x + point.x * r,
    y: y + point.y * r,
  });
  const seas = SEAS.flatMap(([middle, size, wobble, phase]) => {
    const centre = at(middle);
    const off = CORE.off * size * r;
    return [
      blob(centre, size * r, wobble, phase),
      blob(
        { x: centre.x - off, y: centre.y - off },
        CORE.size * size * r,
        wobble,
        phase,
      ),
    ];
  });
  const [eye, eyeWidth, eyeBow] = EYE;
  const features = (
    [[mirrored(eye), eyeWidth, eyeBow], EYE, SMILE] as const
  ).map(([middle, width, [outer, inner]]) =>
    bowed(at(middle), width * r, [outer * r, inner * r]),
  );
  const cheeks = [mirrored(CHEEK), CHEEK].map((cheek) => ({
    ...at(cheek),
    r: CHEEK.r * r,
  }));
  return { seas, features, cheeks };
}
