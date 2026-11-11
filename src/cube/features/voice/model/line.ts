import type { WithText } from '@/kernel/shared/typings';

import type { Phone } from './phone';

/** One sound of a line, as it is to be said. */
export type Uttered = {
  phone: Phone;
  /** A vowel the word leans on: longer, and higher where the line has a tune. */
  stress?: boolean;
  /**
   * Sung rather than said: the pitch it starts at, in semitones over the
   * voice's own, held unless `slide` says where it ends.
   */
  note?: number;
  /** The pitch a sound with a `note` ends at, in semitones. */
  slide?: number;
  /** How long it lasts, in beats of the voice's pace, in place of its own length. */
  beats?: number;
  /** How loud it is against its usual self: 1 unless said otherwise. */
  loud?: number;
  /** Seconds it takes to swell from, and die into, the sounds beside it. */
  ease?: number;
};

const TUNES = ['fall', 'rise', 'flat'] as const;

/**
 * Where the pitch goes over a line: down as a statement's does, up at the end
 * as a question's, or nowhere, as a machine reads.
 */
export type Tune = (typeof TUNES)[number];

/** A word as it is written and as it sounds. */
export type Word = { spelling: string; sounds: readonly Uttered[] };

/** What is heard, its `text` being what a subtitle would show. */
export type Line = WithText & {
  phones: readonly Uttered[];
  tune: Tune;
  /** Whether a chime rings before it, as before an announcement. */
  chime?: boolean;
};

export const PAUSE: Uttered = { phone: 'pau' };
