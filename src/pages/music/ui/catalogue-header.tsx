import { Box, Text, Title } from '@mantine/core';

import type { Titled, WithOptionalChildren } from '@/shared/typings';

export type CatalogueHeaderProps = Titled &
  WithOptionalChildren & {
    /** What the page is of — “Artist”, “Album” — above its name. */
    kind: string;
  };

/** An artist's or an album's name, what it is, and the line under it. */
export function CatalogueHeader({
  kind,
  title,
  children,
}: CatalogueHeaderProps) {
  return (
    <Box component="header">
      <Text size="xs" tt="uppercase" opacity={0.6} mb={6} lts="0.06em">
        {kind}
      </Text>
      <Title order={1}>{title}</Title>
      {children}
    </Box>
  );
}
