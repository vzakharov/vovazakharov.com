import { bounds } from '@/cube/shared/lettering';

import { CUBES_MARK } from '../lib/cubes-mark';
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
const paths = CUBES_MARK.lines.map((line) =>
  line.map(([x, y]) => `${String(x)},${String(-y)}`).join(' '),
);

/**
 * The кубики mark in text, a cap height tall, inked in the text's colour: the
 * strokes the sign boards letter, as an SVG.
 */
export function CubesMark({ label }: { label: string }) {
  return (
    <svg
      className={classes['cubesMark']}
      viewBox={viewBox}
      role="img"
      aria-label={label}
    >
      {paths.map((points) => (
        <polyline
          key={points}
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth={NIB}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
