import { GENERATED_DIR } from './collections';

/** Where the renders live, relative to `public/` — under the directory a source walk skips. */
export const MERMAID_DIR = `${GENERATED_DIR}/mermaid`;

/** One render per scheme; the page shows whichever the theme calls for. */
export const COLOR_SCHEMES = ['light', 'dark'] as const;

export type ColorScheme = (typeof COLOR_SCHEMES)[number];

/** The render's file name inside {@link MERMAID_DIR}. */
export function mermaidFileName(hash: string, theme: ColorScheme): string {
  return `${hash}.${theme}.svg`;
}
