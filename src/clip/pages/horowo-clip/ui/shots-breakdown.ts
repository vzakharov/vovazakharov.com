import { KICKS } from '@/clip/shared/score';
import type { Shot } from '@/clip/shared/timeline';
import { globePullBack, stab, switchOff } from '@/clip/widgets/ending';
import { wardHole } from '@/clip/widgets/ward';

import { sectionNamed } from './stand-in';

const { from: BREAKDOWN_FROM, to: BREAKDOWN_TO } = sectionNamed('breakdown');
/** The song's last kick switches the tube off; the pull back opens this long before it. */
const LAST_KICK = KICKS.at(-1) ?? BREAKDOWN_TO;
const PULL_BACK_SECONDS = 6.5;
const GLOBE_FROM = LAST_KICK - PULL_BACK_SECONDS;
/** A stab's length, and the least gap between two, keeping flashes under three a second. */
const STAB_SECONDS = 0.28;
const STAB_GAP = 0.36;

/** The kicks that stab: every breakdown kick before the globe, thinned to the gap. */
const STAB_TIMES: number[] = [];
for (const t of KICKS) {
  const last = STAB_TIMES.at(-1);
  const inBreakdown = t >= BREAKDOWN_FROM && t < GLOBE_FROM - STAB_SECONDS;
  if (inBreakdown && (last === undefined || t - last >= STAB_GAP)) {
    STAB_TIMES.push(t);
  }
}

/** The breakdown and the ending: the tape tearing, the snow globe, the tube going dark. */
export const BREAKDOWN_SHOTS: readonly Shot[] = [
  { from: BREAKDOWN_FROM, to: GLOBE_FROM, draw: wardHole },
  ...STAB_TIMES.map((from, n) => ({
    from,
    to: from + STAB_SECONDS,
    draw: stab(n, STAB_TIMES.length),
  })),
  { from: GLOBE_FROM, to: LAST_KICK, draw: globePullBack },
  { from: LAST_KICK, to: BREAKDOWN_TO, draw: switchOff },
];
