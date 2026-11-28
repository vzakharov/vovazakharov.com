import {
  add,
  lerp,
  mix,
  noise,
  type Place,
  type Point,
  smoothstep,
  sub,
  times,
  turned,
} from '@/clip/shared/ink';

import {
  carried,
  fitted,
  mapPose,
  palmOf,
  type Pose,
  POSES,
  reaching,
  type Side,
  SOLE,
} from '../../body';
import type { Look } from '../../head';
import { BUILDS, fretAt, KIT, PICK_AT, STICK, type Strings } from './band';

/**
 * Every cycle here is a pure function of `beats`, the song's beat counter: its
 * whole part says which beat of the bar this is, its fraction how far through
 * it. A bare phase in `[0, 1)` plays every beat like the bar's first.
 */

const frac = (value: number): number => value - Math.floor(value);

/** A hit felt through one beat: 1 just after `phase` 0, dying away to nothing by 1. */
export const thump = (phase: number): number =>
  phase < 0.06 ? phase / 0.06 : Math.exp(-4.5 * (phase - 0.06));

/** What every player's cycle gives: a pose already fitted to its build, and a face. */
type Playing = {
  rig: Pose;
  look: Partial<Look>;
};

export type Strumming = Playing & {
  /** Where the guitar hangs, in the puppet's units. */
  guitar: Place;
  /** How hard the strings are ringing, in `[0, 1]`. */
  ringing: number;
};

/**
 * A guitarist's or a bassist's beat. The guitarist strums down on the beat
 * and up off it, rocks and bangs his head; the bassist plucks, barely moves,
 * and looks slowly from side to side.
 */
export function strumming(strings: Strings, beats: number): Strumming {
  const build = BUILDS[strings];
  const bass = strings === 'bass';
  const phase = frac(beats);
  const hit = thump(phase);
  const swing = Math.sin(Math.PI * beats);
  const stroke = Math.sin(2 * Math.PI * phase);
  const { size } = build;
  // Carried after the refit: a sway put through it would slide a wide
  // build's feet.
  const stance = carried(
    fitted(POSES.wide, build),
    bass
      ? { sway: 4 * size * swing, dip: 5 * size * hit }
      : { sway: 14 * size * swing, dip: 10 * size * hit, lean: 3 * swing },
  );
  const body = {
    ...stance,
    head: add(stance.head, [bass ? 0 : 10 * size * swing, 0]),
  };
  const belly = mix(
    mix(body.shoulderL, body.shoulderR, 0.5),
    mix(body.hipL, body.hipR, 0.5),
    0.72,
  );
  const guitar = {
    x: belly[0] - (bass ? 52 : 36) * size,
    y: belly[1],
    rot: (bass ? -14 : -24) + (bass ? 1 : 3) * stroke,
    scale: (bass ? 1.15 : 1.1) * size,
  };
  const onBody = (point: Point): Point =>
    add(
      [guitar.x, guitar.y],
      turned(times(point, guitar.scale), [0, 0], guitar.rot),
    );
  // A new chord every two beats, the same one each time the song comes round.
  const chord = (noise(7, Math.floor(beats / 2)) + 1) / 2;
  const picking: Point = bass
    ? [PICK_AT[0] + 4 * Math.sin(4 * Math.PI * phase), 18 + 5 * stroke]
    : [PICK_AT[0], 30 * stroke];
  return {
    rig: reaching(
      body,
      {
        L: onBody(picking),
        R: onBody(add(fretAt(strings, lerp(0.15, 0.8, chord)), [0, 4])),
      },
      palmOf(build),
    ),
    look: bass
      ? { turn: 0.8 * Math.sin((Math.PI * beats) / 2) }
      : { nod: hit * 0.8, turn: 0.25 * swing },
    guitar,
    ringing: hit,
  };
}

export type Singing = Playing & {
  /** The mic stand: its foot on the floor and the mic at its top, in the puppet's units. */
  stand: { foot: Point; mic: Point };
};

