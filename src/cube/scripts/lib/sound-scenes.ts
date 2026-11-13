import type { Timed } from '@/kernel/shared/typings';

/** The moments of the intro the sound bench listens to, each as a path for an ear. */
import type { Vec2 } from '@/cube/shared/lib/vec';
import {
  gustAt,
  type Listener,
  type OutsideMix,
  outsideMix,
  type Scene,
  throughDoorway,
} from '@/cube/features/sound';

/** A stretch of the hour heard along some path, and what it is in words. */
type Told = Timed & {
  /** Seconds into the hour it begins. */
  begins: number;
  mixAt: (seconds: number) => OutsideMix;
  /** Where on the island the ear is, or the opening it hears through. */
  earAt: (seconds: number) => Vec2;
  told: string;
};

export type Scenes = Record<string, Told>;

/** Where the bench stands: the cube's middle, the waking spot, the ladder's foot. */
type Places = Record<'cube' | 'waking' | 'ladder', Vec2>;

const toward = (from: Vec2, to: Vec2): number =>
  Math.atan2(to[1] - from[1], to[0] - from[0]);

const partWay = (from: Vec2, to: Vec2, x: number): Vec2 => [
  from[0] + x * (to[0] - from[0]),
  from[1] + x * (to[1] - from[1]),
];

/** The second of the hour the wind gusts hardest in. */
function hardestGust(): number {
  let best = 0;
  for (let t = 0; t < 3600; t += 1) if (gustAt(t) > gustAt(best)) best = t;
  return best;
}

/** The bench's scenes on `scene`, between `places`. */
export function scenesOf(scene: Scene, places: Places): Scenes {
  const { cube, waking, ladder } = places;
  const heard = (listener: (t: number) => Listener) => ({
    mixAt: (seconds: number) => outsideMix(scene, listener(seconds), seconds),
    earAt: (seconds: number) => listener(seconds).at,
  });
  const seaward = toward(cube, waking);
  const doorway: Vec2 = [cube[0] + 2.5, ladder[1]];
  const gust = hardestGust();
  return {
    waking: {
      begins: 0,
      seconds: 60,
      told: 'lying on dry sand, 23 m from the cube, facing out to sea',
      ...heard(() => ({ at: waking, gaze: seaward })),
    },
    turning: {
      begins: 60,
      seconds: 24,
      told: 'the same spot, turning once round to the right',
      ...heard((t) => ({
        at: waking,
        gaze: seaward + (2 * Math.PI * (t - 60)) / 24,
      })),
    },
    walk: {
      begins: 100,
      seconds: 40,
      told: 'walking from the waking spot to the foot of the ladder',
      ...heard((t) => ({
        at: partWay(waking, ladder, (t - 100) / 40),
        gaze: toward(waking, ladder),
      })),
    },
    ladder: {
      begins: 140,
      seconds: 30,
      told: 'standing at the foot of the ladder, facing the cube',
      ...heard(() => ({ at: ladder, gaze: toward(ladder, cube) })),
    },
    under: {
      begins: 170,
      seconds: 30,
      told: 'under the middle of the cube',
      ...heard(() => ({ at: cube, gaze: 0 })),
    },
    inside: {
      begins: 200,
      seconds: 30,
      told: 'from the doorway 4 m into floor 1 over 20 s, then on floor 2',
      earAt: () => doorway,
      mixAt: (t) =>
        throughDoorway(outsideMix(scene, { at: doorway, gaze: Math.PI }, t), {
          inward: Math.min(4, (t - 200) / 5),
          rightward: -0.6,
          floorsBelow: t < 222 ? 0 : 1,
        }),
    },
    gust: {
      begins: gust - 20,
      seconds: 40,
      told: `the hour's hardest gust, at ${String(gust)} s, from the waking spot`,
      ...heard(() => ({ at: waking, gaze: seaward })),
    },
  };
}
