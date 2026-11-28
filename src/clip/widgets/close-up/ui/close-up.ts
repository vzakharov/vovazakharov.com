import type { Ranged } from '@/kernel/shared/typings';

import {
  at,
  clamp,
  mix,
  type Pen,
  type Point,
  smoothstep,
  STAGE,
} from '@/clip/shared/ink';
import { jaw, pulse } from '@/clip/shared/score';
import { reality } from '@/clip/shared/tape';
import type { Drawing } from '@/clip/shared/timeline';
import { head, type Look } from '@/clip/entities/puppet';

import { type Corner, CORNER_AT, type Emblem, emblemIn } from './emblems';
import { CLOSE_UP_PALETTE } from './palette-close-up';

/** When the jaw drops all the way, and the span over which the camera falls into the mouth. */
export type CloseUpCues = {
  jawDrop: number;
  fall: Ranged;
};

type Landing = readonly [Emblem, Corner];

// What lands on each bar's hit, answering the line sung over that bar.
const STANZA: ReadonlyArray<readonly Landing[]> = [
  [['sun', 'topLeft']], // Не сдохнуть бы от счастья
  [['pills', 'topRight']], // В серотонинопаде
  [['bunny', 'bottomLeft']], // Здесь есть одно ненастье
  [['abc', 'bottomRight']], // И то лишь рифмы ради
  [['wall', 'topLeft']], // И на стене дурдома
  [['nearBunny', 'bottomRight']], // Кто б не подумал шо
  [['hor', 'bottomLeft']], // Я выскребу три слова
  [['handful', 'topRight']], // Ногтём-карандашом
  [['grin', 'topLeft']], // Как, сука, хорошо
  // The line's tail: everything at once, and the eyes on the camera.
  [
    ['grin', 'topLeft'],
    ['handful', 'topRight'],
    ['hor', 'bottomLeft'],
    ['nearBunny', 'bottomRight'],
  ],
];

// Where the point between the eyes sits on the stage, and how big the head
// is there: past the frame at the crown and the chin.
const EYES_AT: Point = [655, 300];
const SCALE = 3.05;
// How much nearer the camera is on each bar, kept, and the jolt on the hit.
const STEP = 1.045;
const JOLT = 0.07;
const JOLT_DECAY = 0.1;
const LANDING_DECAY = 0.09;
// Where the camera jerks back to when the jaw drops, so the whole hanging jaw
// is in frame.
const DROPPED_EYES_AT: Point = [640, 212];
const DROPPED_SCALE = 2.8;
// The open mouth's middle in the head's units, and how much bigger the head
// is when the camera has fallen into it.
const MOUTH: Point = [0, 92];
const SWALLOWED = 16;
const HEAD_SEED = 500;
// A time a pulse's own start rounds to, just short of the cue it ends at.
const BEFORE = 1e-6;

type Camera = { focus: Point; on: Point; scale: number };

function black(pen: Pen): void {
  pen.ctx.fillStyle = CLOSE_UP_PALETTE.black;
  pen.ctx.fillRect(0, 0, STAGE.width, STAGE.height);
}

/** The head on black, `camera.focus` (in the head's units) put at `camera.on`. */
function face(pen: Pen, look: Partial<Look>, camera: Camera): void {
  const {
    on: [x, y],
    focus: [fx, fy],
    scale,
  } = camera;
  black(pen);
  at(pen, { x, y, scale }, () => {
    at(pen, { x: -fx, y: -fy }, () => {
      head(pen, look, HEAD_SEED);
    });
  });
}

/** Where the eyes snap to look at what landed: the corner, or the camera for a crowd. */
function gazeFor(landings: readonly Landing[]): Point {
  const [only, ...rest] = landings;
  if (!only || rest.length > 0) return [0, 0];
  const [cx, cy] = CORNER_AT[only[1]];
  return [Math.sign(cx - EYES_AT[0]), 0.85 * Math.sign(cy - EYES_AT[1])];
}

/**
 * The intro: the singer's masked head on black, so close it runs off the
 * frame. On each bar's hit the camera steps in, the eyes snap to a corner,
 * and one of the clip's emblems lands there; between hits only the jaw
 * moves. From `jawDrop` the jaw hangs open, and through `fall` the camera
 * falls into the mouth, to black on the last hit before its end.
 */
export function closeUp(cues: CloseUpCues): Drawing {
  const last = pulse(cues.fall.to - BEFORE);
  const blackout = cues.fall.to - BEFORE - last.fraction * last.seconds;
  return (pen) => {
    const t = pen.playhead;
    if (t >= blackout) {
      black(pen);
      return;
    }
    const { index, fraction, seconds } = pulse(t);
    const bar = clamp(index, 0, STANZA.length - 1);
    const since = fraction * seconds;
    const landings = STANZA[bar] ?? [];
    const dropped = t >= cues.jawDrop;
    const falling =
      t >= cues.fall.from
        ? clamp((t - cues.fall.from) / (blackout - cues.fall.from), 0, 1)
        : 0;
    const into = smoothstep(0, 1, falling);
    const jolt = 1 + JOLT * Math.exp(-since / JOLT_DECAY);
    const camera: Camera = {
      focus: mix([0, 0], MOUTH, into),
      on: mix(
        dropped ? DROPPED_EYES_AT : EYES_AT,
        [STAGE.width / 2, STAGE.height / 2],
        into,
      ),
      scale:
        (dropped ? DROPPED_SCALE : SCALE * STEP ** bar) *
        jolt *
        (1 + (SWALLOWED - 1) * falling ** 3),
    };
    const look: Partial<Look> = {
      jaw: dropped ? 1 : jaw(t),
      gaze: gazeFor(landings),
      ...(dropped ? { brow: -1, lid: 0 } : {}),
    };
    reality(pen, (inner) => {
      face(inner, look, camera);
      if (falling > 0) return;
      // The emblems hold the instant they landed; only their line boils.
      const held = { ...inner, playhead: t - since };
      const landing = Math.exp(-since / LANDING_DECAY);
      for (const [n, [emblem, corner]] of landings.entries()) {
        emblemIn(held, emblem, corner, landing, 600 + bar * 10 + n);
      }
    });
  };
}

/**
 * The same face on black with no emblems, for a line sung anywhere in the
 * song: the jaw follows the voice, and the camera creeps in across the shot.
 */
export const faceOnBlack: Drawing = (pen, { p }) => {
  reality(pen, (inner) => {
    face(
      inner,
      { jaw: jaw(pen.playhead), gaze: [0, 0] },
      { focus: [0, 0], on: EYES_AT, scale: SCALE * (1 + 0.12 * p) },
    );
  });
};
