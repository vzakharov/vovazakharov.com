import type { Phone } from './phone';

/** One sound of a line, as it is to be said. */
export type Uttered = {
  phone: Phone;
  /** A vowel the word leans on: longer, and higher where the line has a tune. */
  stress?: boolean;
  /**
   * Sung rather than said: the pitch held, in semitones over the voice's own.
   */
  note?: number;
  /** How long a sung or laughed vowel lasts, in beats of the voice's pace. */
  beats?: number;
};

const TUNES = ['fall', 'rise', 'flat'] as const;

/**
 * Where the pitch goes over a line: down as a statement's does, up at the end
 * as a question's, or nowhere, as a machine reads.
 */
export type Tune = (typeof TUNES)[number];

/** A word as it is written and as it sounds. */
export type Word = { spelling: string; sounds: readonly Uttered[] };

export type Line = {
  /** What a subtitle would show. */
  text: string;
  phones: readonly Uttered[];
  tune: Tune;
};

export const PAUSE: Uttered = { phone: 'pau' };
