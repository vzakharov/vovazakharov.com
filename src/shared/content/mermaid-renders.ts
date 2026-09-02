/** Where the renders live, relative to `public/`. */
export const MERMAID_DIR = 'content/generated/mermaid';

/** One render per scheme; the page shows whichever the theme calls for. */
export const COLOR_SCHEMES = ['light', 'dark'] as const;

export type ColorScheme = (typeof COLOR_SCHEMES)[number];

/** The render's file name inside {@link MERMAID_DIR}. */
export function mermaidFileName(hash: string, theme: ColorScheme): string {
  return `${hash}.${theme}.svg`;
}
