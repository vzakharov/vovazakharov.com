import { Group, type GroupProps, Text } from '@mantine/core';

import type { TitleGloss } from '@/shared/song';

/**
 * The muted line under a title the reader may not read: what it means, then,
 * smaller and on its baseline, how it sounds — Night Garden _Nochnoy sad_. The
 * baseline rather than the centre, because a centred line sits by the boxes'
 * middles and the two sizes' letters land visibly off one another.
 */
export function TitleGlossLine({
  gloss: { transliteration, translation },
  mt,
}: Pick<GroupProps, 'mt'> & { gloss: TitleGloss }) {
  if (transliteration === undefined && translation === undefined) return null;

  return (
    <Group gap="4px 10px" align="baseline" opacity={0.55} {...{ mt }}>
      {translation !== undefined && <Text size="md">{translation}</Text>}
      {transliteration !== undefined && (
        <Text size="xs" opacity={0.75} fs="italic">
          {transliteration}
        </Text>
      )}
    </Group>
  );
}
