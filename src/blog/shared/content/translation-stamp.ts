/**
 * No `import 'server-only'`, unlike most of `shared/content/`:
 * `src/blog/scripts/stamp-translation.ts` runs this outside any bundler.
 */

/** The frontmatter key a translation carries its original's `contentHash` under. */
export const TRANSLATION_STAMP = 'translatedFrom';

const FRONTMATTER = /^---\n([\S\s]*?)\n---\n/;

const STAMP_LINE = new RegExp(`^${TRANSLATION_STAMP}:.*$`, 'm');

/** `raw` with its frontmatter's stamp set to `hash`, added where it has none. */
export function stampFrontmatter(raw: string, hash: string): string {
  const block = FRONTMATTER.exec(raw)?.[1];

  if (block === undefined) throw new Error('No frontmatter to stamp');

  const line = `${TRANSLATION_STAMP}: ${hash}`;
  const stamped = STAMP_LINE.test(block)
    ? block.replace(STAMP_LINE, line)
    : `${block}\n${line}`;

  return raw.replace(FRONTMATTER, `---\n${stamped}\n---\n`);
}
