/**
 * For `scripts/`, which run with no bundler: every import in the graph behind
 * this barrel spells its extension and reaches no CSS, JSX or `server-only`.
 */

export { resolveSiteId } from './site.env.unsafe.ts';
