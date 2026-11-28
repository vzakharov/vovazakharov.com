import { at, INK_PALETTE, type Pen, type Place } from '@/clip/shared/ink';

import {
  layOut,
  type TextSet,
  type WrittenStroke,
  writtenUpTo,
} from './layout';
import { LETTERING_PALETTE } from './palette-lettering';
import { traceBoiled } from './trace';

/** Text, where it goes, and how far it is written. */
export type Writing = TextSet &
  Place & {
    /**
     * How much is written, in `[0, 1]`: the strokes appear in the order a hand
     * makes them, the last one growing. 1 by default.
     */
    progress?: number;
    /** The line's width, in cap heights. */
    weight?: number;
  };

/** The written strokes of `text`, drawn at `writing`'s place by `draw`. */
export function writeWith(
  pen: Pen,
  text: string,
  writing: Writing,
  draw: (strokes: readonly WrittenStroke[]) => void,
): void {
  const { progress = 1 } = writing;
  const strokes = writtenUpTo(layOut(text, writing), progress);
  if (strokes.length > 0) {
    at(pen, writing, () => {
      draw(strokes);
    });
  }
}

/** How one layer of the lettering is stroked. */
type LayerStyle = {
  color: string;
  /** The line's width in stage units. */
  lineWidth: number;
  /** Which boil: layers sharing one shiver as one. */
  boilSeed: number;
  wobble: number;
};

/** One stroked path through every stroke in `strokes`. */
function strokeAll(
  pen: Pen,
  strokes: readonly WrittenStroke[],
  style: LayerStyle,
  offset: readonly [number, number] = [0, 0],
): void {
  const { ctx } = pen;
  ctx.beginPath();
  // Seeded by its letter, a stroke boils alike in every layer drawn of it.
  for (const { drawn, glyph } of strokes) {
    traceBoiled(pen, drawn, style.boilSeed + glyph, style.wobble, offset);
  }
  ctx.strokeStyle = style.color;
  ctx.lineWidth = style.lineWidth;
  ctx.stroke();
}

function roundEnds(pen: Pen): void {
  pen.ctx.lineCap = 'round';
  pen.ctx.lineJoin = 'round';
}

/** A monoline marker hand: signs, captions, channel graphics. */
export function writePlain(
  pen: Pen,
  text: string,
  writing: Writing & { color?: string },
): void {
  const {
    letterHeight: size,
    seed = 1,
    weight = 0.1,
    color = LETTERING_PALETTE.marker,
  } = writing;
  writeWith(pen, text, writing, (strokes) => {
    roundEnds(pen);
    strokeAll(pen, strokes, {
      color,
      lineWidth: size * weight,
      boilSeed: seed,
      wobble: size * 0.02,
    });
  });
}

/**
 * Fat round strokes in a colour per letter, outlined in ink over a hard drop
 * shadow, with a highlight down each: the kids' show title.
 */
export function writeBubble(
  pen: Pen,
  text: string,
  writing: Writing & { colors?: readonly string[]; shadow?: string },
): void {
  const {
    letterHeight: size,
    seed = 1,
    weight = 0.26,
    colors = LETTERING_PALETTE.bubble,
    shadow = LETTERING_PALETTE.bubbleShadow,
  } = writing;
  const width = size * weight;
  const outline = Math.max(3, size * 0.07);
  const wobble = size * 0.02;
  writeWith(pen, text, writing, (strokes) => {
    const { ctx } = pen;
    roundEnds(pen);
    const drop: [number, number] = [size * 0.07, size * 0.09];
    const style = { lineWidth: width + outline * 2, boilSeed: seed, wobble };
    strokeAll(pen, strokes, { ...style, color: shadow }, drop);
    strokeAll(pen, strokes, { ...style, color: INK_PALETTE.ink });
    // Letters of one colour go down as one path, each over the outlines of all.
    for (const [index, color] of colors.entries()) {
      const own = strokes.filter(
        ({ glyph }) => glyph % colors.length === index,
      );
      if (own.length > 0)
        strokeAll(pen, own, {
          color,
          lineWidth: width,
          boilSeed: seed,
          wobble,
        });
    }
    ctx.save();
    ctx.globalAlpha *= 0.7;
    strokeAll(
      pen,
      strokes,
      {
        color: LETTERING_PALETTE.bubbleHighlight,
        lineWidth: width * 0.22,
        boilSeed: seed,
        wobble,
      },
      [-width * 0.2, -width * 0.2],
    );
    ctx.restore();
  });
}
