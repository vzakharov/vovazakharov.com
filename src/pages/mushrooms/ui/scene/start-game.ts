import * as Phaser from 'phaser';

import { MeadowScene, PIXEL_RATIO_KEY } from './meadow-scene';
import { PALETTE } from './palette';

/** Past this, a denser buffer costs fill rate without a visible gain. */
const MAX_PIXEL_RATIO = 3;

/**
 * Runs the game inside `parent`, filling it, and returns what stops it. The
 * canvas buffer is sized in device pixels and shown at the parent's CSS size
 * (the scale manager's zoom is the inverse ratio); Phaser's own `RESIZE` mode
 * sizes it in CSS pixels, which blurs every dense screen.
 */
export function startGame(parent: HTMLElement): () => void {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    transparent: false,
    // What shows before the first paint: the sky, not black.
    backgroundColor: PALETTE.skyTop,
    scale: { mode: Phaser.Scale.NONE, width: 1, height: 1 },
    antialias: true,
    scene: [MeadowScene],
  });

  const fit = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    game.registry.set(PIXEL_RATIO_KEY, ratio);
    game.scale.setZoom(1 / ratio);
    game.scale.resize(parent.clientWidth * ratio, parent.clientHeight * ratio);
  };
  fit();
  const observer = new ResizeObserver(fit);
  observer.observe(parent);

  return () => {
    observer.disconnect();
    game.destroy(true);
  };
}
