import { beatSeconds, sectionAt, VERSE_CALLS } from '@/clip/shared/score';
import type { Drawing, Shot } from '@/clip/shared/timeline';
import {
  BEDROOM_CUES,
  coldSweat,
  offTheWall,
  soGood,
  summerWindow,
  troublesRetreat,
  wakeUp,
  wallWakes,
} from '@/clip/widgets/bedroom';
import { channel } from '@/clip/widgets/channels';
import { spoonBunny } from '@/clip/widgets/spoon-bunny';

import { sectionNamed } from './stand-in';

// The bunny on the channels comes nearer the glass call by call.
const NEARNESS = { first: 0.3, last: 0.5 };
const nearness = (n: number): number =>
  NEARNESS.first +
  ((NEARNESS.last - NEARNESS.first) * n) / Math.max(1, VERSE_CALLS.length - 1);

/** Each verse call a cut to a new channel for a beat, back to the room after it. */
const calls: Shot[] = VERSE_CALLS.map((from, n) => ({
  from,
  to: from + beatSeconds(sectionAt(from)),
  draw: channel(n, nearness(n)),
}));

const { from: VERSE_FROM } = sectionNamed('verse, first half');
const { to: VERSE_TO } = sectionNamed('verse, second half');

/** The bedroom under the line that answers a call, from the call to the next. */
const line = (n: number, draw: Drawing, to?: number): Shot => ({
  from: n === 0 ? VERSE_FROM : (VERSE_CALLS[n] ?? VERSE_FROM),
  to: to ?? VERSE_CALLS[n + 1] ?? VERSE_TO,
  draw,
});

/**
 * The verse: the bedroom at night, a new picture for each of the seven lines,
 * the TV cutting in on every call. Line 6, «Ложка новая с секретом», leaves
 * the room for the bunny at its table, seen from behind and from afar.
 */
export const VERSE_SHOTS: readonly Shot[] = [
  line(0, wakeUp),
  line(1, coldSweat),
  line(2, wallWakes),
  line(3, offTheWall),
  line(4, summerWindow),
  line(5, spoonBunny(0.05, 0.25)),
  line(6, troublesRetreat, BEDROOM_CUES.soGood),
  { from: BEDROOM_CUES.soGood, to: VERSE_TO, draw: soGood },
  ...calls,
];
