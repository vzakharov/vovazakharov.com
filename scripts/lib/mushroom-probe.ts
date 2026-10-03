/**
 * What `play-mushrooms.ts` installs in the page it plays. The page-side
 * sources are strings evaluated there, so they reach into the scene's own
 * fields, and a rename in the scene breaks them only at play time; nothing in
 * them may close over a module import except through a `${…}` splice.
 * `mushroom-probe-answers.ts` parses what they answer.
 */

import { PROBE_INSTRUMENTS } from './mushroom-probe-instruments.ts';
import { PROBE_READS } from './mushroom-probe-reads.ts';

/** Swaps `Math.random` for a mulberry32 seeded with `seed` before the page's own code runs. */
export function seededRandom(seed: number): string {
  return `(() => {
  let state = ${String(seed)} >>> 0;
  Math.random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
})();`;
}

/**
 * Puts every scene's tweens on the stepped game clock, installed once the game
 * is up. Phaser times tweens by `Date.now()` with a lag skip, so under a
 * stepped loop a frame would show a puff or a drift wherever the wall clock
 * left it rather than where that frame's game time puts it.
 */
export const STEPPED_TWEENS = `(() => {
  const game = window.__game;
  let stepped;
  for (const name of ['headlessStep', 'step']) {
    const run = game[name].bind(game);
    game[name] = (time, delta) => {
      stepped = time;
      return run(time, delta);
    };
  }
  for (const { tweens } of game.scene.scenes) {
    let last = stepped;
    tweens.getDelta = () => {
      const delta = last === undefined || stepped === undefined ? 0 : stepped - last;
      last = stepped;
      tweens.time = (stepped ?? 0) / 1000;
      return delta;
    };
  }
  return true;
})()`;

/** Page-side helpers, installed as `window.__probe` once the game is up. */
export const PROBE = `(() => {${PROBE_INSTRUMENTS}  window.__probe = {${PROBE_READS}  };
})()`;
