import { pulse } from '@/clip/shared/score';
import type { Shot } from '@/clip/shared/timeline';
import { gigInsert } from '@/clip/widgets/gig';
import { FRAMINGS, meadowParty } from '@/clip/widgets/meadow-party';
import { wardInsert } from '@/clip/widgets/ward';

import { sectionNamed } from './stand-in';

const chorus = sectionNamed('chorus');

// One slot a half-time pulse, round and round: meadow 7, ward 3, gig 2 of 12.
const ROTATION = 'MMWMMGMWMMGW';

/** Where each pulse of the chorus starts, the first clipped to the section's own start. */
function pulseStarts(): number[] {
  const { fraction, seconds } = pulse(chorus.from);
  const first = chorus.from - fraction * seconds;
  const starts: number[] = [];
  for (let at = first; at < chorus.to - 1e-6; at += seconds) {
    starts.push(Math.max(at, chorus.from));
  }
  return starts;
}

const slotAt = (n: number): string | undefined => ROTATION[n % ROTATION.length];

/**
 * The meadow's framing changes at every return from an insert, so each run of
 * meadow pulses is a cut of its own. The ward's words are gouged a share
 * further at each of its slots, the last of them finishing the line.
 */
function rotation(): Shot[] {
  const starts = pulseStarts();
  const wardSlots = starts.filter((_, n) => slotAt(n) === 'W').length;
  let framing = 0;
  let gouged = 0;
  return starts.map((from, n) => {
    const to = starts[n + 1] ?? chorus.to;
    const slot = slotAt(n);
    if (slot === 'W') {
      const draw = wardInsert(gouged / wardSlots, (gouged + 1) / wardSlots);
      gouged += 1;
      return { from, to, draw };
    }
    if (slot === 'G') return { from, to, draw: gigInsert };
    if (n > 0 && slotAt(n - 1) !== 'M') framing += 1;
    const name = FRAMINGS[framing % FRAMINGS.length] ?? 'wide';
    return { from, to, draw: meadowParty(name) };
  });
}

/** The chorus: the meadow, cut on the half-time pulse with the ward wall and the gig. */
export const CHORUS_SHOTS: readonly Shot[] = rotation();
