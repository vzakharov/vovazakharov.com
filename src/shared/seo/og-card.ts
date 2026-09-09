/**
 * The suffix of a committed Open Graph render. `pnpm content:og` produces every
 * image under it, and its `--check` holds each to the source it was rendered
 * from, so a page that advertises one cannot ship it stale.
 */
export const OG_CARD_SUFFIX = '.og.png';
