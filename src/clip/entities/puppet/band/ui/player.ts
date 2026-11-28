import {
  add,
  at,
  INK_PALETTE,
  limb,
  type Pen,
  type Point,
  turned,
} from '@/clip/shared/ink';

import {
  type Carriage,
  carried,
  figure,
  type Placed,
  type Pose,
  standing,
  type Worn,
} from '../../body';
import { LED_PALETTE, type Look } from '../../head';
import { BUILDS, type Role } from '../model/band';
import { drumming, singing, strumming } from '../model/playing';
import { kitBehind, kitFront } from './drum-kit';
import { guitar } from './guitar';
import { micStand } from './mic';
import { INSTRUMENT_PALETTE } from './palette-instruments';

/** What tells the four apart, besides their builds: the same man's four faces. */
export const FORM_LOOKS: Record<Role, Partial<Look>> = {
  guitar: { hair: 'mohawk' },
  vocal: { hair: 'cap' },
  bass: { hair: 'bald', eyes: 'two' },
  drums: { hair: 'tuft', led: LED_PALETTE.green },
};

export type PlayerOptions = Worn &
  Placed & {
    /** The song's beat counter: see `playing.ts`. */
    beats: number;
    /** The mask's jaw, for whoever is singing: 0 clenched, 1 dropped. */
    jaw?: number;
    /** The body over the planted feet, put on top of the playing: a hop's knee bend. */
    carriage?: Carriage;
    /**
     * How far the hands and the instrument hang below where the body would put
     * them, in the puppet's units: negative floats them up. The drummer's
     * sticks stay on the kit.
     */
    trail?: number;
  };

/** `rig` under `carriage`, its forearms `trail` lower than the body leaves them. */
function borne(rig: Pose, carriage: Carriage, trail: number): Pose {
  const pose = carried(rig, carriage);
  const sag = (point: Point, share: number): Point =>
    add(point, [0, trail * share]);
  return {
    ...pose,
    elbowL: sag(pose.elbowL, 0.5),
    elbowR: sag(pose.elbowR, 0.5),
    wristL: sag(pose.wristL, 1),
    wristR: sag(pose.wristR, 1),
  };
}

/**
 * One of the band, playing: the puppet in its form for `role`, its instrument
 * in its hands, both moving to `beats`. Placed by the floor between its
 * soles — the drummer by the floor under the middle of the kit.
 */
export function player(pen: Pen, role: Role, options: PlayerOptions): void {
  const { beats, jaw = 0, place = {}, outfit, look, mark: seed = 0 } = options;
  const { carriage = {}, trail = 0 } = options;
  const { sway = 0, dip = 0 } = carriage;
  const build = BUILDS[role];
  const dress = { build, outfit, mark: seed };
  const face = (playing: Partial<Look>): Partial<Look> => ({
    ...FORM_LOOKS[role],
    ...playing,
    jaw,
    ...look,
  });
  switch (role) {
    case 'guitar':
    case 'bass': {
      const playing = strumming(role, beats);
      const { rig, guitar: slung, ringing, look: playingLook } = playing;
      const pose = borne(rig, carriage, trail);
      const hung = {
        ...slung,
        x: (slung.x ?? 0) + sway,
        y: (slung.y ?? 0) + dip + trail,
      };
      const { x, y, scale = 1, rot = 0 } = hung;
      // The strap runs from the body's upper horn over the far shoulder.
      const horn = add([x, y], turned([28 * scale, -32 * scale], [0, 0], rot));
      standing(pen, pose, place, build.size, () => {
        figure(pen, pose, {
          ...dress,
          look: face(playingLook),
          grips: { L: role === 'bass' ? 'point' : 'fist', R: 'wrap' },
          front: () => {
            limb(
              pen,
              [horn, add(pose.shoulderR, [-6, -14])],
              INSTRUMENT_PALETTE.black,
              9,
              seed + 300,
            );
            at(pen, hung, () => {
              guitar(pen, role, ringing, seed + 310);
            });
          },
        });
      });
      break;
    }
    case 'vocal': {
      const playing = singing(beats);
      const { rig, stand } = playing;
      const pose = borne(rig, carriage, 0);
      const mic = add(stand.mic, [sway, dip]);
      standing(pen, pose, place, build.size, () => {
        figure(pen, pose, {
          ...dress,
          look: face(playing.look),
          grips: { L: 'fist', R: 'fist' },
          front: () => {
            micStand(pen, stand.foot, mic, seed + 300);
          },
        });
      });
      break;
    }
    case 'drums': {
      const playing = drumming(beats);
      const { rig, sticks, hits } = playing;
      const pose = carried(rig, carriage);
      const stick = (tip: Point) => (wrist: Point) => {
        limb(pen, [wrist, tip], INK_PALETTE.bone, 5, seed + 300);
      };
      at(pen, place, () => {
        figure(pen, pose, {
          ...dress,
          look: face(playing.look),
          grips: { L: 'fist', R: 'fist' },
          held: { L: stick(sticks.L), R: stick(sticks.R) },
          legless: true,
          behind: () => {
            kitBehind(pen, hits, seed + 400);
          },
        });
        kitFront(pen, hits, seed + 400);
      });
      break;
    }
    default: {
      throw new Error('Unknown role');
    }
  }
}
