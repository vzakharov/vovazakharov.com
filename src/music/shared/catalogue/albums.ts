import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import { PUBLIC_DIR } from '@/kernel/shared/config/index.node-safe';
import type { Locale } from '@/kernel/shared/i18n';

import { albumFile, localGloss, localName } from './catalogue-files.ts';
import type { TitleGloss } from './frontmatter.ts';
import type { MusicAlbum, MusicProject } from './names.ts';
import type { Spelled } from './spelling.ts';

/** A release's title under a locale, romanized by the Russian rule where the locale cannot read it. */
export function albumTitle(album: MusicAlbum, locale: Locale): Spelled {
  const { frontmatter } = albumFile(album);

  return localName(frontmatter.title, frontmatter[locale].title, locale);
}

export function albumGloss(
  album: MusicAlbum,
  locale: Locale,
): TitleGloss | undefined {
  return localGloss(albumFile(album).frontmatter[locale].title);
}

export function albumArtist(album: MusicAlbum, locale: Locale): MusicProject {
  const { frontmatter } = albumFile(album);

  return frontmatter[locale].artist ?? frontmatter.artist;
}

export function albumWip(album: MusicAlbum): boolean {
  return albumFile(album).frontmatter.wip === true;
}

/**
 * The cover's site-root path, where the release has one: a 600px square cut
 * from the master in its `vovas-music` repository, or Apple Music's or
 * SoundCloud's where the repository holds none — small enough for a grid of
 * them.
 */
export function albumCover(album: MusicAlbum): string | undefined {
  const cover = `/music/assets/covers/${album}.jpg`;

  return fs.existsSync(path.join(PUBLIC_DIR, cover)) ? cover : undefined;
}
