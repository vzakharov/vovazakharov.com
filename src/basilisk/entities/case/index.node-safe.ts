/**
 * For `scripts/`, which run with no bundler: the graph behind this barrel
 * reaches no CSS, JSX or `server-only`.
 */

export { caseSealSources, caseSealSvg } from './lib/case-seal.ts';
export { gradeLabel } from './lib/grade-label.ts';
