import { Anchor, Box, Group, Stack, Text, Title } from '@mantine/core';

import {
  type DocumentFile,
  type DocumentRef,
  documentRoute,
  type Headlined,
  type Variant,
  VARIANTS,
  type WithContentDocument,
} from '@/shared/content';
import { cx } from '@/shared/lib/class-names';
import type { WithChildren } from '@/shared/typings';
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

type FileLinkProps = DocumentFile & WithChildren;

/**
 * One of the document's own files, served at this page's URL plus an extension.
 * Both carry `download`, so either lands under the document's own name rather
 * than opening over the article the reader is in.
 */
function FileLink({ href, download, children }: FileLinkProps) {
  return (
    <Anchor
      {...{ href, download }}
      size="sm"
      className={cx('print-hidden', classes['hoverDim'])}
    >
      {children}
    </Anchor>
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
