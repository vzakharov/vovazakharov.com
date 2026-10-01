import * as Phaser from 'phaser';

import { chordFingers } from './chord-fingers';
import type { EyeInput } from './eye-input';
import type { FlowerBed } from './flower-bed';
import type { Instrument } from './instrument';
import { listenForKeys } from './keyboard';
import { type KeyedPlay, playKey } from './keyed-flowers';

function ids(list: TouchList): number[] {
  return [...list].map(({ identifier }) => identifier);
}

/** An identifier no Phaser pointer holds, for the pointer a chord's finger is hit-tested with. */
const CHORD_POINTER = 99;

/**
 * Lets `canvas` take the keyboard: it is the game's one widget, so it takes
 * focus, and the keyboard plays it while the game is in front, and never the
 * page's other keys.
 */
function takeFocus(canvas: HTMLCanvasElement): void {
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'application');
  canvas.focus({ preventScroll: true });
}

/**
 * Lets every finger past Phaser's one touch pointer play the flower under it
 * and nothing else, so every other gesture keeps to one finger — Phaser
 * never sees the rest. Returns what stops it.
 */
function listenForChords(
  scene: Phaser.Scene,
  flowers: Pick<FlowerBed, 'chordTap'>,
): () => void {
  const { canvas } = scene.game;
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
    canvas.removeEventListener('touchstart', touched);
  };
}

/**
 * Lets `scene`'s flowers be played as an instrument beyond one finger's
 * taps: from the keyboard while the canvas holds focus (`listenForKeys`),
 * only through the flowers in front of the player (`playKey`), the held
 * arrows turning and walking `eye`; and with more fingers than one
 * (`listenForChords`). Returns what stops both.
 */
export function playTheMeadow(
  scene: Phaser.Scene,
  instrument: Instrument,
  flowers: Pick<FlowerBed, 'chordTap' | 'inView' | 'answer'>,
  eye: EyeInput,
): () => void {
  const { canvas } = scene.game;
  const keyed: KeyedPlay = {
    inView: () => flowers.inView(),
    answer: (answering) => {
      flowers.answer(answering);
    },
  };
  takeFocus(canvas);
  const stopKeys = listenForKeys(
    canvas,
    (action) => {
      if (action.kind === 'pan') eye.holdTurn(action.direction);
      else if (action.kind === 'step') eye.holdWalk(action.direction);
      else playKey(instrument, keyed, action);
    },
    (key) => {
      if (key.kind === 'pan') eye.letGoTurn(key.direction);
      else eye.letGoWalk(key.direction);
    },
  );
  const stopChords = listenForChords(scene, flowers);
  return () => {
    stopKeys();
    stopChords();
  };
}
