/**
 * No `import 'server-only'`: the stamp is a pure function the suite and the
 * catalogue's client rows both read.
 */

import { z } from 'zod';

/** The day a post is written for, which its stamp and eyebrow print. */
export const occasionSchema = z.object({
  name: z.string().min(1),
  /** YAML parses an unquoted `2026-11-11` into a Date. */
  date: z.coerce.date(),
});

export type Occasion = z.infer<typeof occasionSchema>;

export type WithOccasion = { occasion: Occasion };

/**
 * `11.11`: the day before the month, as the occasion itself is usually
 * written, and with no year — the stamp names a day that comes round again.
 */
export function occasionStamp(date: Date): string {
  const [, month, day] = date.toISOString().slice(0, 10).split('-');

  return `${day}.${month}`;
}
