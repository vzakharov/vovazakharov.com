import type { Script } from '@/kernel/shared/lib/script-preference';

import {
  type Spelled,
  spelledText,
  type WithSpelledTitle,
} from './spelling.ts';

/** Who a song is billed to — the artist first, features after — and what it is called, as one page spells them. */
export type SongBilling = WithSpelledTitle & {
  artists: readonly [Spelled, ...Spelled[]];
};

/**
 * beets' default replacements, so a name is legal on every filesystem a
 * listener saves it to.
 */
const REPLACEMENTS: ReadonlyArray<readonly [RegExp, string]> = [
  [/["*/:<>?\\|]/g, '_'],
  [/\p{Cc}/gu, ''],
  [/^\./, '_'],
  [/\.$/, '_'],
  [/\s+$/, ''],
  [/^\s+/, ''],
];

function legal(stem: string): string {
  let name = stem.normalize('NFC');

  for (const [pattern, replacement] of REPLACEMENTS) {
    name = name.replace(pattern, replacement);
  }

  return name;
}

/** ` feat. B & C`, or nothing for a song with no features. */
function featuring(features: readonly Spelled[], script: Script): string {
  return features.length === 0
    ? ''
    : ` feat. ${features.map((feature) => spelledText(feature, script)).join(' & ')}`;
}

/** `A feat. B & C` — the form taggers and MusicBrainz credit features in. */
export function billedArtists(
  [artist, ...features]: SongBilling['artists'],
  script: Script,
): string {
  return `${spelledText(artist, script)}${featuring(features, script)}`;
}

/** `<Artist> - <Title> feat. <Features>.<extension>` — the convention download stores name a featured track by. */
export function songFileName(
  { artists: [artist, ...features], title }: SongBilling,
  script: Script,
  extension: string,
): string {
  return `${legal(`${spelledText(artist, script)} - ${spelledText(title, script)}${featuring(features, script)}`)}.${extension}`;
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
