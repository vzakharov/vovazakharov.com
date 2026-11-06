/**
 * The crease pattern read off the flat folded state: every edge two pieces
 * share, assigned mountain, valley or flat by how the pieces lie.
 */
import { determinant, type Segment } from './geometry.ts';
import { adjacency, type FoldState } from './state.ts';

const ASSIGNMENTS = ['M', 'V', 'F'] as const;
type Assignment = (typeof ASSIGNMENTS)[number];

export type Crease = {
  readonly segment: Segment;
  readonly assignment: Assignment;
};

export function creasePattern(state: FoldState): Crease[] {
  const creases: Crease[] = [];
  for (const [i, a] of state.pieces.entries()) {
    for (const b of state.pieces.slice(i + 1)) {
      const segment = adjacency(a, b);
      if (!segment) continue;
      const aFrontUp = determinant(a.placement) > 0;
      const bFrontUp = determinant(b.placement) > 0;
      // Folded, the two faces turn opposite ways; seen from a's front side, a
      // valley brings b up over it.
      const assignment: Assignment =
        aFrontUp === bFrontUp
          ? 'F'
          : aFrontUp === b.order > a.order
            ? 'V'
            : 'M';
      creases.push({ segment, assignment });
    }
  }
  return creases;
}

const STROKE: Record<Assignment, { color: string; dash: string }> = {
  V: { color: '#2b6cdf', dash: '6 4' },
  M: { color: '#d6332b', dash: '10 3 2 3' },
  F: { color: '#bbbbbb', dash: '2 3' },
};

/** The pattern drawn on the unit square, valleys blue, mountains red. */
export function creasePatternSvg(
  creases: readonly Crease[],
  side = 400,
): string {
  const pad = 10;
  const x = (u: number) => (pad + u * side).toFixed(2);
  const y = (v: number) => (pad + (1 - v) * side).toFixed(2);
  const lines = creases.map(({ segment: [a, b], assignment }) => {
    const { color, dash } = STROKE[assignment];
    return `<line x1="${x(a[0])}" y1="${y(a[1])}" x2="${x(b[0])}" y2="${y(b[1])}" stroke="${color}" stroke-width="1.6" stroke-dasharray="${dash}"/>`;
  });
  const total = side + 2 * pad;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${total}">`,
    '<rect width="100%" height="100%" fill="#fff"/>',
    `<rect x="${pad}" y="${pad}" width="${side}" height="${side}" fill="none" stroke="#222" stroke-width="1.5"/>`,
    ...lines,
    '</svg>',
  ].join('\n');
}
