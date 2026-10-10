/**
 * The suffix of a committed Open Graph render. `pnpm content:og` produces every
 * image under it, and its `--check` holds each to the source it was rendered
 * from, so a page that advertises one cannot ship it stale.
 */
export const OG_CARD_SUFFIX = '.og.png';

/**
 * The same, for a card made of photographs — a collage of covers — which PNG
 * stores at seven times JPEG's weight.
 */
export const OG_PHOTO_CARD_SUFFIX = '.og.jpg';

/** Every suffix a committed render can carry. */
export const OG_CARD_SUFFIXES = [OG_CARD_SUFFIX, OG_PHOTO_CARD_SUFFIX] as const;

/**
 * A generated card sits at its page's route plus an extension, as a document's
 * files do — safe because a route reserves only `.html` and `.txt`.
 */
export function routeCardPath(
  route: string,
  suffix: (typeof OG_CARD_SUFFIXES)[number] = OG_CARD_SUFFIX,
): string {
  return `${route}${suffix}`;
}
