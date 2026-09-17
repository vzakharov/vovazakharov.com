import { Box, Group, Stack, Text, Title } from '@mantine/core';
import Image from 'next/image';

import { SITE_CONFIG } from '@/shared/config/index.server-only';
import {
  type CollectionId,
  collectionRoute,
  COLLECTIONS,
  documentRoute,
  renderPrimaryDocuments,
} from '@/shared/content';
import { cx } from '@/shared/lib/class-names';
import { constructMetadata } from '@/shared/seo/index.server-only';
import { BackToHome, Card, InternalLink, PageShell } from '@/shared/ui';

import { COLLECTION_INTROS } from './collection-intros';
import { DocumentMeta } from './document-meta';
import classes from './documents.module.scss';

/**
 * One collection's index, as the two exports Next reads off a route module.
 * The same factory shape as `articleRoute`, and for the same reason: which
 * collection is listed is the router's to say.
 */
export function collectionIndexRoute(collection: CollectionId) {
  const { description, intro } = COLLECTION_INTROS[collection];

  const metadata = constructMetadata({
    title: `${COLLECTIONS[collection].label} - ${SITE_CONFIG.name}`,
    description,
    path: collectionRoute(collection),
  });

  async function Page() {
    const cards = await renderPrimaryDocuments(collection);

    return (
      <PageShell>
        <Stack gap={48}>
          <Box component="header">
            <Stack gap={16}>
              <Title order={1}>{collectionRoute(collection)}</Title>
              <Text size="lg" opacity={0.8}>
                {description}
              </Text>
              {intro}
            </Stack>
          </Box>

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
                        <InternalLink href={route} underline="hover" inherit>
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
                        <InternalLink href={route} inherit>
                          Read
                        </InternalLink>
                        {variants.map((variant) => (
                          <InternalLink
                            key={variant}
                            href={documentRoute(collection, slug, variant)}
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

          <BackToHome />
        </Stack>
      </PageShell>
    );
  }

  return { metadata, Page };
}
