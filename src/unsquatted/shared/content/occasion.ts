/**
 * No `import 'server-only'`: the stamp is a pure function the suite and the
 * catalogue's client rows both read.
 */

import { z } from 'zod';

import type { WithLink } from '@/kernel/shared/typings';

/** The day a post is written for, which its stamp and eyebrow print. */
export const occasionSchema = z.object({
  name: z.string().min(1),
  /** YAML parses an unquoted `2026-11-11` into a Date. */
  date: z.coerce.date(),
});

export type Occasion = z.infer<typeof occasionSchema>;

export type WithOccasion = { occasion: Occasion };

/** A post's link and the occasion its stamp prints. */
export type OccasionLink = WithLink & WithOccasion;

/**
 * `11.11`: the day before the month, as the occasion itself is usually
 * written, and with no year — the stamp names a day that comes round again.
 */
export function occasionStamp(date: Date): string {
  const [, month, day] = date.toISOString().slice(0, 10).split('-');

  return `${day}.${month}`;
}

/** `11.11 · Singles’ Day`, over a post's title on its page and its card. */
export function occasionLine({ name, date }: Occasion): string {
  return `${occasionStamp(date)} · ${name}`;
}
