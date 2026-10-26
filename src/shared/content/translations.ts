import 'server-only';

import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';

import { DEFAULT_LOCALE, isLocale, type Locale, LOCALES } from '@/shared/i18n';

import { contentHash } from './content-hash';
import { TRANSLATION_STAMP } from './translation-stamp';

/**
 * A `translated` collection (`COLLECTIONS[id].localized`) keeps an original as
 * `<stem>.<locale>.md` and its translation into the default language as
 * `<stem>.md`. The translation states only what differs — its description,
 * and the stamp — and takes everything else from the original.
 */

/** The languages an original can be in: any but the one it is translated into. */
const ORIGINAL_LOCALES = LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);

/** `<stem>.<locale>` split, where the suffix names an original's language. */
export function splitLocale(stem: string): { stem: string; locale?: Locale } {
  const suffix = path.extname(stem).slice(1);

  return isLocale(suffix) && suffix !== DEFAULT_LOCALE
    ? { stem: stem.slice(0, -(suffix.length + 1)), locale: suffix }
    : { stem };
}

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
    const { stem, locale } = splitLocale(fileName.replace(/\.md$/, ''));

    if (locale !== undefined && !fileNames.includes(`${stem}.md`)) {
      throw new Error(
        `${fileName} has no translation: ${stem}.md, stamped by \`pnpm translation:stamp\`.`,
      );
    }
  }
}
