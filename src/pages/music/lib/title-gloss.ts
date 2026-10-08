import type { Locale } from '@/shared/i18n';
import type { SongLanguage, SongText, SungLanguage } from '@/shared/song';
import type { Titled } from '@/shared/typings';

const LATIN = /\p{Script=Latin}/u;

/** The script each locale's readers read natively, beside the Latin every reader of the site reads. */
const LOCALE_SCRIPTS: Record<Locale, RegExp> = {
  en: LATIN,
  ru: /\p{Script=Cyrillic}/u,
};

export type TitleGlossSource = Titled &
  Pick<SongText, 'transliteration' | 'titleTranslation'> & {
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
  { title, transliteration, titleTranslation, titleLanguage }: TitleGlossSource,
  locale: Locale,
  languageShort: Record<SungLanguage, string>,
): string[] {
  const readable = LATIN.test(title) || LOCALE_SCRIPTS[locale].test(title);
  const translation =
    titleTranslation === undefined || titleLanguage === 'instrumental'
      ? titleTranslation
      : `${languageShort[titleLanguage]} ${titleTranslation}`;

  return [readable ? undefined : transliteration, translation].flatMap(
    (part) => part ?? [],
  );
}
