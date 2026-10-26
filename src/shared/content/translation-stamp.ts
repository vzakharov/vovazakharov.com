/**
 * No `import 'server-only'`, unlike most of `shared/content/`:
 * `scripts/stamp-translation.ts` runs this under bare Node.
 */

/** The frontmatter key a translation carries its original's `contentHash` under. */
export const TRANSLATION_STAMP = 'translatedFrom';

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n/;

/** `raw` with its frontmatter's stamp set to `hash`, added where it has none. */
export function stampFrontmatter(raw: string, hash: string): string {
  const block = FRONTMATTER.exec(raw)?.[1];

  if (block === undefined) throw new Error('No frontmatter to stamp');

  const line = `${TRANSLATION_STAMP}: ${hash}`;
  const stamped = new RegExp(`^${TRANSLATION_STAMP}:.*$`, 'm').test(block)
    ? block.replace(new RegExp(`^${TRANSLATION_STAMP}:.*$`, 'm'), line)
    : `${block}\n${line}`;

  return raw.replace(FRONTMATTER, `---\n${stamped}\n---\n`);
}
