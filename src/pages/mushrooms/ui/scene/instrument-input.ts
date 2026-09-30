import * as Phaser from 'phaser';

import { chordFingers } from './chord-fingers';
import type { FlowerBed } from './flower-bed';
import type { Instrument } from './instrument';
import { listenForKeys } from './keyboard';

function ids(list: TouchList): number[] {
  return [...list].map(({ identifier }) => identifier);
}

/** An identifier no Phaser pointer holds, for the pointer a chord's finger is hit-tested with. */
const CHORD_POINTER = 99;

/**
 * Lets `scene`'s flowers be played as an instrument beyond one finger's
 * taps: from the keyboard while the canvas holds focus (`listenForKeys`), a
 * played key opening the flowers of its sound in sight; and with more
 * fingers than one, each finger past the first playing the flower under it
 * and nothing else, so every other gesture keeps to one finger — Phaser,
 * taking one pointer, never sees the rest. Returns what stops both.
 */
export function playTheFlowers(
  scene: Phaser.Scene,
  instrument: Instrument,
  flowers: FlowerBed,
): () => void {
  const { canvas } = scene.game;
  // The canvas is the game's one widget: it takes focus, so the keyboard
  // plays it while the game is in front, and never the page's other keys.
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'application');
  canvas.focus({ preventScroll: true });
  const stopKeys = listenForKeys(canvas, (action) => {
    instrument.wake();
    const sound = instrument.key(action);
    if (sound) flowers.answer(sound);
  });

  const pointer = new Phaser.Input.Pointer(scene.input.manager, CHORD_POINTER);
  const touched = (event: TouchEvent) => {
    const chord = chordFingers(ids(event.changedTouches), ids(event.touches));
    for (const touch of event.changedTouches) {
      if (!chord.includes(touch.identifier)) continue;
      scene.input.manager.transformPointer(
        pointer,
        touch.pageX,
        touch.pageY,
        false,
      );
      const over = scene.input.sortGameObjects(
        scene.input.hitTestPointer(pointer),
        pointer,
      );
      const top = over[0];
      if (top) flowers.chordTap(top);
    }
  };
  canvas.addEventListener('touchstart', touched, { passive: true });

  return () => {
    stopKeys();
    canvas.removeEventListener('touchstart', touched);
  };
}
