import { bounds } from '@/cube/shared/lettering';

import { CUBES_MARK } from '../lib/cubes-mark';
import { formatCubes } from '../lib/figures';
import classes from './cube.module.scss';

/** The pen's width, in em: the sign boards' nib. */
const NIB = 0.15;

const [left, bottom, right, top] = bounds(CUBES_MARK.lines);
const pad = NIB / 2;
const viewBox = [
  left - pad,
  -top - pad,
  right - left + NIB,
  top - bottom + NIB,
].join(' ');

/** Each stroke as SVG points, y flipped: SVG's runs down. */
const strokes = CUBES_MARK.lines.map((line) =>
  line.map(([x, y]) => `${String(x)},${String(-y)}`).join(' '),
);

/** The mark's spoken name, which a screen reader says in its place. */
type WithLabel = { label: string };

type CubesProps = WithLabel & { count: number };

/**
 * The кубики mark in text, a cap height tall, inked in the text's colour: the
 * strokes the sign boards letter, as an SVG.
 */
export function CubesMark({ label }: WithLabel) {
  return (
    <>
      <svg className={classes['cubesMark']} {...{ viewBox }} aria-hidden>
        {strokes.map((points) => (
          <polyline
            key={points}
            {...{ points }}
            fill="none"
            stroke="currentColor"
            strokeWidth={NIB}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
      <span className={classes['unseen']}>{label} </span>
    </>
  );
}

/** `count` кубики as text: the mark, then the number. */
export function Cubes({ count, label }: CubesProps) {
  return (
    <>
      <CubesMark {...{ label }} />
      {formatCubes(count)}
    </>
  );
}
