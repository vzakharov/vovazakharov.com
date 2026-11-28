import { STAGE } from '@/clip/shared/ink';
import { writePlain } from '@/clip/shared/lettering';
import type { Drawing } from '@/clip/shared/timeline';

import { PARTY_PALETTE } from './palette-meadow-party';

// The chorus's «не сдохнуть бы», each word at its onset in the score's
// words.ts, which the vocal stem's envelope confirms to a frame; «от» stays off.
const BREAK_WORDS = [
  ['НЕ', 43.68],
  ['СДОХНУТЬ', 43.88],
  ['БЫ', 44.4],
] as const;

const LETTER_HEIGHT = 150;
const LEADING = 1.3;
// How long a word's landing takes, from oversized to set, in seconds.
const LANDS = 0.07;

/**
 * Black, and nothing on it but the words sung so far, stacked a line each and
 * built up word by word, each slamming down on its onset and jolting the ones
 * above it.
 */
export const lyricBreak: Drawing = (pen) => {
  const { ctx, playhead } = pen;
  const sung = BREAK_WORDS.filter(([, onset]) => playhead >= onset);
  const latest = sung.at(-1)?.[1] ?? playhead;
  const slam = Math.max(0, 1 - (playhead - latest) / LANDS);
  const top =
    (STAGE.height - LETTER_HEIGHT * LEADING * (BREAK_WORDS.length - 1)) / 2;
  for (const [n, [word]] of sung.entries()) {
    const fresh = n === sung.length - 1;
    const scale = 1 + (fresh ? 0.35 : 0.04) * slam;
    ctx.save();
    ctx.translate(STAGE.width / 2, top + n * LETTER_HEIGHT * LEADING);
    ctx.scale(scale, scale);
    writePlain(pen, word, {
      x: 0,
      y: -LETTER_HEIGHT / 2,
      letterHeight: LETTER_HEIGHT,
      alignment: 'center',
      weight: 0.16,
      jitter: 0.25,
      color: PARTY_PALETTE.lyric,
      seed: 70 + n,
    });
    ctx.restore();
  }
};
