import { beatSeconds } from '@/clip/shared/score';
import type { Drawing, Shot } from '@/clip/shared/timeline';
import { gigClose, gigPart, gigWide } from '@/clip/widgets/gig';

import { sectionNamed } from './stand-in';

const DOUBLE = sectionNamed('double time');
const { from, to } = DOUBLE;
const HALF = beatSeconds(DOUBLE) / 2;

const wide = gigWide();

// The section cut on the half-beat, each entry a picture and how many
// half-beats it holds: the wide slams in, then pieces of the players tear by,
// a whole player now and then, the audience's ears between.
const CUTS: ReadonlyArray<readonly [Drawing, number]> = [
  [wide, 2],
  [gigPart('guitar pick'), 1],
  [gigPart('drums sticks'), 1],
  [gigPart('bass headstock'), 2],
  [gigPart('vocal jaw'), 1],
  [gigPart('boot'), 1],
  [gigClose('drums'), 2],
  [gigPart('guitar eye'), 1],
  [gigPart('bass neck'), 1],
  [gigPart('drums tom'), 1],
  [gigPart('vocal eye'), 1],
  [wide, 2],
  [gigPart('guitar neck'), 1],
  [gigPart('boot'), 1],
  [gigPart('drums jaw'), 1],
  [gigPart('bass pick'), 1],
  [gigClose('vocal'), 2],
  [gigPart('guitar headstock'), 2],
  [gigPart('drums eye'), 1],
  [gigPart('vocal mic'), 1],
  [gigPart('boot'), 1],
  [gigPart('guitar pick'), 1],
  [wide, 6],
];

function cuts(): Shot[] {
  let start = from;
  return CUTS.map(([draw, halves]) => {
    const shot = { from: start, to: Math.min(to, start + halves * HALF), draw };
    start = shot.to;
    return shot;
  });
}

/** Double time: the band live in the studio, torn apart on the half-beat. */
export const DOUBLE_SHOTS: readonly Shot[] = [
  { from, to, draw: wide },
  ...cuts(),
];
