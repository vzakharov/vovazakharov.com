import { Box, Stack, Text, Title } from '@mantine/core';

import { SITE_CONFIG } from '@/shared/config/index.server-only';
import {
  collectionRoute,
  COLLECTIONS,
  renderPrimaryDocuments,
} from '@/shared/content';
import { constructMetadata } from '@/shared/seo/index.server-only';
import { BackToHome, PageShell } from '@/shared/ui';

import { DocumentCards } from '@/entities/document';

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

          <DocumentCards {...{ collection, cards }} />

          <BackToHome />
        </Stack>
      </PageShell>
    );
  }

  return { metadata, Page };
}
