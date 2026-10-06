import type {
  CaseFrontmatter,
  Slugged,
  WithFrontmatter,
} from '@/shared/content';

type Filed = Slugged & WithFrontmatter<Pick<CaseFrontmatter, 'case' | 'date'>>;

/**
 * Fails the build on a case number two dossiers share. Uniqueness is the
 * docket's property, out of reach of a per-file schema, and hand-assigned
 * numbers make a duplicate easy.
 */
export function assertUniqueCases(dossiers: readonly Filed[]): void {
  // A loop rather than `Map.groupBy`, which the deploy's Node 20 lacks.
  const slugsByCase = new Map<string, Filed[]>();
  for (const dossier of dossiers) {
    const { case: number } = dossier.frontmatter;
    slugsByCase.set(number, [...(slugsByCase.get(number) ?? []), dossier]);
  }
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
