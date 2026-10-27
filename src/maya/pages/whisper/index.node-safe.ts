/**
 * For `personas/tools/`, which runs with no bundler: every import in the graph
 * behind this barrel spells its extension and reaches no CSS, JSX or
 * `server-only`.
 */

export { fold } from './model/hush.ts';
