import type { Locale } from '@/kernel/shared/i18n';
import type { Script } from '@/kernel/shared/lib/script-preference';
import type { WithLink } from '@/kernel/shared/typings';

import type { Slugged } from '@/blog/shared/content';

import type { Playable } from './frontmatter.ts';
import { type Spelled, spelledText, type WithSpelledName } from './spelling.ts';

/** A name linked to its page — an artist on a billing, a tile on a grid. */
export type SpelledLink = WithLink & WithSpelledName;

/** A song's billing, each artist linked to its page and the joins between them as text. */
export type Billing = Array<SpelledLink | string>;

/** The billing as one line of text in the reader's script, for where a link cannot go. */
export function billingText(billing: Billing, script?: Script): string {
  return billing
    .map((part) =>
      typeof part === 'string' ? part : spelledText(part.name, script),
    )
    .join('');
}

/** The two files the player chooses between. */
export type Streamed = {
  /** The URL of the file the player plays where the reader asks for lossless, `playedName`'s. */
  audio: string;
  /** What the player plays otherwise. */
  mp3: string;
};

/**
 * A song as the player needs it: resolved at build time from the collection and
 * handed to the client as props, so no part of the content pipeline is shipped.
 */
export type PlayerTrack = Slugged &
  Playable &
  Streamed & {
    /** What the song is called in each language, how it is billed, and where each is served. */
    titles: Record<Locale, Spelled>;
    billing: Record<Locale, Billing>;
    routes: Record<Locale, string>;
  };

export function trackSource(track: PlayerTrack, lossless: boolean): string {
  return lossless ? track.audio : track.mp3;
}

/** Whether lossless plays anything else: a song mastered as an MP3 has no other file. */
export function hasLossless({ audio, mp3 }: Streamed) {
  return audio !== mp3;
}

/** A track, as the one a control or a slot is about. */
export type WithTrack = { track: PlayerTrack };

/** Tracks by catalogue position — the listed songs in collection order, then any appended. */
export type WithTracks = { tracks: PlayerTrack[] };
