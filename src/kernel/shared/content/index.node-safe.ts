/**
 * For `scripts/`, which run with no bundler: every import in the graph behind
 * this barrel spells its extension and reaches no CSS, JSX or `server-only`.
 */

export {
  collectionDir,
  documentRoute,
  isDocumentFile,
  PUBLIC_DIR,
  type Routed,
  type Slugged,
} from './collections.ts';
export { contentHash } from './content-hash.ts';
