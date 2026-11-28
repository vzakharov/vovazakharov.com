import { beatSeconds, sectionAt, VERSE_CALLS } from '@/clip/shared/score';
import type { Shot } from '@/clip/shared/timeline';
import {
  bedroomFoot,
  bedroomWide,
  bedroomWindow,
} from '@/clip/widgets/bedroom';

import { placeholder } from './placeholder';
import { sectionNamed } from './stand-in';

/** Each verse call a cut to a channel for a beat, back to the room after it. */
const calls: Shot[] = VERSE_CALLS.map((from, n) => ({
  from,
  to: from + beatSeconds(sectionAt(from)),
  draw: placeholder(`channel ${String(n + 1)}`, 'broadcast', 20 + n),
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
