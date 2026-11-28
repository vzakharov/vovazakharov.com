import {
  barTime,
  BEAT,
  beatTime,
  CHANT,
  SONG_SECONDS,
  VERSE_CALLS,
} from '@/clip/shared/score';
import type { Shot } from '@/clip/shared/timeline';

import { placeholder } from './placeholder';

/** The bar the verse's first call leads into; each channel holds a beat past it. */
const FIRST_CALL_BAR = 13;

/** Each call a cut to a channel, each line after it the bedroom. */
const verse: Shot[] = VERSE_CALLS.flatMap((call, n) => {
  const channelEnd = barTime(FIRST_CALL_BAR + n) + BEAT;
  const next = VERSE_CALLS[n + 1] ?? barTime(20);
  return [
    {
      from: call,
      to: channelEnd,
      draw: placeholder(`Channel ${String(n + 1)}`, 'channel'),
    },
    {
      from: channelEnd,
      to: next,
      draw: placeholder('Bedroom, 3 am', 'reality'),
    },
  ];
});

/** Every «Хорошо» of the chant a new channel, each nearer the glass. */
const chant: Shot[] = CHANT.map((from, n) => ({
  from,
  to: CHANT[n + 1] ?? barTime(45),
  draw: placeholder(
    `Zap ${String(n + 1)}`,
    n % 2 === 0 ? 'channel' : 'broadcast',
  ),
}));

/**
 * The clip, shot by shot, against the song's map. A later entry cuts into
 * an earlier one where their spans overlap, so a scene replaces a stand-in by
 * taking its entry's place.
 */
export const SHOTS: readonly Shot[] = [
  {
    from: 0,
    to: barTime(8),
    draw: placeholder("Children's show", 'broadcast'),
  },
  {
    from: barTime(8),
    to: barTime(9),
    draw: placeholder('The set wall falls', 'broadcast'),
  },
  {
    from: barTime(9),
    to: VERSE_CALLS[0],
    draw: placeholder('The band, live', 'live'),
  },
  ...verse,
  {
    from: barTime(20),
    to: barTime(30),
    draw: placeholder('Chorus, live', 'live'),
  },
  {
    from: barTime(30),
    to: CHANT[0],
    draw: placeholder('Zapping', 'broadcast'),
  },
  ...chant,
  {
    from: barTime(45),
    to: beatTime(187),
    draw: placeholder('The ward: the TV goes dark', 'ward'),
  },
  {
    from: beatTime(187),
    to: barTime(55),
    draw: placeholder('Stabs and holes', 'ward'),
  },
  {
    from: barTime(55),
    to: SONG_SECONDS,
    draw: placeholder('The snow globe', 'globe'),
  },
];
