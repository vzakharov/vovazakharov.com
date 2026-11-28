import type { Seeded, Sized } from '@/kernel/shared/typings';

import { type Point, rng } from '@/clip/shared/ink';

import type { Glyph, Stroke } from './glyph';
import { CYRILLIC } from './glyphs-cyrillic';
import { DIGITS, MARKS } from './glyphs-marks';

const GLYPHS: Readonly<Record<string, Glyph>> = {
  ...CYRILLIC,
  ...DIGITS,
  ...MARKS,
};

/** Every character the lettering can draw, lower case aside. */
export const ALPHABET = Object.keys(GLYPHS).join('');

/** How a block of text is set: its size, spacing and how unsteady the hand. */
export type TextSet = Partial<Seeded> & {
  /** The height of a capital in stage units. */
  letterHeight: number;
  /** Lines are split on `\n`; each is placed by this against `x = 0`. */
  alignment?: 'left' | 'center' | 'right';
  /** The gap between letters, in cap heights. */
  tracking?: number;
  /** Baseline to baseline, in cap heights. */
  leading?: number;
  /**
   * How unsteady the hand: 0 sets every letter on the line, 1 lets each one
   * drift off it, lean and swell like a child's or a madman's.
   */
  jitter?: number;
};

/** How much ink a stroke, or every stroke of a text, takes: its length in stage units. */
type Inked = { inkLength: number };

/** A stroke where it lands, with where it falls in the order of writing. */
export type LaidStroke = Inked & {
  points: Stroke;
  /** The ink of every stroke written before it. */
  inkBefore: number;
  /** Which character of the text it belongs to, spaces and line breaks not counted. */
  glyph: number;
};

/** A block of text as strokes on the stage, its cap line's left end at (0, 0) unless aligned otherwise. */
export type TextLayout = Inked &
  Sized & {
    strokes: readonly LaidStroke[];
  };

function glyphOf(character: string): Glyph {
  const glyph = GLYPHS[character.toUpperCase()];
  if (!glyph) throw new Error(`No lettering glyph for ${character}`);
  return glyph;
}

/** The length of a polyline. */
export const lengthOf = (points: Stroke): number => {
  let length = 0;
  for (let n = 1; n < points.length; n += 1) {
    const [ax, ay] = points[n - 1] ?? [0, 0];
    const [bx, by] = points[n] ?? [0, 0];
    length += Math.hypot(bx - ax, by - ay);
  }
  return length;
};

function layOutFresh(text: string, set: TextSet): TextLayout {
  const {
    letterHeight: size,
    alignment = 'left',
    tracking = 0.16,
    leading = 1.55,
    jitter = 0,
    seed = 1,
  } = set;
  const random = rng(seed);
  const unsteady = () => (random() - 0.5) * jitter;
  const strokes: LaidStroke[] = [];
  let written = 0;
  let width = 0;
  let inked = 0;
  const lines = text.split('\n');
  for (const [row, line] of lines.entries()) {
    const glyphs = Array.from(line, (character) => glyphOf(character));
    let lineWidth = -tracking;
    for (const glyph of glyphs) lineWidth += glyph.setWidth + tracking;
    width = Math.max(width, lineWidth * size);
    let advance = { left: 0, center: -lineWidth / 2, right: -lineWidth }[
      alignment
    ];
    for (const glyph of glyphs) {
      const scale = size * (1 + unsteady() * 0.18);
      const lean = unsteady() * 0.16;
      // The glyph's foot: it leans about it, so a leaning letter stays on its line.
      const footX = (advance + glyph.setWidth / 2) * size;
      const footY = (unsteady() * 0.16 + row * leading + 1) * size;
      const [cos, sin] = [Math.cos(lean), Math.sin(lean)];
      for (const stroke of glyph.strokes) {
        const points = stroke.map(([x, y]): Point => {
          const [dx, dy] = [x - glyph.setWidth / 2, y - 1];
          return [
            footX + (dx * cos - dy * sin) * scale,
            footY + (dx * sin + dy * cos) * scale,
          ];
        });
        const length = lengthOf(points);
        strokes.push({
          points,
          inkLength: length,
          inkBefore: written,
          glyph: inked,
        });
        written += length;
      }
      if (glyph.strokes.length > 0) inked += 1;
      advance += glyph.setWidth + tracking;
    }
  }
  const height = size * (1 + (lines.length - 1) * leading);
  return { strokes, width, height, inkLength: written };
}

// Layouts are a pure function of their inputs and scenes ask for the same few
// every frame, so each is computed once.
const LAYOUTS = new Map<string, TextLayout>();
const LAYOUT_CACHE_SIZE = 256;

/** `text` laid out as strokes. Lower case is set in capitals; a character with no glyph throws. */
export function layOut(text: string, set: TextSet): TextLayout {
  const key = JSON.stringify([text, set]);
  const cached = LAYOUTS.get(key);
  if (cached) return cached;
  if (LAYOUTS.size >= LAYOUT_CACHE_SIZE) LAYOUTS.clear();
  const fresh = layOutFresh(text, set);
  LAYOUTS.set(key, fresh);
  return fresh;
}

/** A stroke as far as the hand has got, and how much of it that is. */
export type WrittenStroke = LaidStroke & {
  /** Its drawn part. */
  drawn: Stroke;
  /** How much of it is drawn, in `(0, 1]`. */
  done: number;
  /** How much ink the hand has laid since it finished this one: 0 while it is being drawn. */
  inkAfter: number;
};

/**
 * The strokes `progress` of the way through writing `layout`, in order, the
 * last one cut where the hand has got to; strokes not yet begun are left out.
 */
export function writtenUpTo(
  layout: TextLayout,
  progress: number,
): WrittenStroke[] {
  const reach = Math.min(1, Math.max(0, progress)) * layout.inkLength;
  const written: WrittenStroke[] = [];
  for (const stroke of layout.strokes) {
    const into = reach - stroke.inkBefore;
    if (into <= 0) break;
    if (into >= stroke.inkLength) {
      written.push({
        ...stroke,
        drawn: stroke.points,
        done: 1,
        inkAfter: into - stroke.inkLength,
      });
      continue;
    }
    written.push({
      ...stroke,
      drawn: cut(stroke.points, into),
      done: into / stroke.inkLength,
      inkAfter: 0,
    });
  }
  return written;
}

/** `points` cut `length` along from their start. */
export function cut(points: Stroke, length: number): Stroke {
  const out: Point[] = [];
  let left = length;
  for (let n = 0; n < points.length; n += 1) {
    const point = points[n];
    if (!point) break;
    const previous = points[n - 1];
    if (!previous) {
      out.push(point);
      continue;
    }
    const step = Math.hypot(point[0] - previous[0], point[1] - previous[1]);
    if (step >= left) {
      const f = step === 0 ? 0 : left / step;
      out.push([
        previous[0] + (point[0] - previous[0]) * f,
        previous[1] + (point[1] - previous[1]) * f,
      ]);
      return out;
    }
    out.push(point);
    left -= step;
  }
  return out;
}
