import { createHash } from 'node:crypto';

/**
 * Names the pair of committed SVGs that render a `mermaid` fence. The authoring
 * script writes under this name and the build looks it up, so a fence edited
 * without a re-render fails the build rather than shipping a stale diagram.
 * Both sides import this — changing it invalidates every cached render.
 *
 * Deliberately free of `import 'server-only'`, unlike the rest of `shared/lib/content/`:
 * `scripts/render-mermaid.ts` runs it under bare Node, outside any bundler.
 */
export function mermaidHash(source: string): string {
  return createHash('sha256')
    .update(source.trim(), 'utf8')
    .digest('hex')
    .slice(0, 12);
}

/** Where the renders live, relative to `public/`. */
export const MERMAID_DIR = 'content/generated/mermaid';

/** One render per scheme; the page shows whichever the theme calls for. */
export const COLOR_SCHEMES = ['light', 'dark'] as const;

export type ColorScheme = (typeof COLOR_SCHEMES)[number];

/** The render's file name inside {@link MERMAID_DIR}. */
export function mermaidFileName(hash: string, theme: ColorScheme): string {
  return `${hash}.${theme}.svg`;
}
