import { Box, Stack, Text, Title } from '@mantine/core';
import Image from 'next/image';
import type { ReactNode } from 'react';

import { cx } from '@/shared/lib/class-names';
import type { TitleGloss } from '@/shared/music-catalogue';
import type { Titled, WithOptionalChildren } from '@/shared/typings';

import classes from './music.module.scss';
import { TitleGlossLine } from './title-gloss-line';

export type CatalogueHeaderProps = Titled &
  WithOptionalChildren & {
    /** What the page is of — “Artist”, “Album” — above its name. */
    kind: string;
    gloss: TitleGloss;
    /** Art set beside the name, as a song page sets its cover. */
    picture?: string;
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
        <div className={classes['songHead']}>
          {picture !== undefined && (
            <div
              className={cx(classes['tileArt'], classes['songCover'])}
              aria-hidden
            >
              <Image
                src={picture}
                alt=""
                width={600}
                height={600}
                sizes="200px"
                priority
              />
            </div>
          )}

          <div>
            <Text size="xs" tt="uppercase" opacity={0.6} mb={6} lts="0.06em">
              {kind}
            </Text>
            <Title order={1}>{title}</Title>
            <TitleGlossLine {...{ gloss }} mt={8} />
            {children}
          </div>
        </div>

        {facts}
      </Stack>
    </Box>
  );
}
