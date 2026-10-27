import { Box, Group, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';

import { pageFile, SITE_CONFIG } from '@/kernel/shared/config';
import type { WithLocale } from '@/kernel/shared/i18n';

import { type Chip, ChipNav, FileLink, localeChips } from '@/shell/shared/ui';

import {
  type ArticleFrontmatter,
  COLLECTIONS,
  type DocumentRef,
  documentRoute,
  type Headlined,
  type Variant,
  VARIANTS,
  type WithContentDocument,
} from '@/blog/shared/content';
import { messages } from '@/blog/shared/i18n';
import { DocumentMeta } from '@/blog/entities/document';

import classes from './documents.module.scss';

type CutSwitcherProps = DocumentRef &
  WithLocale & {
    current?: Variant;
    available: Variant[];
  };

function CutSwitcher({
  collection,
  slug,
  current,
  available,
  locale,
}: CutSwitcherProps) {
  const cuts: Array<Variant | undefined> = [
    undefined,
    ...VARIANTS.filter((variant) => available.includes(variant)),
  ];

  // `undefined` is the full document.
  const labels = messages(locale).cuts;
  const chips = cuts.map(
    (cut): Chip => ({
      label: labels[cut ?? 'full'],
      href: documentRoute(collection, slug, cut),
      current: cut === current,
    }),
  );

  return <ChipNav {...{ chips }} />;
}

export type ArticleHeaderProps = WithContentDocument<ArticleFrontmatter> &
  Headlined & {
    availableVariants: Variant[];
    eyebrow?: ReactNode;
    mark?: ReactNode;
  };

export function ArticleHeader({
  document,
  title,
  readingMinutes,
  availableVariants,
  eyebrow,
  mark,
}: ArticleHeaderProps) {
  const { frontmatter, collection, slug, variant, markdown, route } = document;
  const locale = document.locale ?? SITE_CONFIG.locale;

  const lede = (
    <Text size="lg" lh={1.625} opacity={0.8}>
      {frontmatter.description}
    </Text>
  );

  return (
    <Box component="header" className={classes['articleHeader']}>
      <Stack gap={24}>
        <Stack gap={12}>
          {eyebrow}
          <Title order={1} className={classes['articleTitle']}>
            {title}
          </Title>
          {mark === undefined ? (
            lede
          ) : (
            <div className={classes['marked']}>
              {lede}
              {mark}
            </div>
          )}
        </Stack>

        <DocumentMeta
          {...{ frontmatter, collection, readingMinutes, locale }}
        />

        {/*
          With no cuts the switcher would be one chip reading "Full", offering
          the page the reader is already on. The empty group holds its place so
          the file links stay right-aligned.
        */}
        <Group justify="space-between" gap={16} wrap="wrap">
          <Group gap={16} wrap="wrap">
            {document.locale !== undefined && (
              <ChipNav
                chips={localeChips(document.locale, (alternate) =>
                  documentRoute(collection, slug, variant, alternate),
                )}
              />
            )}
            {availableVariants.length > 0 && (
              <CutSwitcher
                {...{ collection, slug, locale }}
                current={variant}
                available={availableVariants}
              />
            )}
          </Group>

          <Group gap={16} wrap="wrap">
            <FileLink {...markdown}>.md</FileLink>
            {COLLECTIONS[collection].printable && (
              <FileLink {...pageFile(route, 'pdf')}>.pdf</FileLink>
            )}
          </Group>
        </Group>
      </Stack>
    </Box>
  );
}
