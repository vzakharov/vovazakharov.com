import {
  beatSeconds,
  CHANT,
  KICKS,
  VERSE_CALLS,
  within,
} from '@/clip/shared/score';
import type { Shot } from '@/clip/shared/timeline';
import { channel } from '@/clip/widgets/channels';
import { spoonBunnyReveal } from '@/clip/widgets/spoon-bunny';

import { sectionNamed } from './stand-in';

const PREBRIDGE = sectionNamed('pre-bridge');
const { from, to } = PREBRIDGE;

/** The chanted «Хорошо»s that fall inside the pre-bridge, each a zap. */
const zaps = CHANT.filter((t) => within(PREBRIDGE, t) && t > from + 0.2);
const starts = [from, ...zaps];

// The bunny a step nearer the glass on every channel, and creeping on through
// each hold, so the last two channels end with its face on the glass.
const STEP = 0.3 / Math.max(1, starts.length - 1);
const nearness = (n: number): number => 0.6 + STEP * n;

// The verse ends on the channel before this one, so the crawl opens on one not yet seen.
const FIRST_CHANNEL = VERSE_CALLS.length;

const channels: readonly Shot[] = starts.map((start, n) => ({
  from: start,
  to: starts[n + 1] ?? to,
  draw: channel(FIRST_CHANNEL + n, nearness(n), {
    creep: n >= starts.length - 2 ? 0.25 : STEP,
  }),
}));

// The spoon bunny's head lands round on the last kick before the bridge,
// leaving the face up until the cut.
const lastChant = starts.at(-1) ?? from;
const landing = KICKS.find((k) => k > lastChant + 0.25 && k < to - 0.2);
if (landing === undefined) throw new Error('No kick to land the reveal on');

const reveal = spoonBunnyReveal({ from: landing - 0.16, to: landing - 0.02 });

/**
 * The pre-bridge: the zapping slowed to a crawl, one channel to each chant,
 * and on the last chant the spoon bunny turns round.
 */
export const PREBRIDGE_SHOTS: readonly Shot[] = [
  ...channels.slice(0, -1),
  { from: lastChant, to, draw: reveal },
];

/**
 * The bunny's face held a beat into the bridge, long enough to be read. It
 * cuts into the bridge's opening, so it goes after the bridge's shots.
 */
export const REVEAL_HOLD: Shot = {
  from: to,
  to: to + beatSeconds(PREBRIDGE),
  draw: reveal,
};
