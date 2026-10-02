import type {
  DossierFrontmatter,
  Slugged,
  WithFrontmatter,
} from '@/shared/content';

type Filed = Slugged &
  WithFrontmatter<Pick<DossierFrontmatter, 'case' | 'date'>>;

/**
 * Fails the build on a case number two dossiers share. Uniqueness is the
 * docket's property, out of reach of a per-file schema, and hand-assigned
 * numbers make a duplicate easy.
 */
export function assertUniqueCases(dossiers: readonly Filed[]): void {
  const slugsByCase = Map.groupBy(
    dossiers,
    (dossier) => dossier.frontmatter.case,
  );
  const clashes = [...slugsByCase].filter(([, filed]) => filed.length > 1);

  if (clashes.length === 0) return;

  throw new Error(
    `Case numbers are unique on the docket; these are not:\n${clashes
      .map(
        ([number, filed]) =>
          `  ${number}: ${filed.map(({ slug }) => slug).join(', ')}`,
      )
      .join('\n')}`,
  );
}
