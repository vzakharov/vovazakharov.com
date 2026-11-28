import { beatSeconds } from '@/clip/shared/score';
import type { Drawing, Shot } from '@/clip/shared/timeline';
import { gigClose, gigWide } from '@/clip/widgets/gig';

import { beatsOf, sectionNamed } from './stand-in';

const DOUBLE = sectionNamed('double time');
const { from, to } = DOUBLE;
const BEATS = Math.round((to - from) / beatSeconds(DOUBLE));
// The ears go up over the section's last bar, bursting into the verse.
const options = { liftOff: to - 4 * beatSeconds(DOUBLE) };

// Who the camera is on, beat by beat after the opening wide: one or two beats
// a player, back to the wide between rounds.
const CUTS: ReadonlyArray<readonly [Drawing | null, number]> = [
  [gigClose('drums', options), 2],
  [gigClose('guitar', options), 1],
  [gigClose('bass', options), 1],
  [gigClose('vocal', options), 2],
  [null, 2],
  [gigClose('guitar', options), 1],
  [gigClose('drums', options), 1],
  [gigClose('bass', options), 2],
  [gigClose('vocal', options), 1],
  [gigClose('drums', options), 1],
];

function inserts(): Shot[] {
  const shots: Shot[] = [];
  let beat = 2;
  for (const [draw, length] of CUTS) {
    if (beat + length > BEATS - 4) break;
    if (draw) shots.push({ ...beatsOf(DOUBLE, beat, beat + length), draw });
    beat += length;
  }
  return shots;
}

/** Double time: the band live in the studio, cut on the beat. */
export const DOUBLE_SHOTS: readonly Shot[] = [
  { from, to, draw: gigWide(options) },
  ...inserts(),
];
