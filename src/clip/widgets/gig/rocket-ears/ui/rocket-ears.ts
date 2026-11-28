import { at, type Pen } from '@/clip/shared/ink';
import { broadcast, SCREEN } from '@/clip/shared/tape';
import type { Drawing } from '@/clip/shared/timeline';
import type { Audience } from '@/clip/entities/bunny';
import { type Role, ROLES } from '@/clip/entities/puppet';

import {
  beams,
  beatsAt,
  crowd,
  filmed,
  GIG_PALETTE,
  marquee,
  playing,
} from '../../studio';
import { momentAt, progressAt, STORY_SECONDS } from '../model/ear-story';
import { nightSky, rig, ROOF, WORLD } from './sky';

/** The stage's floor in the world, the band's soles on it. */
const STAGE_FLOOR = 2080;
/** The band far off on the stage, seen over the audience's heads. */
const BAND: Record<Role, number> = {
  guitar: 250,
  vocal: 400,
  bass: 550,
  drums: 730,
};

/** The audience whose ears the story follows, lifting off at its own clock's 0. */
const AUDIENCE: Audience = {
  area: { x: -560, y: STAGE_FLOOR, width: 2080, height: 300 },
  rows: 3,
  headWidth: 170,
  liftOff: 0,
  seed: 31,
};

/** The studio as the audience sees it: the back wall, the lights, the band playing small. */
function studio(pen: Pen): void {
  const { ctx, playhead } = pen;
  const { left, right, bottom } = WORLD;
  ctx.fillStyle = GIG_PALETTE.wall;
  ctx.fillRect(left, ROOF, right - left, STAGE_FLOOR - ROOF);
  const beats = beatsAt(playhead);
  at(pen, { y: ROOF + 60 }, () => {
    beams(pen, beats, 0.8);
    marquee(pen, beats, 90);
  });
  ctx.fillStyle = GIG_PALETTE.floor;
  ctx.fillRect(left, STAGE_FLOOR - 30, right - left, bottom - STAGE_FLOOR);
  ctx.fillStyle = GIG_PALETTE.stageEdge;
  ctx.fillRect(left, STAGE_FLOOR - 30, right - left, 5);
  for (const role of ROLES) {
    playing(pen, role, { x: BAND[role], y: STAGE_FLOOR - 30, scale: 0.36 });
  }
}

/**
 * The rocket ears, as a story of their own: the studio audience's ears
 * twitching in close-up, then smoking and spitting sparks at their roots,
 * lifting off over the heads, climbing out through the roof into the night,
 * and bursting there as fireworks of pills. `progress` (0 to 1) is how far
 * along the story is at the cut, and it runs on in real time from there;
 * left out, it is read off the song time of the cut, so a return in a later
 * section is always further along. The band keeps playing to the song.
 */
export const rocketEars =
  (progress?: number): Drawing =>
  (pen, local) => {
    const cut = pen.playhead - local.sinceCut;
    const start = progress ?? progressAt(cut);
    const { flight, centre, zoom } = momentAt(
      start * STORY_SECONDS + local.sinceCut,
    );
    broadcast(
      pen,
      (tape) => {
        const flying: Pen = { ...tape, playhead: flight };
        filmed(
          tape,
          cut,
          () => {
            at(
              tape,
              {
                x: SCREEN.width / 2,
                y: SCREEN.height / 2,
                scale: zoom,
              },
              () => {
                at(tape, { x: -centre[0], y: -centre[1] }, () => {
                  nightSky(tape);
                  studio(tape);
                  rig(tape);
                  crowd(flying, AUDIENCE);
                });
              },
            );
          },
          { whip: 0.5, kick: 0.6, shake: 0.8 },
        );
      },
      { wear: 0.3 + 0.3 * start },
    );
  };
