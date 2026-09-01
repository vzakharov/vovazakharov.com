import 'server-only';

import { z } from 'zod';

/**
 * Frontmatter carries only what the markdown cannot express on its own. The
 * title, word count and heading outline are derived from the document body, so
 * they are deliberately absent here — a second copy would be free to drift.
 */
export const frontmatterSchema = z.object({
  /** Meta description and index-card blurb. */
  description: z.string().min(1),
  /** Published date. YAML parses an unquoted `2026-08-29` into a Date. */
  date: z.coerce.date(),
  /** Free-text series marker, e.g. `I of II`. */
  part: z.string().min(1).optional(),
  /** Open Graph image, relative to the document. */
  ogImage: z.string().min(1).optional(),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;
