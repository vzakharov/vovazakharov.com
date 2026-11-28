import { Box, Stack, Text, Title } from '@mantine/core';

import { SITE_CONFIG } from '@/kernel/shared/config';

import { PageShell } from '@/shell/shared/ui';
import { SiteFooter } from '@/shell/widgets/site-footer';

import {
  articleCollection,
  collectionRoute,
  COLLECTIONS,
  renderPrimaryDocuments,
} from '@/blog/shared/content';
import { constructMetadata } from '@/blog/shared/seo';
import { DocumentCards } from '@/blog/entities/document';

import {
  COLLECTION_INTROS,
  type IndexedCollectionId,
} from './collection-intros';

/**
 * One collection's index, as the two exports Next reads off a route module.
 * The same factory shape as `articleRoute`, and for the same reason: which
 * collection is listed is the router's to say.
 */
export function collectionIndexRoute(collection: IndexedCollectionId) {
  const { description, intro } = COLLECTION_INTROS[collection];

  const metadata = constructMetadata({
    title: `${COLLECTIONS[collection].label} - ${SITE_CONFIG.name}`,
    description,
    path: collectionRoute(collection),
  });

  async function Page() {
    const cards = await renderPrimaryDocuments(articleCollection(collection));

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

          <DocumentCards {...{ collection, cards }} />

          <SiteFooter />
        </Stack>
      </PageShell>
    );
  }

  return { metadata, Page };
}
