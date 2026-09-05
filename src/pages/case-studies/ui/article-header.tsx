import { Anchor, Box, Group, Stack, Text, Title } from '@mantine/core';
import { FileDown, FileText } from 'lucide-react';

import {
  type DocumentRef,
  documentRoute,
  type Headlined,
  type Variant,
  VARIANTS,
  type WithContentDocument,
} from '@/shared/content';
import { cx } from '@/shared/lib/class-names';
import { InternalLink } from '@/shared/ui';

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

  return (
    <Group component="nav" gap={8} wrap="wrap" fz="sm" className="print-hidden">
      {cuts.map((cut) => {
        const label = CUT_LABELS[cut ?? 'full'];

        return cut === current ? (
          <Box
            key={label}
            component="span"
            aria-current="page"
            className={cx(classes['cut'], classes['cutCurrent'])}
          >
            {label}
          </Box>
        ) : (
          <InternalLink
            key={label}
            href={documentRoute(collection, slug, cut)}
            underline="never"
            c="inherit"
            className={cx(classes['cut'], classes['cutLink'])}
          >
            {label}
          </InternalLink>
        );
      })}
    </Group>
  );
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
  const {
    frontmatter,
    collection,
    slug,
    variant,
    rawUrl,
    pdfUrl,
    downloadName,
  } = document;

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

          {/*
            The document's own two files, each served straight out of
            `public/` at this page's URL plus an extension. Only the markdown
            carries `download`: on the PDF the attribute would replace the
            browser's inline viewer with a forced save, and the PDF names its
            origin in its own footer.
          */}
          <Group gap={16} wrap="wrap">
            <Anchor
              href={rawUrl}
              download={downloadName}
              size="sm"
              className={cx('print-hidden', classes['hoverDim'])}
            >
              <Group component="span" gap={6} wrap="nowrap">
                <FileText size={16} aria-hidden />
                Markdown
              </Group>
            </Anchor>

            <Anchor
              href={pdfUrl}
              size="sm"
              className={cx('print-hidden', classes['hoverDim'])}
            >
              <Group component="span" gap={6} wrap="nowrap">
                <FileDown size={16} aria-hidden />
                PDF
              </Group>
            </Anchor>
          </Group>
        </Group>
      </Stack>
    </Box>
  );
}
