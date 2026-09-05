/**
 * Where the renders live, relative to `public/` — outside every collection, so
 * a walk for a collection's sources never meets the pipeline's own output.
 */
export const MERMAID_DIR = 'generated/mermaid';

/** One render per scheme; the page shows whichever the theme calls for. */
export const COLOR_SCHEMES = ['light', 'dark'] as const;

export type ColorScheme = (typeof COLOR_SCHEMES)[number];

/** The render's file name inside {@link MERMAID_DIR}. */
export function mermaidFileName(hash: string, theme: ColorScheme): string {
  return `${hash}.${theme}.svg`;
}
