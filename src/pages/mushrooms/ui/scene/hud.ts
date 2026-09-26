import type * as Phaser from 'phaser';

import { PALETTE } from './palette';

/**
 * The mute button as a pictogram, centred on the graphics' own position so a
 * tap can press it in by scale: a speaker, with sound waves when the meadow
 * is heard and a cross when it is not.
 */
export function drawMuteButton(
  graphics: Phaser.GameObjects.Graphics,
  r: number,
  muted: boolean,
): void {
  const ink = Math.max(2, r * 0.1);
  graphics.clear();
  graphics.fillStyle(PALETTE.hud, 0.55);
  graphics.fillCircle(0, 0, r);
  graphics.lineStyle(ink, PALETTE.ink, 0.8);
  graphics.strokeCircle(0, 0, r);

  const unit = r * 0.14;
  graphics.fillStyle(PALETTE.ink);
  graphics.fillRect(-4.2 * unit, -1.5 * unit, 2 * unit, 3 * unit);
  graphics.fillTriangle(
    -2.6 * unit,
    -1.5 * unit,
    0.6 * unit,
    -4 * unit,
    0.6 * unit,
    4 * unit,
  );
  graphics.fillTriangle(
    -2.6 * unit,
    -1.5 * unit,
    0.6 * unit,
    4 * unit,
    -2.6 * unit,
    1.5 * unit,
  );

  graphics.lineStyle(ink, PALETTE.ink);
  if (muted) {
    const at = 3 * unit;
    const arm = 1.4 * unit;
    graphics.lineBetween(at - arm, -arm, at + arm, arm);
    graphics.lineBetween(at - arm, arm, at + arm, -arm);
    return;
  }
  for (const reach of [2.2, 3.8]) {
    graphics.beginPath();
    graphics.arc(0, 0, reach * unit, -0.8, 0.8);
    graphics.strokePath();
  }
}
