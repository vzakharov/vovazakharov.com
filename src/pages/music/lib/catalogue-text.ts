import 'server-only';

import { loadProse, type ProseSource } from '@/shared/content';
import type { Locale } from '@/shared/i18n';
import {
  catalogueFrontmatterSchema,
  type MusicAlbum,
  type MusicProject,
} from '@/shared/music-catalogue';

import { ALBUMS_SEGMENT, ARTISTS_SEGMENT } from './music-urls';
import { MUSIC_PROJECT_SLUGS } from './projects';
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
 * route plus `.md` — `albums/<slug>.md`, `artists/<slug>.md` — cut on markers
 * as a song's story is. `undefined` where the page has none.
 */
function catalogueText(
  name: string,
  locale: Locale,
): CatalogueText | undefined {
  const loaded = loadProse('music', name, catalogueFrontmatterSchema);

  if (!loaded) return undefined;

  const { frontmatter, ...source } = loaded;

  return {
    markdown: source.markdown,
    universe: universeOf(source, locale),
    story: part(source, localeProse(source.body, locale)),
    hook: frontmatter[locale].hook,
  };
}

export function albumText(
  album: MusicAlbum,
  locale: Locale,
): CatalogueText | undefined {
  return catalogueText(`${ALBUMS_SEGMENT}/${album}`, locale);
}

export function artistText(
  artist: MusicProject,
  locale: Locale,
): CatalogueText | undefined {
  return catalogueText(
    `${ARTISTS_SEGMENT}/${MUSIC_PROJECT_SLUGS[artist]}`,
    locale,
  );
}
