import type { Locale } from '@/shared/i18n';
import type { SongLanguage, SungLanguage, TitleGloss } from '@/shared/song';
import type { Titled } from '@/shared/typings';

const LATIN = /\p{Script=Latin}/u;

/** The script each locale's readers read natively, beside the Latin every reader of the site reads. */
const LOCALE_SCRIPTS: Record<Locale, RegExp> = {
  en: LATIN,
  ru: /\p{Script=Cyrillic}/u,
};

/** A title as one locale shows it, and what the locale tells its reader about it where it keeps the song's own. */
export type GlossedTitle = Titled & { gloss?: TitleGloss };

export type TitleGlossSource = GlossedTitle & {
  /** What the title is in; `instrumental` where nothing says, which leaves the translation unprefixed. */
  titleLanguage: SongLanguage;
};

/**
 * The muted line under a song's title: the title in the reader's own letters
 * where they cannot read its script, then its meaning prefixed with the language
 * it is in — `Agios o Skopos · gr. Holy Is the Purpose`. A Latin title is
 * never transliterated, and neither is one in the reader's own script.
 */
export function titleGloss(
  { title, gloss = {}, titleLanguage }: TitleGlossSource,
  locale: Locale,
  languageShort: Record<SungLanguage, string>,
): string[] {
  const { transliteration, translation } = gloss;
  const readable = LATIN.test(title) || LOCALE_SCRIPTS[locale].test(title);
  const meaning =
    translation === undefined || titleLanguage === 'instrumental'
      ? translation
      : `${languageShort[titleLanguage]} ${translation}`;

  return [readable ? undefined : transliteration, meaning].flatMap(
    (part) => part ?? [],
  );
}
