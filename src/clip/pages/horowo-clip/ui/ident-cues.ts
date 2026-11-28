import { PREROLL } from '@/clip/shared/score';

/**
 * When each part of the pre-roll begins, in film seconds from the film's
 * first frame: the picture and its sound both read them. The test card
 * holds from the address's beep to the song's first hit at `PREROLL`.
 */
export const IDENT_CUES = {
  /** The photosensitivity warning fades in from black, and out by `warned`. */
  warning: 0,
  warned: 6.6,
  /** Snow, and the hiss under it. */
  snow: 7,
  /** The test card locks in. */
  tuned: 8.2,
  /** Each of the test card's three ident lines arrives on a beep. */
  lines: [9, 9.7, 10.4],
  /** The channel's address arrives on a longer beep, like a time signal's last pip. */
  address: 11.1,
  end: PREROLL,
} as const;
