import 'server-only';

import { caseFrontmatterSchema } from './basilisk-frontmatter';
import type { CollectionId } from './collections';
import {
  type ArticleFrontmatter,
  articleFrontmatterSchema,
  type Collection,
  type SongFrontmatter,
  songFrontmatterSchema,
} from './frontmatter';

/**
 * The collections one article page serves. Keyed by id so a router can name
 * its collection and still be handed the schema that reads it.
 */
export const ARTICLE_COLLECTIONS = {
  'case-studies': { id: 'case-studies', schema: articleFrontmatterSchema },
  bible: { id: 'bible', schema: articleFrontmatterSchema },
  'basilisk-cases': { id: 'basilisk-cases', schema: caseFrontmatterSchema },
  'basilisk-faq': { id: 'basilisk-faq', schema: articleFrontmatterSchema },
} as const satisfies Record<string, Collection<ArticleFrontmatter>>;

export type ArticleCollectionId = keyof typeof ARTICLE_COLLECTIONS;

/** The frontmatter one article collection reads into — wider than the article's where the collection extends it. */
export type ArticleFrontmatterOf<C extends ArticleCollectionId> = ReturnType<
  (typeof ARTICLE_COLLECTIONS)[C]['schema']['parse']
>;

export const SONGS: Collection<SongFrontmatter> = {
  id: 'music',
  schema: songFrontmatterSchema,
};

/** Keyed so a collection without a schema fails to compile rather than at read time. */
export const COLLECTION_SCHEMAS = {
  ...ARTICLE_COLLECTIONS,
  music: SONGS,
} as const satisfies Record<CollectionId, Collection>;
