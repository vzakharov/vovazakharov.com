import type { Pen } from '../ink';
import { dotsWide, GLYPH, glyph } from './glyphs';

export type DotStyle = {
  /** One dot's pitch in stage units. */
  dot?: number;
  color: string;
  /** An edge around every dot, under the text. */
  shadow?: string;
  align?: 'left' | 'center' | 'right';
};

// How much of its pitch a dot fills, leaving the matrix's gaps.
const FILL = 0.84;
// How far the edge reaches past a dot, as a share of its pitch.
const EDGE = 0.3;

/** `text` in the tape's dot face, its top edge at `y`. */
export function dotText(
  pen: Pen,
  text: string,
  [x, y]: readonly [number, number],
  style: DotStyle,
): void {
  const { ctx } = pen;
  const { dot = 4, color, shadow, align = 'left' } = style;
  const wide = dotsWide(text) * dot;
  const left =
    align === 'left' ? x : align === 'center' ? x - wide / 2 : x - wide;
  const dots = new Path2D();
  const edges = new Path2D();
  const grow = dot * EDGE;
  for (let n = 0; n < text.length; n += 1) {
    for (const [col, row] of glyph(text.charAt(n))) {
      const [dx, dy] = [left + (n * GLYPH.advance + col) * dot, y + row * dot];
      dots.rect(dx, dy, dot * FILL, dot * FILL);
      edges.rect(
        dx - grow,
        dy - grow,
        dot * FILL + grow * 2,
        dot * FILL + grow * 2,
      );
    }
  }
  ctx.save();
  if (shadow !== undefined) {
    ctx.fillStyle = shadow;
    ctx.fill(edges);
  }
  ctx.fillStyle = color;
  ctx.fill(dots);
  ctx.restore();
}
