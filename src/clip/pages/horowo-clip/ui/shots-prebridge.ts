import { CHANT, within } from '@/clip/shared/score';
import type { Shot } from '@/clip/shared/timeline';
import { channel } from '@/clip/widgets/channels';

import { sectionNamed } from './stand-in';

const PREBRIDGE = sectionNamed('pre-bridge');
const { from, to } = PREBRIDGE;

/** The chanted «Хорошо»s that fall inside the pre-bridge, each a zap. */
const zaps = CHANT.filter((t) => within(PREBRIDGE, t) && t > from + 0.2);
const starts = [from, ...zaps];

// The bunny a step nearer the glass on every channel.
const nearness = (n: number): number =>
  0.6 + (0.25 * n) / Math.max(1, starts.length - 1);

/** The pre-bridge: the zapping slowed to a crawl, one channel to each chant. */
export const PREBRIDGE_SHOTS: readonly Shot[] = starts.map((start, n) => ({
  from: start,
  to: starts[n + 1] ?? to,
  draw: channel(n, nearness(n)),
}));
