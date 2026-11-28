import {
  add,
  clamp,
  lerp,
  mix,
  type Pen,
  type Point,
  smoothstep,
} from '@/clip/shared/ink';
import type { Drawing, Local } from '@/clip/shared/timeline';

import { HOLE_AT, SLEEPER_FACE, WINDOW_AT } from '../../room';
import { bedroom, ROOM, type Room } from './scene';

/**
 * The sung words the bedroom's pictures turn on, as `words.ts` in the score
 * times them, copied because the score keeps that table private: the onsets of «просыпаешься»,
 * «зайчик», «Так» and the three «шо» of «Так хорошо-шо-шо».
 */
export const CUES = {
  wake: 28.68,
  bunny: 33.08,
  soGood: 42.32,
  sho: [42.56, 43.04, 43.32],
} as const;

const ease = (p: number): number => smoothstep(0, 1, p);

/** From the second line on he has been sweating, and from the fourth the wall watches him. */
const AWAKE: Room = { ...ROOM, drenched: 0.6 };
const WATCHED: Room = { ...AWAKE, holed: true, watching: 1 };
const RAW: Room = { ...WATCHED, raw: true, drenched: 0.8 };

/**
 * «Когда просыпаешься ночью»: his face in the dark, close, eyes shut — they
 * snap open on «просыпаешься» and the camera starts backing off him.
 */
export const wakeUp: Drawing = (pen: Pen, { p }: Local) => {
  const woken = clamp((pen.playhead - CUES.wake) / 0.08, 0, 1);
  bedroom(
    pen,
    {
      ...ROOM,
      nightfall: 0.65,
      face: {
        lid: 1 - woken,
        brow: lerp(0.2, -1, woken),
        gaze: [0, -0.15],
        turn: lerp(0.35, 0.1, woken),
      },
    },
    { framed: add(SLEEPER_FACE, [0, 15]), closeness: lerp(2.9, 2.1, ease(p)) },
  );
};

/**
 * «В поту прохладном и сочном»: the set's light goes cold, the sweat runs
 * off his chin into his lap, the pillow behind him darkens; the camera
 * creeps in and leans.
 */
export const coldSweat: Drawing = (pen: Pen, { p }: Local) => {
  bedroom(
    pen,
    {
      ...ROOM,
      drenched: lerp(0.9, 1, p),
      cold: true,
      face: { gaze: [0.25, 0.7], brow: 0.7, lid: 0 },
    },
    { framed: [440, 340], closeness: lerp(1.9, 2.4, ease(p)), tilt: -4 * p },
  );
};

/**
 * «И призрачный зайчик с обоев»: the camera slides along the wall beside
 * him, and around «зайчик» the printed bunnies open their eyes, one after
 * another, every one on him.
 */
export const wallWakes: Drawing = (pen: Pen, { p }: Local) => {
  const watching = clamp((pen.playhead - (CUES.bunny - 0.35)) / 0.9, 0, 1);
  bedroom(
    pen,
    {
      ...AWAKE,
      watching,
      face: { gaze: [1, -0.35], turn: 0.5, brow: lerp(0.4, 1, watching) },
    },
    { framed: mix([540, 200], [650, 210], ease(p)), closeness: 2.1 },
  );
};

/**
 * «Погнаться готов за тобою»: one of them steps off the paper behind him,
 * leaving its hole, and leans out over his head; he turns to it.
 */
export const offTheWall: Drawing = (pen: Pen, { p }: Local) => {
  const out = ease(clamp(p * 1.4, 0, 1));
  bedroom(
    pen,
    {
      ...WATCHED,
      visit: { at: 'wall', from: HOLE_AT, out },
      face: { gaze: [-0.9, -0.8], turn: -0.3, brow: 1, lid: 0 },
    },
    { framed: [350, 225], closeness: lerp(2, 2.5, ease(p)), tilt: 3 * p },
  );
};

/**
 * «Даже не в деревне летом»: the window holds a village summer afternoon at
 * 3 am, and the bunny stands by it, in the second half's tilted, shaken frame.
 */
export const summerWindow: Drawing = (pen: Pen, { p }: Local) => {
  bedroom(
    pen,
    { ...RAW, summer: true, visit: { at: 'window' } },
    {
      framed: mix(WINDOW_AT, [1040, 300], 0.5),
      closeness: lerp(1.7, 1.95, ease(p)),
      tilt: lerp(-6, -9, p),
    },
  );
};

/**
 * «Ложка новая с секретом» in the bedroom: the reverse angle, from behind
 * the set — him staring into its light, the window empty again, the
 * bunny's shadow up the wall.
 */
export const reverseAngle: Drawing = (pen: Pen, { p }: Local) => {
  bedroom(
    pen,
    {
      ...RAW,
      tv: false,
      nightfall: 0.55,
      face: { gaze: [0.7, 0.15], brow: 1, lid: 0 },
    },
    {
      framed: add(SLEEPER_FACE, [40, 60]),
      closeness: lerp(1.6, 1.9, ease(p)),
      tilt: 5,
      reversed: true,
    },
    0.6,
  );
};

/**
 * «И все отступают напасти»: the camera backs away and the room shrinks
 * into the dark, his face gone calm — while the bunny at the foot of the bed
 * comes nearer and its shadow tops the wall.
 */
export const troublesRetreat: Drawing = (pen: Pen, { p }: Local) => {
  bedroom(
    pen,
    {
      ...RAW,
      visit: { at: 'foot', nearness: lerp(0.5, 0.6, p) },
      face: { gaze: [1, 0.1], brow: -0.5, lid: 0.45 },
    },
    {
      framed: [640, 380],
      closeness: lerp(1.5, 0.72, 1 - (1 - p) ** 2),
      tilt: -4,
    },
    0.6 + 0.4 * p,
  );
};

// Each «шо» a step in: zoom, how far the frame has gone to his face, tilt.
const STEPS = [
  [1.25, 0, -6],
  [1.8, 0.45, 5],
  [2.4, 0.75, -8],
  [3.2, 1, 7],
] as const;

/**
 * «Так хорошо-шо-шо»: the camera jumps at him in a step on each «шо», the
 * bunny at the foot of the bed lit up beside him, his face wide awake.
 */
export const soGood: Drawing = (pen: Pen) => {
  const step = CUES.sho.filter((onset) => onset <= pen.playhead).length;
  const [zoom, toFace, tilt] = STEPS[step] ?? STEPS[0];
  const framed: Point = mix([700, 360], add(SLEEPER_FACE, [60, 20]), toFace);
  bedroom(
    pen,
    {
      ...RAW,
      visit: { at: 'foot', nearness: 0.7 },
      face: { gaze: [0, 0], turn: 0, brow: -1, lid: 0 },
    },
    { framed, closeness: zoom, tilt },
    1,
  );
};
