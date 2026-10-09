/**
 * The singles with cover art, by song slug, at `singleCover`'s path: a 600px
 * square cut from the artwork the track carries on SoundCloud — the album
 * covers' size, so a single sits in the same grid as they do.
 */
const SINGLE_COVERS: ReadonlySet<string> = new Set([
  'chp',
  'ghost',
  'hamlet',
  'hamlet-extended',
  'love',
  'mirrors',
  'mithqal',
  'my_hope',
  'trisagion',
]);

/** The cover's site-root path, under `apps/vova/public/`. */
export function singleCover(slug: string): string | undefined {
  return SINGLE_COVERS.has(slug)
    ? `/music/assets/covers/${slug}.jpg`
    : undefined;
}
