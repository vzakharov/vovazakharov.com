import { Box, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';

import type { TitleGloss } from '@/shared/music-catalogue';
import type { Spelled } from '@/shared/music-catalogue/index.node-safe';
import type { WithOptionalChildren } from '@/shared/typings';

import { CoverHead, type CoverHeadProps } from './cover-head';
import { Spelling } from './spelling';
import { TitleGlossLine } from './title-gloss-line';

export type CatalogueHeaderProps = WithOptionalChildren &
  Pick<CoverHeadProps, 'picture'> & {
    /** What the page is of — “Artist”, “Album” — above its name. */
    kind: string;
    title: Spelled;
    gloss: TitleGloss | undefined;
    /** The line across the header's foot, under the name and its art both. */
    facts?: ReactNode;
  };

/** An artist's or an album's name, what it is, and the lines under it. */
export function CatalogueHeader({
  kind,
  title,
  gloss,
  picture,
  facts,
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
            <Title order={1}>
              <Spelling {...title} />
            </Title>
            <TitleGlossLine {...{ gloss }} mt={8} />
            {children}
          </div>
        </CoverHead>

        {facts}
      </Stack>
    </Box>
  );
}
