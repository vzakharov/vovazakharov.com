import { Text, type TextProps } from '@mantine/core';

import type { Glossed } from '@/music/shared/catalogue';

/** The muted line under a title the reader may not understand: what it means. */
export function TitleGlossLine({ gloss, mt }: Pick<TextProps, 'mt'> & Glossed) {
  if (gloss === undefined) return null;

  return (
    <Text size="md" opacity={0.55} {...{ mt }}>
      {gloss.translation}
    </Text>
  );
}
