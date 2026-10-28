import { Stack, Text } from '@mantine/core';

import type { WithLocale } from '@/kernel/shared/i18n';

import type { CreditedSong } from '@/music/shared/catalogue';
import {
  type CreditedName,
  SONG_AUTHOR,
} from '@/music/shared/catalogue/index.node-safe';
import { messages } from '@/music/shared/i18n';

export type SongCreditsProps = WithLocale & CreditedSong;

/**
 * Who wrote what, under the words: music, then lyrics — one line for both when
 * the same people wrote both. A role the frontmatter does not credit is the
 * author's, and an instrumental has no lyrics to credit.
 */
export function SongCredits({ credits, language, locale }: SongCreditsProps) {
  const labels = messages(locale).credits;
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
