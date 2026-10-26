import { Group, Stack, Text, Title } from '@mantine/core';
import Image from 'next/image';

import { SITE_CONFIG } from '@/kernel/shared/config';
import { cx } from '@/kernel/shared/lib/class-names';

import { Card, NameLink, TextLink } from '@/shell/shared/ui';

import {
  type ArticleFrontmatter,
  type DocumentCard,
  documentRoute,
  type WithCollectionId,
<<<<<<< HEAD:src/blog/entities/document/ui/document-cards.tsx
} from '@/blog/shared/content';
import { messages } from '@/blog/shared/i18n';
=======
} from '@/shared/content';
import { loadMessages, type WithOptionalLocale } from '@/shared/i18n';
import { cx } from '@/shared/lib/class-names';
import { Card, NameLink, TextLink } from '@/shared/ui';
>>>>>>> origin/main:src/entities/document/ui/document-cards.tsx

import classes from './document-cards.module.scss';
import { DocumentMeta } from './document-meta';

type DocumentCardsProps = WithCollectionId &
  WithOptionalLocale & {
    cards: Array<DocumentCard<ArticleFrontmatter>>;
  };

/**
 * A collection's documents as a list of cards — the drawing, the byline, the
 * blurb and the links to every cut. The collection's index and the Bible's
 * home page both render it, differing only in the copy above it.
 */
<<<<<<< HEAD:src/blog/entities/document/ui/document-cards.tsx
export function DocumentCards({ collection, cards }: DocumentCardsProps) {
  const copy = messages(SITE_CONFIG.locale);
=======
export function DocumentCards({
  collection,
  cards,
  locale = SITE_CONFIG.locale,
}: DocumentCardsProps) {
  const copy = loadMessages(locale).documents;
>>>>>>> origin/main:src/entities/document/ui/document-cards.tsx

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
                  <NameLink href={route}>{title}</NameLink>
                </Title>
                <DocumentMeta
                  {...{ frontmatter, readingMinutes, locale }}
                  className={classes['cardMeta']}
                />
                <Text lh={1.625} mb={16}>
                  {frontmatter.description}
                </Text>
                <Group component="p" gap={12} wrap="wrap" fz="sm">
                  <TextLink href={route}>{copy.read}</TextLink>
                  {variants.map((variant) => (
                    <TextLink
                      key={variant}
                      href={documentRoute(collection, slug, variant)}
                      className={classes['variantLink']}
                    >
                      {copy.version.replace('{variant}', variant)}
                    </TextLink>
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
