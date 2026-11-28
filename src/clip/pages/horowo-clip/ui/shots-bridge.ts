import type { Ranged } from '@/kernel/shared/typings';

import { beatSeconds } from '@/clip/shared/score';
import { type Drawing, halfDream, type Shot } from '@/clip/shared/timeline';
import { bedroomWide } from '@/clip/widgets/bedroom';
import { channel } from '@/clip/widgets/channels';
import { gigInsert } from '@/clip/widgets/gig';
import { meadowParty } from '@/clip/widgets/meadow-party';
import { wardInsert, wardSinking } from '@/clip/widgets/ward';

import { sectionNamed } from './stand-in';

/**
 * What he half-dreams on the edge of sleep, in the order the bridge cuts to
 * them, the list cycled past its end: the clip's storylines as he saw them.
 */
const HALF_DREAMS: readonly Drawing[] = [
  meadowParty('wide'),
  gigInsert,
  channel(6, 0.7),
  wardInsert(0, 1),
  bedroomWide,
  meadowParty('hill'),
];

const BRIDGE = sectionNamed('melodic bridge');
const BEAT = beatSeconds(BRIDGE);
const beat = (n: number): number => BRIDGE.from + n * BEAT;

/** The looks away, in beats from the section's start: each longer than the last. */
const AWAY: ReadonlyArray<readonly [number, number]> = [
  [6, 8],
  [11, 13.5],
  [16, 19],
  [21.5, 25],
  [27, 31],
  [32.5, 37],
];
const AWAY_SPANS: readonly Ranged[] = AWAY.map(([from, to]) => ({
  from: beat(from),
  to: beat(to),
}));

/**
 * The «о о о о о» in the lull before the breakdown, read off the master's
 * vocal band (the vocal stem ends at 89.6 s): a beat apart, a dropout
 * between each.
 */
const BREATHS = [94.2, 94.62, 95.01, 95.41, 95.8] as const;

/** The melodic bridge: one slow zoom onto him falling asleep, cut with the half-dreams, then the false end. */
export const BRIDGE_SHOTS: readonly Shot[] = [
  {
    ...BRIDGE,
    draw: wardSinking({
      away: AWAY_SPANS,
      fade: { from: beat(38.5), to: beat(42.8) },
      breaths: BREATHS,
    }),
  },
  ...AWAY_SPANS.map((span, n) => ({
    ...span,
    draw: halfDream(HALF_DREAMS[n % HALF_DREAMS.length] ?? gigInsert, {
      under: (n + 1) / AWAY_SPANS.length,
      seed: 31 + n,
    }),
  })),
];
