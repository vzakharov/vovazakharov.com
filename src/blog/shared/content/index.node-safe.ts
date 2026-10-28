/**
 * For `scripts/`, which run with no bundler: the graph behind this barrel
 * reaches no CSS, JSX or `server-only`.
 */

export {
  collectionDir,
  type CollectionId,
  COLLECTIONS,
  collectionsForSite,
  documentRoute,
  isDocumentFile,
  isTranslated,
  type Slugged,
} from './collections.ts';
export { splitLocale, translationOf } from './locale-suffix.ts';
export {
  COLOR_SCHEMES,
  type ColorScheme,
  MERMAID_DIR,
  mermaidFileName,
} from './mermaid-renders.ts';
export { stampFrontmatter } from './translation-stamp.ts';
