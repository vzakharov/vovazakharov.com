/**
 * The suffix of a committed Open Graph render. `pnpm content:og` produces every
 * image under it, and its `--check` holds each to the source it was rendered
 * from, so a page that advertises one cannot ship it stale.
 */
export const OG_CARD_SUFFIX = '.og.png';

/**
 * A generated card sits at its page's route plus an extension, as a document's
 * files do — safe because a route reserves only `.html` and `.txt`.
 */
export function routeCardPath(route: string): string {
  return `${route}${OG_CARD_SUFFIX}`;
}
