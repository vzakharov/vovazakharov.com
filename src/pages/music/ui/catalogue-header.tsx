import { Box, Group, Stack, Text, Title } from '@mantine/core';

import type { TitleGloss } from '@/shared/music-catalogue';
import type { Titled, WithOptionalChildren } from '@/shared/typings';
import { FileLink } from '@/shared/ui';

import type { CatalogueText } from '../lib/catalogue-text';
import { CoverHead, type CoverHeadProps } from './cover-head';
import { TitleGlossLine } from './title-gloss-line';

export type CatalogueHeaderProps = Titled &
  WithOptionalChildren &
  Pick<CoverHeadProps, 'picture'> &
  Partial<Pick<CatalogueText, 'markdown'>> & {
    /** What the page is of — “Artist”, “Album” — above its name. */
    kind: string;
    gloss: TitleGloss;
    /** What the page holds, across the header's foot under the name and its art both. */
    size: string;
  };

/** An artist's or an album's name, what it is, and the lines under it. */
export function CatalogueHeader({
  kind,
  title,
  gloss,
  picture,
  markdown,
  size,
  children,
}: CatalogueHeaderProps) {
  return (
    <Box component="header">
      <Stack gap={24}>
        <CoverHead {...{ picture }}>
          <div>
            <Text size="xs" tt="uppercase" opacity={0.6} mb={6} lts="0.06em">
              {kind}
            </Text>
            <Title order={1}>{title}</Title>
            <TitleGlossLine {...{ gloss }} mt={8} />
            {children}
          </div>
        </CoverHead>

        {/* The page's own file at the far end of the size's line, as a song
            page sets its facts. */}
        <Group justify="space-between" gap="12px 32px" wrap="wrap">
          <Text size="sm" opacity={0.7}>
            {size}
          </Text>
          {markdown && <FileLink {...markdown}>.md</FileLink>}
        </Group>
      </Stack>
    </Box>
  );
}
