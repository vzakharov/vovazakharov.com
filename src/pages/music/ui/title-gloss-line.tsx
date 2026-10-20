import { Text, type TextProps } from '@mantine/core';

import type { TitleGloss } from '@/shared/music-catalogue';

/** The muted line under a title the reader may not understand: what it means. */
export function TitleGlossLine({
  gloss,
  mt,
}: Pick<TextProps, 'mt'> & { gloss: TitleGloss | undefined }) {
  if (gloss === undefined) return null;

  return (
    <Text size="md" opacity={0.55} {...{ mt }}>
      {gloss.translation}
    </Text>
  );
}
