import { ink, type Pen, STAGE } from '@/clip/shared/ink';
import { writeScratched } from '@/clip/shared/lettering';
import { bunny } from '@/clip/entities/bunny';
import { puppet } from '@/clip/entities/puppet';
import { snowGlobe } from '@/clip/entities/snow-globe';
import { tallies } from '@/clip/entities/tally';

import { ENDING_PALETTE } from '../../palette';
import { boxAt, domeHospital } from './hospital';

/** The globe the bunny holds up, the channel's address on its plaque. */
export function channelGlobe(
  pen: Pen,
  radius: number,
  shaking: number,
  inside: (r: number) => void,
): void {
  snowGlobe(pen, {
    domeRadius: radius,
    shaking,
    plaque: 'T.ME/FKNBALL',
    plaqueFace: 'dots',
    seed: 151,
    inside,
  });
}

/**
 * The ward on the last «Хорошо!»: the words and the tallies on the wall, the
 * man asleep on his cot at last, and beside him the bunny, grinning, holding
 * up the snow globe for the camera.
 */
export function wardClose(pen: Pen, shaking: number): void {
  const { ctx } = pen;
  ctx.fillStyle = ENDING_PALETTE.wardWall;
  ctx.fillRect(0, 0, STAGE.width, STAGE.height);
  tallies(pen, {
    ...STAGE,
    height: 520,
    markHeight: 46,
    seed: 250,
  });
  writeScratched(pen, 'КАК, СУКА, ХОРОШО', {
    letterHeight: 50,
    x: 40,
    y: 60,
    seed: 251,
  });
  ctx.fillStyle = ENDING_PALETTE.wardFloor;
  ctx.fillRect(0, 560, STAGE.width, STAGE.height - 560);
  ink(pen, boxAt(40, 560, 520, 70), {
    fill: ENDING_PALETTE.cot,
    width: 5,
    seed: 252,
  });
  puppet(pen, {
    place: { x: 300, y: 690, scale: 0.7 },
    pose: 'sit',
    outfit: 'strait',
    look: { lid: 1, nod: 0.7, turn: 0.2, jaw: 0.1, brow: -0.2 },
    mark: 253,
  });
  bunny(pen, {
    x: 830,
    y: 250,
    nearness: 1,
    bunnyScale: 0.78,
    arms: 'hold',
    eyes: 'glow',
    grin: 1,
    swaying: 0.2,
    seed: 150,
    held: () => {
      channelGlobe(pen, 165, shaking, (r) => {
        domeHospital(pen, r);
      });
    },
  });
}
