#!/usr/bin/env node

/**
 * Fails on a song whose title a reader cannot place — every Markdown file
 * directly under `apps/vova/public/music/`:
 *
 *   pnpm check:song-titles
 *
 * The rules are `.claude/rules/songs.md`'s on a song's title:
 *
 * - `titleLanguage`, right under `title`, wherever the title is not in the one
 *   language sung — the song is sung in several, is instrumental, or its title
 *   is in another language — and nowhere else.
 * - A title not in a locale's language carries a `translation` under that
 *   locale — Italian `Inverno` under both, a Russian title under `en`. A
 *   `transliteration` is optional, a translation alone standing for both where
 *   the two would read the same. A locale's own name for the song, a string
 *   `title`, stands in for either.
 *
 * Which language a title is in is only partly mechanical: a title with no
 * letter of the sung language's script is flagged as wanting `titleLanguage`,
 * and the rest is held by reading.
 */

import matter from 'gray-matter';
import fs from 'node:fs';
import { z } from 'zod';

import { songFiles } from './lib/public-markdown.ts';

/** The letters each sung language is written in; a language not listed is written in Latin. */
const SCRIPTS: Partial<Record<string, RegExp>> = {
  ru: /\p{Script=Cyrillic}/u,
  tt: /\p{Script=Cyrillic}/u,
  ar: /\p{Script=Arabic}/u,
  el: /\p{Script=Greek}/u,
  zh: /\p{Script=Han}/u,
};

const LATIN = /\p{Script=Latin}/u;

const localeTitleSchema = z
  .object({
    title: z
      .union([
        z.string(),
        z.object({
          transliteration: z.string().optional(),
          translation: z.string().optional(),
        }),
      ])
      .optional(),
  })
  .optional();

/** The few fields this check reads; the song schema itself is `server-only`. */
const songTitleSchema = z.object({
  title: z.string(),
  titleLanguage: z.string().optional(),
  language: z
    .union([z.string(), z.array(z.string()).min(1)])
    .transform((language) => (Array.isArray(language) ? language : [language])),
  en: localeTitleSchema,
  ru: localeTitleSchema,
});

type SongTitle = z.infer<typeof songTitleSchema>;

type LocaleTitle = NonNullable<SongTitle['en']>['title'];

function titleLanguageFindings(
  { title, titleLanguage, language }: SongTitle,
  keys: string[],
): string[] {
  const [sung, ...others] = language;
  const single = others.length === 0 && sung !== 'instrumental';
  // A title romanized from the one language sung — `Mithqāl` — is the case
  // that keeps a `titleLanguage` equal to it.
  const inSungScript = single && (SCRIPTS[sung ?? ''] ?? LATIN).test(title);

  if (titleLanguage === undefined) {
    if (!single)
      return [
        `${sung === 'instrumental' ? 'an instrumental' : `sung in ${language.join(', ')}`}: say which language the title is in with \`titleLanguage\``,
      ];
    return inSungScript
      ? []
      : [
          `the title has no letter of ${sung ?? ''}'s script: say which language it is in with \`titleLanguage\``,
        ];
  }

  return [
    ...(inSungScript && titleLanguage === sung
      ? [
          `\`titleLanguage: ${titleLanguage}\` is the only language sung: drop it`,
        ]
      : []),
    ...(keys[keys.indexOf('title') + 1] === 'titleLanguage'
      ? []
      : ['`titleLanguage` goes right under `title`']),
  ];
}

function missingTranslation(
  locale: 'en' | 'ru',
  localeTitle: LocaleTitle,
): string[] {
  return typeof localeTitle === 'string' ||
    localeTitle?.translation !== undefined
    ? []
    : [`\`${locale}.title.translation\` is missing`];
}

function glossFindings({
  title,
  titleLanguage,
  language,
  en,
  ru,
}: SongTitle): string[] {
  const titledIn = titleLanguage ?? language[0];
  // A title with no letter in it — `8849` — reads the same in every language.
  if (titledIn === 'instrumental' || !/\p{L}/u.test(title)) return [];

  return [
    ...(titledIn === 'en' ? [] : missingTranslation('en', en?.title)),
    ...(titledIn === 'ru' ? [] : missingTranslation('ru', ru?.title)),
  ];
}

const findings = songFiles().flatMap((file) => {
  const { data } = matter(fs.readFileSync(file, 'utf8'));
  const song = songTitleSchema.parse(data);
  return [
    ...titleLanguageFindings(song, Object.keys(data)),
    ...glossFindings(song),
  ].map((finding) => `${file}: ${finding}`);
});

if (findings.length > 0) {
  process.stdout.write(
    `song-titles: ${findings.length} finding(s):\n\n${findings.join('\n')}\n`,
  );
  process.exit(1);
}

process.stdout.write('song-titles: clean\n');
