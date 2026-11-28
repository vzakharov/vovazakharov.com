import { type Pen, STAGE } from '@/clip/shared/ink';

import { SHEET_PALETTE } from './palette-instruments';
import { player } from './player';

const FLOOR = 610;

/**
 * The whole band on a flat ground, each playing to `beats`, the singer's jaw
 * at `jaw`: the cast as one frame.
 */
export function castSheet(pen: Pen, beats: number, jaw = 0): void {
  const { ctx } = pen;
  ctx.fillStyle = SHEET_PALETTE.wall;
  ctx.fillRect(0, 0, STAGE.width, STAGE.height);
  ctx.fillStyle = SHEET_PALETTE.floor;
  ctx.fillRect(0, FLOOR - 26, STAGE.width, STAGE.height - FLOOR + 26);
  const scale = 0.74;
  player(pen, 'drums', {
    beats,
    place: { x: 1045, y: FLOOR, scale },
    mark: 3000,
  });
  player(pen, 'guitar', { beats, place: { x: 160, y: FLOOR + 30, scale } });
  player(pen, 'bass', {
    beats,
    place: { x: 650, y: FLOOR + 30, scale },
    mark: 2000,
  });
  player(pen, 'vocal', {
    beats,
    jaw,
    place: { x: 410, y: FLOOR + 40, scale },
    mark: 1000,
  });
}
