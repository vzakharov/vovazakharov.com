import { Group, Stack, Text, Title } from '@mantine/core';
import Image from 'next/image';

import { linkTo } from '@/shared/config/index.server-only';
import {
  type DocumentCard,
  documentRoute,
  type WithCollectionId,
} from '@/shared/content';
import { cx } from '@/shared/lib/class-names';
import { Card, DocumentMeta, InternalLink } from '@/shared/ui';

import classes from './document-cards.module.scss';

type DocumentCardsProps = WithCollectionId & {
  cards: DocumentCard[];
};

/**
 * A collection's documents as a list of cards — the drawing, the byline, the
 * blurb and the links to every cut. A widget rather than a page component
 * because the collection's index and the Bible's home page both render it,
 * differing only in the copy above it, and two page slices may not reach each
 * other sideways.
 */
export function DocumentCards({ collection, cards }: DocumentCardsProps) {
  return (
    <Stack gap={24}>
      {cards.map(({ document, rendered, variants }, index) => {
        const { frontmatter, slug, route, cardImage } = document;
        const { title, readingMinutes } = rendered;

        return (
          <Card key={slug}>
            <div
              className={cx(
                classes['cardLayout'],
                index % 2 === 1 && classes['cardLayoutFlipped'],
              )}
            >
              {cardImage && (
                <Image
                  {...cardImage}
                  alt=""
                  aria-hidden
                  className={classes['cardImage']}
                />
              )}
              <div>
                <Title order={2} size="h3" mb={8}>
                  <InternalLink {...linkTo(route)} underline="hover" inherit>
                    {title}
                  </InternalLink>
                </Title>
                <DocumentMeta
                  {...{ frontmatter, readingMinutes }}
                  className={classes['cardMeta']}
                />
                <Text lh={1.625} mb={16}>
                  {frontmatter.description}
                </Text>
                <Group component="p" gap={12} wrap="wrap" fz="sm">
                  <InternalLink {...linkTo(route)} inherit>
                    Read
                  </InternalLink>
                  {variants.map((variant) => (
                    <InternalLink
                      key={variant}
                      {...linkTo(documentRoute(collection, slug, variant))}
                      className={classes['variantLink']}
                      inherit
                    >
                      {variant} version
                    </InternalLink>
                  ))}
                </Group>
              </div>
            </div>
          </Card>
        );
      })}
    </Stack>
  );
}
