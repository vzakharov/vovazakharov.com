import type { Ranged } from '@/kernel/shared/typings';

import {
  clamp,
  INK_PALETTE,
  lerp,
  mix,
  type Pen,
  type Point,
  smoothstep,
  STAGE,
} from '@/clip/shared/ink';
import type { Drawing, Local } from '@/clip/shared/timeline';
import type { Look } from '@/clip/entities/puppet';

import { type Camera, ward } from './bridge';
import { type Approach, cast, HIS_FACE, SAT_DOWN } from './cast';

/**
 * When the bridge's spine looks away and back. `away`: the spans cut away
 * from it, in song time — the bunny takes a step during each, and he jerks
 * half awake at each return. `fade`: the picture going to black as if the
 * clip were over. `breaths`: the voice's onsets in the black, each breathing
 * a little of the picture back.
 */
export type Sinking = {
  away: readonly Ranged[];
  fade: Ranged;
  breaths: readonly number[];
};

const WIDE: Point = [640, 360];
/** Between his face and the bunny's, sat beside him. */
const CLOSE: Point = [HIS_FACE[0] + 75, HIS_FACE[1] + 5];
const CLOSE_ZOOM = 2.9;
/** How long sitting down takes once the last look away is over, and how soon it starts. */
const SITTING = { delay: 0.3, seconds: 1.4 } as const;
/** How bright each breath gets, the last brightest. */
const BREATH_PEAKS = [0.3, 0.38, 0.46, 0.55, 0.8] as const;
// Short enough to be black again in the dropout before the next «о».
const BREATH_DECAY = 0.13;
const JERK_DECAY = 0.45;

/** The latest span of `spans` begun by `t`, and how many are. */
function begun(spans: readonly Ranged[], t: number) {
  const count = spans.filter(({ from }) => from <= t).length;
  return { count, latest: spans[count - 1] };
}

/** How startled he is at `t`: 1 on a return from a look away, fading after. */
function jerkAt(away: readonly Ranged[], t: number): number {
  const { latest } = begun(away, t);
  if (!latest || t < latest.to) return 0;
  return Math.exp(-(t - latest.to) / JERK_DECAY);
}

/** How much of the picture shows through the black at `t`. */
function breathAt(breaths: readonly number[], t: number): number {
  let light = 0;
  for (const [n, onset] of breaths.entries()) {
    const since = t - onset;
    if (since < 0) continue;
    const peak = BREATH_PEAKS[Math.min(n, BREATH_PEAKS.length - 1)] ?? 0;
    light = Math.max(
      light,
      peak * smoothstep(0, 0.05, since) * Math.exp(-since / BREATH_DECAY),
    );
  }
  return light;
}

function cameraAt(sleep: number, breathsBegun: number): Camera {
  const ease = sleep ** 2.2;
  return {
    focus: mix(WIDE, CLOSE, smoothstep(0, 1, sleep)),
    zoom: CLOSE_ZOOM ** ease * (1 + 0.06 * breathsBegun),
  };
}

function lookAt(sleep: number, jerk: number, awoken: boolean): Partial<Look> {
  if (awoken) {
    return { lid: 0.02, gaze: [1, -0.15], brow: 0.9, nod: 0.1, turn: 0.25 };
  }
  return {
    lid: clamp(lerp(0.3, 0.98, smoothstep(0, 0.95, sleep)) - 0.5 * jerk, 0, 1),
    gaze: mix([0.7, -0.6], [0.15, 0.55], sleep),
    brow: lerp(0.2, -0.3, sleep) + 0.7 * jerk,
    nod: lerp(-0.1, 0.6, sleep) - 0.6 * jerk,
    turn: lerp(0.3, 0.05, sleep),
  };
}

/** The bunny at `t`: a step a look away, then sat down; `glimpse`, how many breaths have shown it. */
function approachAt(
  away: readonly Ranged[],
  t: number,
  glimpse: number,
  awoken: boolean,
): Approach {
  const { count } = begun(away, t);
  const last = away.at(-1);
  const sat = last
    ? clamp((t - last.to - SITTING.delay) / SITTING.seconds, 0, 1)
    : 0;
  return {
    step: Math.min(count, SAT_DOWN - 1) + sat,
    grin: lerp(0.35, 1, glimpse),
    glowing: awoken,
    lean: 9 * glimpse,
  };
}

/**
 * The bridge's spine, one shot under every look away: the cell drawn ever
 * closer onto his face as his eyelid sinks, the bunny a step nearer at each
 * return until it sits down beside him; then the black, and the breaths.
 */
export const wardSinking =
  (sinking: Sinking): Drawing =>
  (pen: Pen, { sinceCut }: Local) => {
    const { playhead: t, ctx } = pen;
    const { away, fade, breaths } = sinking;
    const start = t - sinceCut;
    const sleep = clamp((t - start) / (fade.to - start), 0, 1);
    const breathsBegun = breaths.filter((onset) => onset <= t).length;
    const awoken = breathsBegun === breaths.length && breathsBegun > 0;
    ward(pen, cameraAt(sleep, breathsBegun), (inner) => {
      cast(
        inner,
        lookAt(sleep, jerkAt(away, t), awoken),
        approachAt(away, t, breathsBegun / Math.max(1, breaths.length), awoken),
      );
    });
    const dark = smoothstep(fade.from, fade.to, t) * (1 - breathAt(breaths, t));
    if (dark <= 0) return;
    ctx.save();
    ctx.globalAlpha = dark;
    ctx.fillStyle = INK_PALETTE.ink;
    ctx.fillRect(0, 0, STAGE.width, STAGE.height);
    ctx.restore();
  };
