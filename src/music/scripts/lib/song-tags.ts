/**
 * The tags a song's files carry, built from the catalogue as its page resolves
 * it. One set per file, whatever name it is saved under, so every name is in
 * Latin — the spelling every listener reads — while the lyrics stay in the
 * script they are sung in, the words someone reading along sings.
 */

import { pick } from '@/kernel/shared/lib/collections';
import type { Titled, WithLanguage, WithUrl } from '@/kernel/shared/typings';

import {
  billedArtists,
  type CreditedName,
  inlineRuns,
  SONG_AUTHOR,
  type SongBilling,
  type Spelled,
  spelledText,
  type WithSpelledTitle,
} from '@/music/shared/catalogue/index.node-safe';

/** Where on a release the song sits, and what the release is. */
type TagRelease = WithSpelledTitle & {
  artist: Spelled;
  track: number;
  /** The release's highest track number, which a gap in the catalogue does not lower. */
  total: number;
};

/** A song's catalogue facts, resolved but not yet spelled. */
export type TagSource = SongBilling &
  /** The canonical song page. */
  WithUrl & {
    release?: TagRelease;
    date: Date;
    /** The language sung first, as the frontmatter names it. */
    sungLanguage: string;
    credits?: { lyrics?: CreditedName[]; music?: CreditedName[] };
    /** The sung column's stanzas, each a line of verse as authored. */
    stanzas?: ReadonlyArray<readonly string[]>;
  };

/**
 * What a file is tagged with — the writer's whole input, so its hash is the
 * manifest's. Its `language` is ISO 639-2, which ID3's `TLAN` and `USLT` take.
 */
export type SongTags = Titled &
  WithLanguage &
  WithUrl & {
    artist: string;
    album?: string;
    albumArtist?: string;
    track?: number;
    trackTotal?: number;
    year: number;
    lyricists: string[];
    composers: string[];
    lyrics?: string;
  };

/**
 * ISO 639-2's bibliographic codes, the set taggers write. `zxx` is its "no
 * linguistic content"; Russisch is Russian, whatever its letters.
 */
const ISO_639_2: Readonly<Record<string, string>> = {
  ru: 'rus',
  en: 'eng',
  tt: 'tat',
  ar: 'ara',
  pl: 'pol',
  la: 'lat',
  zh: 'chi',
  fr: 'fre',
  el: 'gre',
  de: 'ger',
  it: 'ita',
  es: 'spa',
  'ru-latn-x-russisch': 'rus',
  instrumental: 'zxx',
};

function languageCode(language: string): string {
  const code = ISO_639_2[language];

  if (code === undefined) {
    throw new Error(`No ISO 639-2 code for ${language}; add it to ISO_639_2.`);
  }

  return code;
}

function credited(people: CreditedName[] | undefined): string[] {
  return (people ?? [SONG_AUTHOR]).map(({ en }) => en);
}

/** The words as a player shows them: a line to a line, a blank line between stanzas, the italics' marks dropped. */
function lyricsText(stanzas: TagSource['stanzas']): string | undefined {
  if (stanzas === undefined || stanzas.length === 0) return undefined;

  return stanzas
    .map((stanza) =>
      stanza
        .map((line) =>
          inlineRuns(line)
            .map(({ text }) => text)
            .join(''),
        )
        .join('\n'),
    )
    .join('\n\n');
}

export function buildTags(source: TagSource): SongTags {
  const { title, artists, release, date, sungLanguage, credits, stanzas, url } =
    source;
  const lyrics = lyricsText(stanzas);

  return {
    title: spelledText(title),
    artist: billedArtists(artists, 'latin'),
    ...(release && {
      album: spelledText(release.title),
      albumArtist: spelledText(release.artist),
      ...pick(release, 'track'),
      trackTotal: release.total,
    }),
    year: date.getUTCFullYear(),
    language: languageCode(sungLanguage),
    lyricists: credited(credits?.lyrics),
    composers: credited(credits?.music),
    ...(lyrics !== undefined && { lyrics }),
    url,
  };
}
