import { barSeconds, CHANT, within } from '@/clip/shared/score';
import type { Shot } from '@/clip/shared/timeline';

import { placeholder } from './placeholder';
import { sectionNamed, standIn } from './stand-in';

const NAME = 'pre-bridge';

/** The chanted «Хорошо»s that fall inside the pre-bridge. */
const chanted = CHANT.filter((t) => within(sectionNamed(NAME), t));

/** Every «Хорошо» of the chant a new channel, held a bar or to the next. */
const chant: Shot[] = chanted.map((from, n) => ({
  from,
  to: Math.min(
    chanted[n + 1] ?? Infinity,
    from + barSeconds(sectionNamed(NAME)),
  ),
  draw: placeholder(`zap ${String(n + 1)}`, 'broadcast', 30 + n),
}));

/** The pre-bridge: the zapping slowed to one channel a bar. */
export const PREBRIDGE_SHOTS: readonly Shot[] = [
  standIn(NAME, 'broadcast', 7),
  ...chant,
];
