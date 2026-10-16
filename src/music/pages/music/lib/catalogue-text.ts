import 'server-only';

import type { ProseSource } from '@/kernel/shared/content';
import type { Locale } from '@/kernel/shared/i18n';
import type { MusicAlbum, MusicProject } from '@/music/shared/catalogue';

import { albumFile, artistFile } from './catalogue-files';
import { localeProse, localeUniverse } from './sections';

/** A page's prose in its two parts, either of which may be missing. */
export type StoryParts = {
  /** The world a concept album is set in, told ahead of the story. */
  universe?: ProseSource | undefined;
  /** The story proper — a making-of, where a `universe` comes first. */
  story?: ProseSource | undefined;
};

export type CatalogueText = StoryParts &
  Pick<ProseSource, 'markdown'> & {
    /** The line under the page's name. */
    hook: string | undefined;
  };

/** `body` as a source of its own, or `undefined` where it is empty. */
function part(
  source: ProseSource,
  body: string | undefined,
): ProseSource | undefined {
  return body === undefined || body === '' ? undefined : { ...source, body };
}

/** The world a page is set in, where its file — an album's, a song's — tells one. */
export function universeOf(
  source: ProseSource,
  locale: Locale,
): ProseSource | undefined {
  return part(source, localeUniverse(source.body, locale));
}

/**
 * A catalogue page's own text in one language, from the markdown file at its
 * route plus `.md`, cut on markers as a song's story is.
 */
function catalogueText(
  {
    frontmatter,
    ...source
  }: ProseSource & { frontmatter: Record<Locale, { hook?: string }> },
  locale: Locale,
): CatalogueText {
  const { body, markdown } = source;
  const { hook } = frontmatter[locale];

  return {
    markdown,
    universe: universeOf(source, locale),
    story: part(source, localeProse(body, locale)),
    hook,
  };
}

export function albumText(album: MusicAlbum, locale: Locale): CatalogueText {
  return catalogueText(albumFile(album), locale);
}

export function artistText(
  artist: MusicProject,
  locale: Locale,
): CatalogueText {
  return catalogueText(artistFile(artist), locale);
}
