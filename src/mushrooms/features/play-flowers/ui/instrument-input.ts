import * as Phaser from 'phaser';

import type { Direction } from '@/mushrooms/shared/lib/cruise';
import type { FlowerSound } from '@/mushrooms/entities/flower';

import { chordFingers } from './chord-fingers';
import type { Instrument } from './instrument';
import { listenForKeys } from './keyboard';
import {
  type Answers,
  type FlowerInView,
  type KeyedPlay,
  playKey,
} from './keyed-flowers';

/** What the keys move: the eye they turn, walk and strafe, held and let go. */
export type Looking = {
  readonly holdTurn: (direction: Direction) => void;
  readonly letGoTurn: (direction: Direction) => void;
  readonly holdWalk: (direction: Direction) => void;
  readonly letGoWalk: (direction: Direction) => void;
  readonly holdStrafe: (direction: Direction) => void;
  readonly letGoStrafe: (direction: Direction) => void;
};

export type ChordTapped = {
  chordTap: (object: Phaser.GameObjects.GameObject) => boolean;
};
export type Answering = Answers & { hush: (id: string) => void };

function ids(list: TouchList): number[] {
  return [...list].map(({ identifier }) => identifier);
}

/** What a key plants through: the open picker, the grass in view, and the flowers keys sowed since the last frame. */
export type SoundPlanting = {
  readonly plantSounding: (sound: FlowerSound) => boolean;
  readonly sowSounding: (sound: FlowerSound) => string | undefined;
  readonly sownInView: () => readonly FlowerInView[];
};

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
  flowers: ChordTapped,
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
 * through the flowers in front of the player, `planter` planting through
 * the open flower picker or growing the flower of a sound none in view makes
 * (`playKey`), the held move keys turning, walking and strafing `eye`, all of
 * it `waiting` while the map is open; `m` presses the map button through
 * `pressMap`, open or shut, and `Esc` presses it only to shut the open map;
 * and with more fingers than one (`listenForChords`). Returns what stops both.
 */
export function playTheMeadow(
  scene: Phaser.Scene,
  instrument: Instrument,
  flowers: ChordTapped & Answering,
  eye: Looking,
  planter: SoundPlanting,
  waiting: () => boolean,
  pressMap: () => void,
): () => void {
  const { canvas } = scene.game;
  const keyed: KeyedPlay = {
    inView: () => [...flowers.inView(), ...planter.sownInView()],
    answer: (answering) => {
      flowers.answer(answering);
    },
    plant: planter.plantSounding,
    sow: (sound) => {
      const sown = planter.sowSounding(sound);
      if (sown !== undefined) flowers.hush(sown);
    },
  };
  takeFocus(canvas);
  const stopKeys = listenForKeys(
    canvas,
    (action) => {
      if (action.kind === 'map') {
        pressMap();
        return;
      }
      // The meadow waits under the map: a key's press does nothing but close
      // it, its release still lets go.
      if (action.kind === 'close') {
        if (waiting()) pressMap();
        return;
      }
      if (waiting()) return;
      switch (action.kind) {
        case 'pan': {
          eye.holdTurn(action.direction);
          break;
        }
        case 'step': {
          eye.holdWalk(action.direction);
          break;
        }
        case 'strafe': {
          eye.holdStrafe(action.direction);
          break;
        }
        case 'note':
        case 'drum':
        case 'octave': {
          playKey(instrument, keyed, action);
          break;
        }
        default: {
          action satisfies never;
        }
      }
    },
    ({ kind, direction }) => {
      switch (kind) {
        case 'pan': {
          eye.letGoTurn(direction);
          break;
        }
        case 'step': {
          eye.letGoWalk(direction);
          break;
        }
        case 'strafe': {
          eye.letGoStrafe(direction);
          break;
        }
        default: {
          kind satisfies never;
        }
      }
    },
  );
  const stopChords = listenForChords(scene, flowers);
  return () => {
    stopKeys();
    stopChords();
  };
}
