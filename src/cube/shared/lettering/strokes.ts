import { placedAt, type Polyline } from './polyline';
import { glyphIn, type Script } from './script';

/**
 * `text` on one line as pen strokes in em units — cap height 1, baseline
 * y = 0, starting at x = 0 — written in `script`. Lower case is written as
 * capitals.
 */
export function strokes(text: string, script: Script): Polyline[] {
  let pen = 0;
  return [...text].flatMap((char) => {
    const { lines, advance } = glyphIn(char, script);
    const set = placedAt(lines, 1, pen);
    pen += advance;
    return set;
  });
}

/** How far `text` advances the pen in `script`, in em: its line's width. */
export const measure = (text: string, script: Script): number =>
  [...text].reduce((pen, char) => pen + glyphIn(char, script).advance, 0);
