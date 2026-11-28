import { type Line, through } from '@/clip/shared/score';

/** How long a line stays up after its last word, unless the next replaces it, and how long it then takes to go, in seconds. */
const HOLD = 2.4;
const FADE = 0.4;

/**
 * How many characters of `line.text` are sung by `t`: every word sung, and
 * of the one being sung the share of its span gone by.
 */
export function sungChars(line: Line, t: number): number {
  let sung = 0;
  for (const [n, word] of line.words.entries()) {
    if (t < word.from) break;
    const start = line.starts[n] ?? 0;
    sung = start + Math.ceil(through(word, t) * word.text.length);
  }
  return sung;
}

/** `text` with every character from `chars` on blanked, so what is shown stands where the whole line would. */
export const shown = (text: string, chars: number): string =>
  text.slice(0, chars) + text.slice(chars).replaceAll(/\S/gu, ' ');

/** `text` broken at the space nearest its middle when it runs past `rowChars`; every character keeps its index. */
export function wrapped(text: string, rowChars: number): string {
  if (text.length <= rowChars) return text;
  const middle = text.length / 2;
  let best = -1;
  for (let at = text.indexOf(' '); at !== -1; at = text.indexOf(' ', at + 1)) {
    if (best === -1 || Math.abs(at - middle) < Math.abs(best - middle)) {
      best = at;
    }
  }
  return best === -1 ? text : `${text.slice(0, best)}\n${text.slice(best + 1)}`;
}

/** How much of the line shows at `t`: whole while sung and held, fading after. */
export const presence = (line: Line, t: number): number =>
  Math.min(1, Math.max(0, 1 - (t - line.to - HOLD) / FADE));
