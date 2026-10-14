import type { Script } from '@/shared/lib/script-preference';

import { type Spelled, spelledText } from './spelling.ts';

/** Who a song is billed to — the artist first, features after — and what it is called, as one page spells them. */
export type SongBilling = {
  artists: readonly [Spelled, ...Spelled[]];
  title: Spelled;
};

/**
 * beets' default replacements, so a name is legal on every filesystem a
 * listener saves it to.
 */
const REPLACEMENTS: readonly (readonly [RegExp, string])[] = [
  [/[\\/<>:"?*|]/g, '_'],
  [/\p{Cc}/gu, ''],
  [/^\./, '_'],
  [/\.$/, '_'],
  [/\s+$/, ''],
  [/^\s+/, ''],
];

function legal(stem: string): string {
  return REPLACEMENTS.reduce(
    (name, [pattern, replacement]) => name.replace(pattern, replacement),
    stem.normalize('NFC'),
  );
}

/** `A feat. B & C` — the form taggers and MusicBrainz credit features in. */
export function billedArtists(
  [artist, ...features]: SongBilling['artists'],
  script: Script,
): string {
  return [
    spelledText(artist, script),
    ...(features.length === 0
      ? []
      : [
          'feat.',
          features.map((feature) => spelledText(feature, script)).join(' & '),
        ]),
  ].join(' ');
}

/** `<Artist> - <Title>.<extension>` — the convention taggers and download stores default to. */
export function songFileName(
  { artists, title }: SongBilling,
  script: Script,
  extension: string,
): string {
  return `${legal(`${billedArtists(artists, script)} - ${spelledText(title, script)}`)}.${extension}`;
}

/**
 * The name a page saves a song's file under, spelled as the page spells its
 * names — a Latin one only where it differs from the original.
 */
export function songFileNames(
  billing: SongBilling,
  extension: string,
): Spelled {
  const original = songFileName(billing, 'original', extension);
  const latin = songFileName(billing, 'latin', extension);

  return latin === original ? { original } : { original, latin };
}
