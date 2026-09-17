/**
 * The third barrel, on an axis of its own: not what a client bundle may hold but
 * what resolves with no bundler. `scripts/` reaches it by relative path from
 * bare Node, so every import in its graph spells its extension, and nothing it
 * re-exports may carry `server-only`, which throws outside a React server
 * bundle. That rules out `index.ts` as well — a barrel is node-safe by its whole
 * graph, not by the side of the client boundary it sits on.
 */

export { resolveSiteId } from './site.env.unsafe.ts';
