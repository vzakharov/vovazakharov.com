import 'server-only';

import { loadProse, type ProseSource } from '@/shared/content';
import type { Locale } from '@/shared/i18n';
import {
  albumFrontmatterSchema,
  artistFrontmatterSchema,
  type LocalName,
  MUSIC_PROJECT_SLUGS,
  type MusicAlbum,
  type MusicProject,
  type TitleGloss,
} from '@/shared/music-catalogue';
import { spell, type Spelled } from '@/shared/music-catalogue/index.node-safe';

import { ALBUMS_SEGMENT, ARTISTS_SEGMENT } from './music-urls';

/*
 * An album's or an artist's file — `albums/<slug>.md`, `artists/<slug>.md` — is
 * the whole of what the catalogue knows of it: its names in frontmatter, its
 * text below. Every album and artist has one, `pnpm music:codegen` deriving
 * the names a song may use from them.
 */

type CatalogueFile<F> = ProseSource & { frontmatter: F };

/** Each file read once per process — every page names a dozen of them. */
function readOnce<K, F>(
  read: (key: K) => CatalogueFile<F>,
): (key: K) => CatalogueFile<F> {
  const cache = new Map<K, CatalogueFile<F>>();

  return (key) => {
    const cached = cache.get(key) ?? read(key);

    cache.set(key, cached);

    return cached;
  };
}

function required<F>(
  name: string,
  loaded: CatalogueFile<F> | undefined,
): CatalogueFile<F> {
  if (loaded === undefined) {
    throw new Error(
      `music/${name}.md is gone; run \`pnpm music:codegen\` to drop it from the names a song may use.`,
    );
  }

  return loaded;
}

export const albumFile = readOnce((album: MusicAlbum) => {
  const name = `${ALBUMS_SEGMENT}/${album}`;

  return required(name, loadProse('music', name, albumFrontmatterSchema));
});

export const artistFile = readOnce((artist: MusicProject) => {
  const name = `${ARTISTS_SEGMENT}/${MUSIC_PROJECT_SLUGS[artist]}`;

  return required(name, loadProse('music', name, artistFrontmatterSchema));
});

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
