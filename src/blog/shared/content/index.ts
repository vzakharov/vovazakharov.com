<<<<<<< HEAD:src/blog/shared/content/index.ts
export { AUTHORS } from './authors';
=======
export { author } from './authors';
export { type CaseFrontmatter, type Docketed } from './basilisk-frontmatter';
export {
  ARTICLE_COLLECTIONS,
  type ArticleCollectionId,
  type ArticleFrontmatterOf,
  SONGS,
} from './collection-schemas';
>>>>>>> origin/main:src/shared/content/index.ts
export {
  type CollectionId,
  collectionListingRoute,
  collectionRoute,
  COLLECTIONS,
  collectionsForSite,
  documentName,
  type DocumentRef,
  documentRoute,
  FEATURED_CASE_STUDY_ROUTE,
  isTranslated,
  localizedRoute,
  resolveAuthoredUrl,
  type Slugged,
  type Variant,
  VARIANTS,
  type WithCollectionId,
} from './collections';
export {
  documentDateTime,
  documentMonth,
  formatDocumentDate,
  formatDocumentMonth,
} from './document-date';
export {
  type ContentDocument,
  isListed,
  listAllDocuments,
  listDocuments,
  listPrimaryDocuments,
  loadDocument,
  loadProse,
  type ProseSource,
  type ServedMarkdown,
  siblingVariants,
  type WithContentDocument,
} from './documents';
export {
  feedEntries,
  type FeedEntry,
  type FeedSource,
  findFeed,
  listFeeds,
} from './feeds';
export {
  articleCollection,
  type ArticleFrontmatter,
  type BaseFrontmatter,
  baseFrontmatterSchema,
  type Collection,
  filedDate,
  type Source,
  type WithFrontmatter,
} from './frontmatter';
export { intrinsicDimensions } from './image-dimensions';
export { MUSIC_ROUTE } from './music-route';
export {
  type DocumentCard,
  type Headlined,
  renderDocument,
  renderPrimaryDocuments,
  renderProse,
  type WithContentTree,
  type WithHeadings,
  type WithReadingMinutes,
} from './render';
