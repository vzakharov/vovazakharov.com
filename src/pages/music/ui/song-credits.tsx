import { Stack, Text } from '@mantine/core';

import { loadMessages, type WithLocale } from '@/shared/i18n';
import {
  type CreditedName,
  SONG_AUTHOR,
  type SongFrontmatter,
} from '@/shared/song';

export type SongCreditsProps = WithLocale &
  Pick<SongFrontmatter, 'credits' | 'language'>;

/**
 * Who wrote what, under the words: music, then lyrics — one line for both when
 * the same people wrote both. A role the frontmatter does not credit is the
 * author's, and an instrumental has no lyrics to credit.
 */
export function SongCredits({ credits, language, locale }: SongCreditsProps) {
  const labels = loadMessages(locale).music.credits;
  const names = (people: CreditedName[] = [SONG_AUTHOR]) =>
    people.map((person) => person[locale]).join(', ');

  const music = names(credits?.music);
  const lyrics = language.includes('instrumental')
    ? undefined
    : names(credits?.lyrics);

  const lines =
    lyrics === undefined
      ? [`${labels.music}: ${music}`]
      : music === lyrics
        ? [`${labels.musicAndLyrics}: ${music}`]
        : [`${labels.music}: ${music}`, `${labels.lyrics}: ${lyrics}`];

  return (
    <Stack gap={4}>
      {lines.map((line) => (
        <Text key={line} size="sm" opacity={0.7}>
          {line}
        </Text>
      ))}
    </Stack>
  );
}
