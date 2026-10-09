import { z } from 'zod';

/** `YYYY-MM`, or `YYYY-MM-DD` where a quoted value reaches the schema as text. */
const SONG_DATE = /^\d{4}-\d{2}(?:-\d{2})?$/;

/**
 * Whether the text names a day the calendar has: `Date` rolls `2024-02-30`
 * over into March rather than refusing it, so the parse is read back.
 */
function isCalendarDate(text: string): boolean {
  const date = new Date(text);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, text.length) === text
  );
}

/**
 * When a song was made, to the precision the author remembers it: `2024-01`
 * for a month, `2024-01-15` where the day is known. YAML reads the full form
 * as a Date and the month as a string, and both land on UTC midnight — the
 * month's on its first day, which sorts it and is never shown, the page dating
 * every song to its month. A bare year is refused rather than coerced: YAML
 * hands it over as a number, which `Date` reads as milliseconds into 1970.
 */
export const songDateSchema = z.union([
  z.date(),
  z
    .string()
    .regex(SONG_DATE, 'A song is dated YYYY-MM, or YYYY-MM-DD.')
    .refine(isCalendarDate, 'Not a date the calendar has.')
    .transform((text) => new Date(text)),
]);
