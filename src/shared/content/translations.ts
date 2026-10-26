import 'server-only';

import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';

import { contentHash } from './content-hash';
import { ORIGINAL_LOCALES, translationOf } from './locale-suffix';
import { TRANSLATION_STAMP } from './translation-stamp';

/**
 * A `translated` collection (`COLLECTIONS[id].localized`) keeps an original as
 * `<stem>.<locale>.md` and its translation into the default language as
 * `<stem>.md`. The translation states only what differs — its description,
 * and the stamp — and takes everything else from the original.
 */

function originalOf(dir: string, stem: string): string {
  const originals = ORIGINAL_LOCALES.map((locale) => `${stem}.${locale}.md`);
  const found = originals.filter((fileName) =>
    fs.existsSync(path.join(dir, fileName)),
  );
  const [original] = found;

  if (original === undefined || found.length > 1) {
    throw new Error(
      `${stem}.md is a translation, so exactly one original sits beside it: ${originals.join(' or ')}.`,
    );
  }

  return original;
}

/**
 * The translation's frontmatter over its original's. Throws where the
 * original changed since the translation was made, which is what keeps a page
 * from publishing one language behind the other.
 */
export function translatedData(
  dir: string,
  fileName: string,
  data: Record<string, unknown>,
): Record<string, unknown> {
  const original = originalOf(dir, fileName.replace(/\.md$/, ''));
  const source = fs.readFileSync(path.join(dir, original), 'utf8');
  const { [TRANSLATION_STAMP]: stamp, ...own } = data;

  if (stamp !== contentHash(source)) {
    throw new Error(
      `${fileName} was not translated from ${original} as it stands: translate it again, then run \`pnpm translation:stamp\` on ${original}.`,
    );
  }

  return { ...matter(source).data, ...own };
}

/** Throws on an original with no translation beside it, which would publish in one language only. */
export function assertTranslated(fileNames: string[]): void {
  for (const fileName of fileNames) {
    const translation = translationOf(fileName);

    if (translation !== undefined && !fileNames.includes(translation)) {
      throw new Error(
        `${fileName} has no translation: ${translation}, stamped by \`pnpm translation:stamp\`.`,
      );
    }
  }
}
