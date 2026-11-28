import {
  add,
  at,
  INK_PALETTE,
  limb,
  type Pen,
  type Point,
  turned,
} from '@/clip/shared/ink';

import { figure, type Placed, standing, type Worn } from '../../body';
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
  };

/**
 * One of the band, playing: the puppet in its form for `role`, its instrument
 * in its hands, both moving to `beats`. Placed by the floor between its
 * soles — the drummer by the floor under the middle of the kit.
 */
export function player(pen: Pen, role: Role, options: PlayerOptions): void {
  const { beats, jaw = 0, place = {}, outfit, look, mark: seed = 0 } = options;
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
      const { rig: pose, guitar: hung, ringing } = playing;
      const { x = 0, y = 0, scale = 1, rot = 0 } = hung;
      // The strap runs from the body's upper horn over the far shoulder.
      const horn = add([x, y], turned([28 * scale, -32 * scale], [0, 0], rot));
      standing(pen, pose, place, build.size, () => {
        figure(pen, pose, {
          ...dress,
          look: face(playing.look),
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
      const { rig: pose, stand } = playing;
      standing(pen, pose, place, build.size, () => {
        figure(pen, pose, {
          ...dress,
          look: face(playing.look),
          grips: { L: 'fist', R: 'fist' },
          front: () => {
            micStand(pen, stand.foot, stand.mic, seed + 300);
          },
        });
      });
      break;
    }
    case 'drums': {
      const playing = drumming(beats);
      const { rig: pose, sticks, hits } = playing;
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
