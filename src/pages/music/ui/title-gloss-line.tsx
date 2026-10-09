import { Group, type GroupProps, Text } from '@mantine/core';

import type { TitleGloss } from '@/shared/song';

/**
 * The muted line under a title the reader may not read: what it means, then,
 * smaller and centred on it, how it sounds — Night Garden _Nochnoy sad_.
 */
export function TitleGlossLine({
  gloss: { transliteration, translation },
  mt,
}: Pick<GroupProps, 'mt'> & { gloss: TitleGloss }) {
  if (transliteration === undefined && translation === undefined) return null;

  return (
    <Group gap="4px 10px" align="center" opacity={0.55} {...{ mt }}>
      {translation !== undefined && <Text size="md">{translation}</Text>}
      {transliteration !== undefined && (
        <Text size="xs" opacity={0.75} fs="italic">
          {transliteration}
        </Text>
      )}
    </Group>
  );
}
