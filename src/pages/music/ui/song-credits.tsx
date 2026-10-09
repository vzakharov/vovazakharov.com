import { Stack, Text } from '@mantine/core';

import { loadMessages, type WithLocale } from '@/shared/i18n';
import type { SongFrontmatter } from '@/shared/song';

export type SongCreditsProps = WithLocale & Pick<SongFrontmatter, 'credits'>;

const CREDIT_ROLES = ['music', 'lyrics'] as const satisfies ReadonlyArray<
  keyof NonNullable<SongFrontmatter['credits']>
>;

/**
 * Who wrote what, a line per role under the words. A role the frontmatter does
 * not credit is the author's alone and goes unsaid, so a song of his own shows
 * nothing here.
 */
export function SongCredits({ credits, locale }: SongCreditsProps) {
  const labels = loadMessages(locale).music.credits;
  const lines = CREDIT_ROLES.flatMap((role) => {
    const people = credits?.[role];

    return people === undefined
      ? []
      : [`${labels[role]}: ${people.map((name) => name[locale]).join(', ')}`];
  });

  if (lines.length === 0) return null;

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
