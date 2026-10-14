import { Box, Group, Stack, Text, Title } from '@mantine/core';

import type { ServedMarkdown } from '@/shared/content';
import type { TitleGloss } from '@/shared/music-catalogue';
import type { Spelled } from '@/shared/music-catalogue/index.node-safe';
import { FileLink } from '@/shared/ui';

import { CoverHead, type CoverHeadBody } from './cover-head';
import { SizeLine } from './fact-line';
import { Spelling } from './spelling';
import { TitleGlossLine } from './title-gloss-line';
import { WipMark, type WipNoted } from './wip-mark';

export type CatalogueHeaderProps = CoverHeadBody &
  Partial<ServedMarkdown> &
  WipNoted & {
    /** What the page is of — “Artist”, “Album” — above its name. */
    kind: string;
    title: Spelled;
    gloss: TitleGloss | undefined;
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
