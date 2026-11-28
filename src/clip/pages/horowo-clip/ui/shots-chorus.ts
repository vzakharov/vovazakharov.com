import { pulse } from '@/clip/shared/score';
import type { Shot } from '@/clip/shared/timeline';
import { FRAMINGS, meadowParty } from '@/clip/widgets/meadow-party';

import { placeholder } from './placeholder';
import { sectionNamed } from './stand-in';

const chorus = sectionNamed('chorus');

// One slot a half-time pulse, round and round: meadow 7, ward 3, gig 2 of 12.
const ROTATION = 'MMWMMGMWMMGW';

const ward = placeholder('ward insert', 'reality', 16);
const gig = placeholder('gig insert', 'broadcast', 26);

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

/**
 * The meadow's framing changes at every return from an insert, so each run of
 * meadow pulses is a cut of its own.
 */
function rotation(): Shot[] {
  const starts = pulseStarts();
  let framing = 0;
  return starts.map((from, n) => {
    const to = starts[n + 1] ?? chorus.to;
    const slot = ROTATION[n % ROTATION.length];
    if (slot === 'W') return { from, to, draw: ward };
    if (slot === 'G') return { from, to, draw: gig };
    if (n > 0 && ROTATION[(n - 1) % ROTATION.length] !== 'M') framing += 1;
    const name = FRAMINGS[framing % FRAMINGS.length] ?? 'wide';
    return { from, to, draw: meadowParty(name) };
  });
}

/** The chorus: the meadow, cut on the half-time pulse with the ward wall and the gig. */
export const CHORUS_SHOTS: readonly Shot[] = rotation();
