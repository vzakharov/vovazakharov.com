import { Box, Text, Title } from '@mantine/core';

import type { TitleGloss } from '@/shared/song';
import type { Titled, WithOptionalChildren } from '@/shared/typings';

import { TitleGlossLine } from './title-gloss-line';

export type CatalogueHeaderProps = Titled &
  WithOptionalChildren & {
    /** What the page is of — “Artist”, “Album” — above its name. */
    kind: string;
    gloss: TitleGloss;
  };

/** An artist's or an album's name, what it is, and the line under it. */
export function CatalogueHeader({
  kind,
  title,
  gloss,
  children,
}: CatalogueHeaderProps) {
  return (
    <Box component="header">
      <Text size="xs" tt="uppercase" opacity={0.6} mb={6} lts="0.06em">
        {kind}
      </Text>
      <Title order={1}>{title}</Title>
      <TitleGlossLine {...{ gloss }} mt={8} />
      {children}
    </Box>
  );
}
