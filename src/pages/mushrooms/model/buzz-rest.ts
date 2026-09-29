/**
 * What a fly and a bee do while they sit, as pure functions of the scene's
 * clock in ms and the leg they sit at the end of — never a leg of their own.
 * A fly jitters, rubs its front legs in bouts, and every second or so hops a
 * short way along its cap and back; a bee crawls a little about its flower.
 * Lengths are in units of the insect's size. Each is 0 in flight and rises
 * from 0 once the landing's bob is done, and falls back to 0 before the stay
 * is due to end, so neither a landing nor a take-off on time jumps; a
 * startle cuts a stay short wherever it stands, and the scene sets the next
 * leg off from where it last drew the insect.
 */

import type { Leg } from './flight';
import type { Point } from './geometry';
import { LANDING } from './insect-motion';
import { type Phased, roundAt, smooth, wave } from './motion';

/** A stay on a perch: when the insect landed there, and when it is due to leave. */
type Sitting = Pick<Leg, 'arrives' | 'leaves'>;

/** How long a sitter takes to start fidgeting after its landing's bob, and to still before it leaves, in ms. */
const EASE_IN = 300;
const EASE_OUT = 250;

/**
 * How far a fly jitters each way, in units of its size, and its two shakes'
 * periods, in ms, never in step.
 */
const JITTER = 0.05;
const JITTER_PERIODS = [83, 127] as const;

/**
 * The least a fly's jitter reaches each way, in CSS px, so it reads as a
 * tremble of its own beside the hop.
 */
export const LEAST_TREMBLE = 1.5;

/**
 * The size a fly drawn `size` px to its unit jitters at: its own, but never
 * under the size at which the jitter reaches `LEAST_TREMBLE`, so a fly on a
 * small meadow trembles as far as one that size.
 */
export function trembleSize(size: number): number {
  return Math.max(size, LEAST_TREMBLE / JITTER);
}

/**
 * A fly's leg-rubbing: a bout of `RUB_FOR` ms starting every `RUB_EVERY`,
 * each rub forward and back taking `RUB_STROKE`.
 */
const RUB_EVERY = 2900;
const RUB_FOR = 1300;
const RUB_STROKE = 220;

/**
 * A fly's hop: one every `HOP_EVERY` ms, out along its cap by `HOP_REACH`
 * over `HOP_JUMP`, held till `HOP_BACK` into the round, and back over
 * `HOP_JUMP` again, lifting `HOP_LIFT` at the top of each jump.
 */
export const HOP_EVERY = 1000;
const HOP_JUMP = 140;
const HOP_BACK = 440;
export const HOP_REACH = 0.14;
const HOP_LIFT = 0.05;

/**
 * A bee's crawl about its flower's head: how far across and down it reaches
 * at the most, in units of its size, and its two sweeps' periods, in ms.
 */
export const CRAWL_REACH = { x: 0.06, y: 0.03 } as const satisfies Point;
const CRAWL_PERIODS = [2600, 1700] as const;

/**
 * How settled on its perch the insect is at `now`, from 0 to 1: 0 until its
 * landing's bob is done, rising to 1, and falling back to 0 as the stay
 * nears its end.
 */
function settled({ arrives, leaves }: Sitting, now: number): number {
  return (
    smooth((now - arrives - LANDING) / EASE_IN) *
    (1 - smooth((now - leaves + EASE_OUT) / EASE_OUT))
  );
}

/** How far a sitting fly has jittered off its seat at `now`: a small fast tremble. */
export function jitter(stay: Sitting, now: number, { phase }: Phased): Point {
  const reach = JITTER * settled(stay, now);
  const [fast, faster] = JITTER_PERIODS;
  return {
    x: reach * Math.sin((Math.PI * 2 * now) / fast + phase),
    y: reach * Math.sin((Math.PI * 2 * now) / faster + phase * 2),
  };
}

/**
 * Where a sitting fly's front legs are in their rub at `now`, from 0 (down
 * and apart) to 1 (raised and crossed), the painter drawing them there: a
 * bout of quick rubs every so often, still between.
 */
export function rubbing(stay: Sitting, now: number, { phase }: Phased): number {
  const since = now - stay.arrives - LANDING;
  if (since < 0) return 0;
  const into = roundAt(since, RUB_EVERY, phase);
  if (into >= RUB_FOR) return 0;
  const bout = Math.sin((Math.PI * into) / RUB_FOR);
  return settled(stay, now) * bout * wave(now, RUB_STROKE, 0);
}

/** How far a hop has the fly along its cap, signed, and how far up off it, in its size. */
export type Hop = { along: number; rise: number };

/** A jump's rise and fall `t` ms into it, 0 outside it. */
const leap = (t: number) =>
  t <= 0 || t >= HOP_JUMP ? 0 : Math.sin((Math.PI * t) / HOP_JUMP);

/**
 * Where a sitting fly's hop has it at `now`: every `HOP_EVERY` a jump out
 * along the cap, to one side or the other as its phase and the hop's count
 * pick, a moment there, and a jump back to its seat.
 */
export function hop(stay: Sitting, now: number, { phase }: Phased): Hop {
  const since = now - stay.arrives - LANDING;
  const ease = settled(stay, now);
  if (ease === 0) return { along: 0, rise: 0 };
  const count = Math.floor(since / HOP_EVERY);
  const into = since - count * HOP_EVERY;
  const side = Math.sin(phase * 13 + count * 2.4) < 0 ? -1 : 1;
  const out = smooth(into / HOP_JUMP) - smooth((into - HOP_BACK) / HOP_JUMP);
  return {
    along: side * HOP_REACH * out * ease,
    rise: HOP_LIFT * (leap(into) + leap(into - HOP_BACK)) * ease,
  };
}

/** How far a bee sitting at a flower has crawled off the middle of its seat at `now`. */
export function crawl(stay: Sitting, now: number, { phase }: Phased): Point {
  const ease = settled(stay, now);
  const [across, down] = CRAWL_PERIODS;
  return {
    x: CRAWL_REACH.x * ease * Math.sin((Math.PI * 2 * now) / across + phase),
    y: CRAWL_REACH.y * ease * Math.sin((Math.PI * 2 * now) / down + phase * 2),
  };
}
