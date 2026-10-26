import { Box, Group, Stack, Text, Title } from '@mantine/core';

import { FileLink } from '@/shell/shared/ui';

import type { ServedMarkdown } from '@/blog/shared/content';

import type { Glossed } from '@/music/shared/catalogue';
import type { WithSpelledTitle } from '@/music/shared/catalogue/index.node-safe';
import {
  SizeLine,
  Spelling,
  TitleGlossLine,
  WipMark,
  type WipNoted,
} from '@/music/shared/ui';
import { CoverHead, type CoverHeadBody } from '@/music/entities/cover';

export type CatalogueHeaderProps = CoverHeadBody &
  Partial<ServedMarkdown> &
  WipNoted &
  WithSpelledTitle &
  Glossed & {
    /** What the page is of — “Artist”, “Album” — above its name. */
    kind: string;
    /** On the line across the header's foot, under the name and its art both. */
    size: readonly string[];
  };

/** An artist's or an album's name, what it is, and the lines under it. */
export function CatalogueHeader({
  kind,
  title,
  gloss,
  picture,
  markdown,
  size,
  wip,
  children,
}: CatalogueHeaderProps) {
  return (
    <Box component="header">
      <Stack gap={24}>
        <CoverHead
          {...{ picture }}
          kicker={
            <Group gap={8}>
              <Text size="xs" tt="uppercase" opacity={0.6} lts="0.06em">
                {kind}
              </Text>
              {wip !== undefined && <WipMark note={wip} />}
            </Group>
          }
        >
          <div>
            <Title order={1}>
              <Spelling {...title} />
            </Title>
            <TitleGlossLine {...{ gloss }} mt={8} />
            {children}
          </div>
        </CoverHead>

        {/* The page's own file at the line's far end, as a song page sets its
            facts. */}
        <Group justify="space-between" gap="12px 32px" wrap="wrap">
          <SizeLine {...{ size }} />
          {markdown && <FileLink {...markdown}>.md</FileLink>}
        </Group>
      </Stack>
    </Box>
  );
}
