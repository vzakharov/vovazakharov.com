/** A point on the stage: x right, y down. */
export type Point = readonly [number, number];

/**
 * One step of an outline: `M` and `L` carry their end point, `Q` a control
 * point then the end, `C` two controls then the end, `Z` nothing.
 */
export type Step = {
  kind: 'M' | 'L' | 'Q' | 'C' | 'Z';
  points: readonly Point[];
};

export type Path = readonly Step[];

const POINTS_PER_STEP = { M: 1, L: 1, Q: 2, C: 3, Z: 0 } as const;

const isKind = (letter: string): letter is Step['kind'] =>
  letter in POINTS_PER_STEP;

/**
 * SVG path data as a `Path`. It reads absolute `M`, `L`, `Q`, `C` and `Z`
 * only, with a command's letter repeated implicitly for further coordinate
 * groups, and throws on anything else — a drawing ported from an editor is
 * converted to absolute coordinates first.
 */
export function path(d: string): Path {
  const steps: Step[] = [];
  for (const [, letter = '', body = ''] of d.matchAll(
    /([A-Za-z])([^A-Za-z]*)/g,
  )) {
    if (!isKind(letter)) {
      throw new Error(`Path command ${letter} is not one of M L Q C Z: ${d}`);
    }
    const numbers = (body.match(/-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/g) ?? []).map(
      Number,
    );
    const perStep = POINTS_PER_STEP[letter] * 2;
    if (perStep === 0 ? numbers.length > 0 : numbers.length % perStep !== 0) {
      throw new Error(`Path command ${letter} has stray coordinates: ${d}`);
    }
    if (perStep === 0) {
      steps.push({ kind: letter, points: [] });
      continue;
    }
    for (let at = 0; at < numbers.length; at += perStep) {
      const points: Point[] = [];
      for (let n = at; n < at + perStep; n += 2) {
        points.push([numbers[n] ?? 0, numbers[n + 1] ?? 0]);
      }
      // Coordinates after an `M`'s first pair are line-tos, as in SVG.
      steps.push({ kind: letter === 'M' && at > 0 ? 'L' : letter, points });
    }
  }
  return steps;
}

/** Straight lines through `points`, joined back to the first unless `'open'`. */
export const polygon = (
  points: readonly Point[],
  ends: 'closed' | 'open' = 'closed',
): Path => [
  ...points.map(
    (point, n): Step => ({ kind: n === 0 ? 'M' : 'L', points: [point] }),
  ),
  ...(ends === 'closed' ? [{ kind: 'Z', points: [] } as const] : []),
];

// How far a cubic's control sits from its end for four of them to make a circle.
const KAPPA = 0.552_284_75;

/** An ellipse as four cubics, starting at its rightmost point. */
export function ellipse([cx, cy]: Point, rx: number, ry: number = rx): Path {
  const kx = rx * KAPPA;
  const ky = ry * KAPPA;
  const arc = (c1: Point, c2: Point, end: Point): Step => ({
    kind: 'C',
    points: [c1, c2, end],
  });
  return [
    { kind: 'M', points: [[cx + rx, cy]] },
    arc([cx + rx, cy + ky], [cx + kx, cy + ry], [cx, cy + ry]),
    arc([cx - kx, cy + ry], [cx - rx, cy + ky], [cx - rx, cy]),
    arc([cx - rx, cy - ky], [cx - kx, cy - ry], [cx, cy - ry]),
    arc([cx + kx, cy - ry], [cx + rx, cy - ky], [cx + rx, cy]),
    { kind: 'Z', points: [] },
  ];
}
