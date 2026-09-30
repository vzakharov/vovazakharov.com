import * as Phaser from 'phaser';

import { chordFingers } from './chord-fingers';
import type { FlowerBed } from './flower-bed';
import type { Instrument } from './instrument';
import { listenForKeys } from './keyboard';
import type { Crop } from './pan-input';

function ids(list: TouchList): number[] {
  return [...list].map(({ identifier }) => identifier);
}

/** An identifier no Phaser pointer holds, for the pointer a chord's finger is hit-tested with. */
const CHORD_POINTER = 99;

/**
 * Lets `scene`'s flowers be played as an instrument beyond one finger's
 * taps: from the keyboard while the canvas holds focus (`listenForKeys`), a
 * played key opening the flowers of its sound the screen shows, and the
 * arrows stepping `crop`; and with more
 * fingers than one, each finger Phaser's one touch pointer does not hold
 * playing the flower under it and nothing else, so every other gesture keeps
 * to one finger — Phaser never sees the rest. Returns what stops both.
 */
export function playTheFlowers(
  scene: Phaser.Scene,
  instrument: Instrument,
  flowers: FlowerBed,
  crop: Crop,
): () => void {
  const { canvas } = scene.game;
  // The canvas is the game's one widget: it takes focus, so the keyboard
  // plays it while the game is in front, and never the page's other keys.
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'application');
  canvas.focus({ preventScroll: true });
  const stopKeys = listenForKeys(canvas, (action) => {
    if (action.kind === 'pan') {
      crop.step(action.direction);
      return;
    }
    instrument.wake();
    const sound = instrument.key(action);
    if (sound) {
      flowers.answer(sound, (x) => crop.shows(x));
    }
  });

  const { manager, pointer1 } = scene.input;
  const pointer = new Phaser.Input.Pointer(manager, CHORD_POINTER);
  // Phaser listens on the canvas from boot, before this does, so by the time
  // this runs its pointer has already taken the finger it answers.
  const touched = (event: TouchEvent) => {
    const chord = chordFingers(
      ids(event.changedTouches),
      pointer1.active ? pointer1.identifier : undefined,
    );
    for (const touch of event.changedTouches) {
      if (!chord.includes(touch.identifier)) continue;
      manager.transformPointer(pointer, touch.pageX, touch.pageY, false);
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
