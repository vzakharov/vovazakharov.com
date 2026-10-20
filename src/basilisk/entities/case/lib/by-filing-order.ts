<<<<<<< HEAD:src/basilisk/entities/case/lib/by-filing-order.ts
import type { WithFrontmatter } from '@/kernel/shared/content';

import type { CaseFrontmatter } from '@/basilisk/shared/content';
=======
import type {
  BaseFrontmatter,
  Docketed,
  WithFrontmatter,
} from '@/shared/content';
>>>>>>> origin/main:src/entities/case/lib/by-filing-order.ts

type Numbered = WithFrontmatter<BaseFrontmatter & Docketed>;

/**
 * The docket's order, the last case filed first. Numbers are zero-padded, so
 * their string order is their filing order.
 */
export function byFilingOrder(a: Numbered, b: Numbered): number {
  return b.frontmatter.case.localeCompare(a.frontmatter.case);
}
