/**
 * For `scripts/`, which run with no bundler: every import in the graph behind
 * this barrel spells its extension and reaches no CSS, JSX or `server-only`.
 */

export {
  collectionDir,
  type CollectionId,
  COLLECTIONS,
  collectionsForSite,
  documentRoute,
  isDocumentFile,
  type Slugged,
} from './collections.ts';
export {
  COLOR_SCHEMES,
  type ColorScheme,
  MERMAID_DIR,
  mermaidFileName,
} from './mermaid-renders.ts';
