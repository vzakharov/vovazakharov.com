import * as Phaser from 'phaser';

import { openStore } from '../../api/meadow-store';
import { type Opening, openKept } from '../../api/open-kept';
import { MeadowScene, PIXEL_RATIO_KEY } from './meadow-scene';
import { PALETTE } from './palette';

/** Past this, a denser buffer costs fill rate without a visible gain. */
const MAX_PIXEL_RATIO = 3;

/**
 * Runs the game inside `parent`, filling it, once the meadow the page's hash
 * names is open (`openKept`), and returns what stops it, the opening too if
 * it is still under way. A failed opening goes to `onError`, reported as an
 * uncaught error (`reportError`) where nothing is passed.
 */
export function startGame(
  parent: HTMLElement,
  onError: (error: unknown) => void = reportError,
): () => void {
  let stop: (() => void) | undefined;
  let stopped = false;
  openStore()
    .then(async (store) => openKept(location, history, store))
    .then((opening) => {
      if (!stopped) stop = run(parent, opening);
    })
    .catch(onError);
  return () => {
    stopped = true;
    stop?.();
  };
}

/**
 * Runs the game on `opening` inside `parent`, and returns what stops it. The
 * canvas buffer is sized in device pixels and shown at the parent's CSS size
 * (the scale manager's zoom is the inverse ratio); Phaser's own `RESIZE` mode
 * sizes it in CSS pixels, which blurs every dense screen.
 */
function run(parent: HTMLElement, opening: Opening): () => void {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    transparent: false,
    // What shows before the first paint: the sky, not black.
    backgroundColor: PALETTE.skyTop,
    scale: { mode: Phaser.Scale.NONE, width: 1, height: 1 },
    antialias: true,
    scene: [new MeadowScene(opening)],
  });

  const fit = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    game.registry.set(PIXEL_RATIO_KEY, ratio);
    game.scale.setZoom(1 / ratio);
    game.scale.resize(parent.clientWidth * ratio, parent.clientHeight * ratio);
  };
  fit();
  // A probe build hands the game to `scripts/play-mushrooms.ts`, which steps
  // and taps it; every other build compiles this out.
  if (process.env.NEXT_PUBLIC_MUSHROOM_PROBE !== undefined) {
    Object.assign(globalThis, { __game: game });
  }
  const observer = new ResizeObserver(fit);
  observer.observe(parent);

  return () => {
    observer.disconnect();
    game.destroy(true);
  };
}
