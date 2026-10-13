import { Box, Group, Stack, Text, Title } from '@mantine/core';

import type { TitleGloss } from '@/shared/music-catalogue';
import type { Titled, WithOptionalChildren } from '@/shared/typings';
import { FileLink } from '@/shared/ui';

import type { CatalogueText } from '../lib/catalogue-text';
import { CoverHead, type CoverHeadProps } from './cover-head';
import { FactLine } from './fact-line';
import { TitleGlossLine } from './title-gloss-line';
import { WipMark } from './wip-mark';

export type CatalogueHeaderProps = Titled &
  WithOptionalChildren &
  Pick<CoverHeadProps, 'picture'> &
  Partial<Pick<CatalogueText, 'markdown'>> & {
    /** What the page is of — “Artist”, “Album” — above its name. */
    kind: string;
    gloss: TitleGloss;
    /** On the line across the header's foot, under the name and its art both. */
    size: readonly string[];
    /** Why the release may still change, shown on the mark beside its kind. */
    wip?: string;
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
        <CoverHead {...{ picture }}>
          <div>
            <Group gap={8} mb={6}>
              <Text size="xs" tt="uppercase" opacity={0.6} lts="0.06em">
                {kind}
              </Text>
              {wip !== undefined && <WipMark note={wip} />}
            </Group>
            <Title order={1}>{title}</Title>
            <TitleGlossLine {...{ gloss }} mt={8} />
            {children}
          </div>
        </CoverHead>

        {/* The page's own file at the line's far end, as a song page sets its
            facts. */}
        <Group justify="space-between" gap="12px 32px" wrap="wrap">
          <FactLine facts={size} fz="sm" opacity={0.55} />
          {markdown && <FileLink {...markdown}>.md</FileLink>}
        </Group>
      </Stack>
    </Box>
  );
}
