import { beatSeconds, sectionAt, VERSE_CALLS } from '@/clip/shared/score';
import type { Shot } from '@/clip/shared/timeline';

import { placeholder } from './placeholder';
import { standIn } from './stand-in';

/** Each verse call a cut to a channel for a beat, back to the room after it. */
const calls: Shot[] = VERSE_CALLS.map((from, n) => ({
  from,
  to: from + beatSeconds(sectionAt(from)),
  draw: placeholder(`channel ${String(n + 1)}`, 'broadcast', 20 + n),
}));

/** The verse: the bedroom at night, the TV cutting in on every call. */
export const VERSE_SHOTS: readonly Shot[] = [
  standIn('verse, first half', 'reality', 4),
  standIn('verse, second half', 'reality', 5),
  ...calls,
];
