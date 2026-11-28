import type { Glyph, Point } from '@/cube/shared/lettering';

/** Half the hexagon's height: the mark stands one cap height tall. */
const RADIUS = 0.5;
const HALF_WIDTH = RADIUS * Math.cos(Math.PI / 6);
/** The gap after the mark, before the number it prices. */
const GAP = 0.3;
/** The pip's radius: small enough that the nib fills it into a dot. */
const PIP = 0.04;
const PIP_POINTS = 8;

const centre: Point = [HALF_WIDTH, RADIUS];
const top: Point = [HALF_WIDTH, 2 * RADIUS];
const bottom: Point = [HALF_WIDTH, 0];
const upperLeft: Point = [0, 1.5 * RADIUS];
const upperRight: Point = [2 * HALF_WIDTH, 1.5 * RADIUS];
const lowerLeft: Point = [0, 0.5 * RADIUS];
const lowerRight: Point = [2 * HALF_WIDTH, 0.5 * RADIUS];

/** The top face's middle, where the pip sits. */
const pipAt: Point = [HALF_WIDTH, 1.5 * RADIUS];

const pip = Array.from({ length: PIP_POINTS + 1 }, (_, at): Point => {
  const angle = (2 * Math.PI * at) / PIP_POINTS;
  return [pipAt[0] + PIP * Math.cos(angle), pipAt[1] + PIP * Math.sin(angle)];
});

/**
 * The mark of кубики, the cube's currency, as pen strokes in em units like a
 * letter's: an isometric cube one cap height tall, its outline and the three
 * edges meeting at its near corner, with one pip on its top face — a block and
 * a die at once, both of which кубик means. Every floor writes it the same,
 * whatever its script, and the page draws the same strokes as an SVG.
 */
export const CUBES_MARK: Glyph = {
  lines: [
    [top, upperRight, lowerRight, bottom, lowerLeft, upperLeft, top],
    [upperLeft, centre, upperRight],
    [centre, bottom],
    pip,
  ],
  advance: 2 * HALF_WIDTH + GAP,
};
