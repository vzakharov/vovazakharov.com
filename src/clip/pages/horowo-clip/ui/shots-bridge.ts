import { barSeconds } from '@/clip/shared/score';
import type { Drawing, Shot } from '@/clip/shared/timeline';
import {
  wardPullBack,
  wardTv,
  wardTwoShot,
  wardWall,
  wardWide,
} from '@/clip/widgets/ward';

import { sectionNamed } from './stand-in';

const BRIDGE = sectionNamed('melodic bridge');
const BAR = barSeconds(BRIDGE);

/** Each shot and the bar it cuts in on, counted from the section's start. */
const CUTS: ReadonlyArray<readonly [number, Drawing]> = [
  [0, wardWide],
  [3, wardTwoShot],
  [6, wardTv],
  [7, wardWall],
  [9, wardPullBack],
];

/** The melodic bridge: the ward, the bunny sat down beside him, the snow on the TV. */
export const BRIDGE_SHOTS: readonly Shot[] = CUTS.map(([bar, draw], n) => ({
  from: BRIDGE.from + bar * BAR,
  to:
    n + 1 < CUTS.length
      ? BRIDGE.from + (CUTS[n + 1]?.[0] ?? 0) * BAR
      : BRIDGE.to,
  draw,
}));
