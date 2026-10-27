import 'server-only';

import { keptIn } from '@/kernel/shared/cache';
import type { Locale } from '@/kernel/shared/i18n';

import { loadProse } from '@/blog/shared/content';

import {
  albumFrontmatterSchema,
  artistFrontmatterSchema,
  type LocalName,
  type TitleGloss,
} from './frontmatter.ts';
import { ALBUMS_SEGMENT, ARTISTS_SEGMENT } from './music-urls.ts';
import { type MusicAlbum, type MusicProject, projectSlug } from './names.ts';
import { spell, type Spelled } from './spelling.ts';

type CatalogueFile<F> = NonNullable<ReturnType<typeof loadProse<F>>>;

/** Each file read once per process — every page names a dozen of them. */
function readOnce<K, F>(
  read: (key: K) => CatalogueFile<F>,
): (key: K) => CatalogueFile<F> {
  const cache = new Map<K, CatalogueFile<F>>();

  return (key) => keptIn(cache, key, read);
}

function required<F>(
  name: string,
  loaded: CatalogueFile<F> | undefined,
): CatalogueFile<F> {
  if (loaded === undefined) {
    throw new Error(`music/${name}.md is gone.`);
  }

  return loaded;
}

/** `albums/` and `artists/` are siblings of the songs collection's directory, reached from it by `../`. */
function loadCatalogueFile<F>(
  name: string,
  schema: Parameters<typeof loadProse<F>>[2],
): CatalogueFile<F> {
  return required(name, loadProse('music', `../${name}`, schema));
}

export const albumFile = readOnce((album: MusicAlbum) =>
  loadCatalogueFile(`${ALBUMS_SEGMENT}/${album}`, albumFrontmatterSchema),
);

export const artistFile = readOnce((artist: MusicProject) =>
  loadCatalogueFile(
    `${ARTISTS_SEGMENT}/${projectSlug(artist)}`,
    artistFrontmatterSchema,
  ),
);

/**
 * An album's or an artist's name under a locale — the locale's own where it
 * renames, the file's where it keeps or glosses it — romanized by the Russian
 * rule where the locale cannot read it.
 */
export function localName(
  name: string,
  local: LocalName | undefined,
  locale: Locale,
): Spelled {
  return spell(
    { text: typeof local === 'string' ? local : name, language: 'ru' },
    locale,
  );
}

/** What a locale tells its reader about a name it keeps, as a song's gloss does. */
export function localGloss(
  local: LocalName | undefined,
): TitleGloss | undefined {
  return typeof local === 'object' ? local : undefined;
}
