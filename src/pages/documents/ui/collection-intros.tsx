import type { ReactNode } from 'react';

import type { ArticleCollectionId } from '@/shared/content';
import type { Described } from '@/shared/typings';

/** The line that is both a collection index's meta description and its lede, and the prose under it where one line is not enough. */
type CollectionIntro = Described & { intro?: ReactNode };

/**
 * Narrows the keys while widening the values: `satisfies` would keep each
 * entry's own literal shape, so an entry that writes no `intro` would have no
 * such property to read.
 */
function introRegistry<Id extends ArticleCollectionId>(
  entries: Record<Id, CollectionIntro>,
): Record<Id, CollectionIntro> {
  return entries;
}

/**
 * What a collection's index says for itself. Here rather than in the content
 * registry, which shapes routes and runs under bare Node in the render
 * scripts.
 *
 * A rooted collection is absent: its site's home page is its index, so there
 * is no index route here to feed.
 */
export const COLLECTION_INTROS = introRegistry({
  'case-studies': {
    description:
      'Long-form write-ups of work I have shipped, with the numbers behind them.',
  },
});

/** A collection with an index page of its own — the registry's keys, so the two cannot drift. */
export type IndexedCollectionId = keyof typeof COLLECTION_INTROS;
