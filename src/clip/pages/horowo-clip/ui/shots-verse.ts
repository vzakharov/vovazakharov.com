import { beatSeconds, sectionAt, VERSE_CALLS } from '@/clip/shared/score';
import type { Shot } from '@/clip/shared/timeline';
import {
  bedroomFoot,
  bedroomWide,
  bedroomWindow,
} from '@/clip/widgets/bedroom';
import { channel } from '@/clip/widgets/channels';

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

const FIRST = sectionNamed('verse, first half');
const { from: SECOND_FROM, to: SECOND_TO } = sectionNamed('verse, second half');
const SECOND_MIDDLE = (SECOND_FROM + SECOND_TO) / 2;

/** The verse: the bedroom at night, the TV cutting in on every call. */
export const VERSE_SHOTS: readonly Shot[] = [
  { ...FIRST, draw: bedroomWide },
  { from: SECOND_FROM, to: SECOND_MIDDLE, draw: bedroomWindow },
  { from: SECOND_MIDDLE, to: SECOND_TO, draw: bedroomFoot },
  ...calls,
];
