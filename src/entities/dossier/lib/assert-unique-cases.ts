import type {
  DossierFrontmatter,
  Slugged,
  WithFrontmatter,
} from '@/shared/content';

type Filed = Slugged & WithFrontmatter<Pick<DossierFrontmatter, 'case' | 'date'>>;

/**
 * Fails the build on a case number two dossiers share. The schema can check a
 * number's shape but not its uniqueness, which is a property of the docket
 * rather than of any one file — and a duplicate is easy to make, the numbers
 * being assigned by hand in filing order.
 */
export function assertUniqueCases(dossiers: readonly Filed[]): void {
  const slugsByCase = Map.groupBy(dossiers, (dossier) => dossier.frontmatter.case);
  const clashes = [...slugsByCase].filter(([, filed]) => filed.length > 1);

  if (clashes.length === 0) return;

  throw new Error(
    `Case numbers are unique on the docket; these are not:\n${clashes
      .map(([number, filed]) => `  ${number}: ${filed.map(({ slug }) => slug).join(', ')}`)
      .join('\n')}`,
  );
}
