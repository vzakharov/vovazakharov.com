import { Box, Group, Stack, Text, Title } from '@mantine/core';

import {
  type DocumentRef,
  documentRoute,
  type Headlined,
  type Variant,
  VARIANTS,
  type WithContentDocument,
} from '@/shared/content';
import { type Chip, ChipNav, FileLink } from '@/shared/ui';

import classes from './case-studies.module.scss';
import { DocumentMeta } from './document-meta';

/** How each cut is offered to the reader. `undefined` is the full document. */
const CUT_LABELS: Record<Variant | 'full', string> = {
  full: 'Full',
  mini: 'Mini',
  nano: 'Nano',
};

type CutSwitcherProps = DocumentRef & {
  current?: Variant;
  available: Variant[];
};

function CutSwitcher({
  collection,
  slug,
  current,
  available,
}: CutSwitcherProps) {
  const cuts: Array<Variant | undefined> = [
    undefined,
    ...VARIANTS.filter((variant) => available.includes(variant)),
  ];

  const chips = cuts.map(
    (cut): Chip => ({
      label: CUT_LABELS[cut ?? 'full'],
      href: documentRoute(collection, slug, cut),
      current: cut === current,
    }),
  );

  return <ChipNav {...{ chips }} />;
}

export type ArticleHeaderProps = WithContentDocument &
  Headlined & {
    availableVariants: Variant[];
  };

export function ArticleHeader({
  document,
  title,
  readingMinutes,
  availableVariants,
}: ArticleHeaderProps) {
  const { frontmatter, collection, slug, variant, markdown, pdf } = document;

  return (
    <Box component="header" className={classes['articleHeader']}>
      <Stack gap={24}>
        <Stack gap={12}>
          <Title order={1} className={classes['articleTitle']}>
            {title}
          </Title>
          <Text size="lg" lh={1.625} opacity={0.8}>
            {frontmatter.description}
          </Text>
        </Stack>

        <DocumentMeta {...{ frontmatter, readingMinutes }} />

        <Group justify="space-between" gap={16} wrap="wrap">
          <CutSwitcher
            {...{ collection, slug }}
            current={variant}
            available={availableVariants}
          />

          <Group gap={16} wrap="wrap">
            <FileLink {...markdown}>.md</FileLink>
            <FileLink {...pdf}>.pdf</FileLink>
          </Group>
        </Group>
      </Stack>
    </Box>
  );
}
