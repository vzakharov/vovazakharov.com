import type { CaseFrontmatter, WithFrontmatter } from '@/shared/content';

type Numbered = WithFrontmatter<Pick<CaseFrontmatter, 'case' | 'date'>>;

/**
 * The docket's order, the last case filed first. Numbers are zero-padded, so
 * their string order is their filing order.
 */
export function byFilingOrder(a: Numbered, b: Numbered): number {
  return b.frontmatter.case.localeCompare(a.frontmatter.case);
}