/** The singer's beat: one hand on the stand, the other fist pumping, the body swaying. */
export function singing(beats: number): Singing {
  const build = BUILDS.vocal;
  const { size } = build;
  const hit = thump(frac(beats));
  const swing = Math.sin(Math.PI * beats);
  const stance = carried(fitted(POSES.stand, build), {
    sway: 16 * size * swing,
    dip: 9 * size * hit,
    lean: 2.5 * swing,
  });
  const body = { ...stance, head: add(stance.head, [-8 * size * swing, 0]) };
  const foot: Point = [
    (body.footL[0] + body.footR[0]) / 2 - 58 * size,
    Math.max(body.footL[1], body.footR[1]) + SOLE * size,
  ];
  const mic = add(body.neck, [-70 * size, 4 * size]);
  return {
    rig: reaching(
      body,
      {
        L: mix(foot, mic, 0.7),
        R: add(body.shoulderR, [58 * size, (-66 - 54 * hit) * size]),
      },
      palmOf(build),
    ),
    look: { turn: 0.3 * Math.sin((Math.PI * beats) / 2), nod: -0.3 * hit },
    stand: { foot, mic },
  };
}

const HITS = ['kick', 'snare', 'hat', 'crash'] as const;

export type Drumming = Playing & {
  /** Where each stick's tip is, in the puppet's units, the kit's own. */
  sticks: Record<Side, Point>;
  /** How hard each thing has just been hit, in `[0, 1]`. */
  hits: Record<(typeof HITS)[number], number>;
};

/**
 * Where a stick's tip is at `beats`, striking on every `step` of a beat
 * whatever `targetAt` names for that strike — `null` for a strike sat out. It
 * rises slowly off one hit and whips down onto the next.
 */
function stickTip(
  beats: number,
  step: number,
  targetAt: (strike: number) => Point | null,
): { tip: Point; lift: number } {
  const now = Math.floor(beats / step);
  const struck = (from: number, by: 1 | -1): { at: number; on: Point } => {
    for (let strike = from; ; strike += by) {
      const on = targetAt(strike);
      if (on) return { at: strike * step, on };
    }
  };
  const last = struck(now, -1);
  const next = struck(now + 1, 1);
  const through = (beats - last.at) / (next.at - last.at);
  const lift = Math.sin(Math.PI * through * through);
  return {
    tip: add(mix(last.on, next.on, smoothstep(0.1, 0.8, through)), [
      0,
      -100 * lift,
    ]),
    lift,
  };
}

/**
 * The drummer's beat, at the kit: eighths on the hi-hat with the left stick,
 * the snare on the off-beats with the right, a crash to open every eighth
 * bar, the kick on the beats between.
 */
export function drumming(beats: number): Drumming {
  const build = BUILDS.drums;
  const { size } = build;
  const hits = {
    kick: thump(Math.min(1, frac(beats / 2) * 2)),
    snare: thump(Math.min(1, frac((beats - 1) / 2) * 2)),
    hat: thump(frac(beats * 2)),
    crash: thump(Math.min(1, frac(beats / 8) * 4)),
  };
  const seated = fitted(POSES.sit, build);
  const hips = mix(seated.hipL, seated.hipR, 0.5);
  const bounce: Point = [0, 7 * size * Math.max(hits.kick, hits.snare)];
  const seat = add(sub(KIT.stool, hips), bounce);
  const body = mapPose(seated, (point, joint) =>
    add(
      point,
      joint === 'head'
        ? add(seat, [6 * size * Math.sin(Math.PI * beats), 0])
        : seat,
    ),
  );
  const left = stickTip(beats, 0.5, () => KIT.hat);
  const right = stickTip(beats, 1, (strike) => {
    if (strike % 8 === 0) return KIT.crash;
    return Math.abs(strike % 2) === 1 ? KIT.snare : null;
  });
  // A stick turns in the fist: it points down at the drum on a hit and is
  // cocked up past level at the top of its lift.
  const fist = (side: Side, { tip, lift }: ReturnType<typeof stickTip>) => {
    const inward = side === 'L' ? 1 : -1;
    const slope = lerp(0.55, -0.8, lift);
    const span = Math.hypot(1, slope);
    return add(tip, [(inward * STICK) / span, (-slope * STICK) / span]);
  };
  return {
    rig: reaching(
      body,
      { L: fist('L', left), R: fist('R', right) },
      palmOf(build) * 0.5,
    ),
    look: {
      nod: 0.7 * Math.max(hits.kick, hits.snare),
      gaze: [0.6 * Math.sin((Math.PI * beats) / 2), -0.3],
    },
    sticks: { L: left.tip, R: right.tip },
    hits,
  };
}
