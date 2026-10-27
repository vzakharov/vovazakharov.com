import * as Phaser from 'phaser';

import type { Hushing } from '@/kernel/shared/typings';

import { playTheMeadow, type Waking } from '@/mushrooms/features/play-flowers';
import type { Unfolding } from '@/mushrooms/widgets/map';

import type { Binding } from './meadow-keeping';

type Played = Parameters<typeof playTheMeadow>;

/** What of the scene the meadow's listeners act through. */
type MeadowPieces = {
  resize: () => void;
  /** A tap's press, with the game objects under it. */
  tap: (
    pointer: Phaser.Input.Pointer,
    over: readonly Phaser.GameObjects.GameObject[],
  ) => void;
  instrument: Played[1];
  flowers: Played[2];
  /** The eye the keys move, and the pointer it listens to. */
  eye: Played[3] & { listen: (scene: Phaser.Scene) => () => void };
  planter: Played[4];
  /** Started on a tap's release, as a browser lets sound start only there. */
  voice: Waking & Hushing;
  /** The meadow's keys wait while it is open. */
  map: Unfolding;
  /** The map button's press, which `m` makes too, and `Esc` while the map is open. */
  fold: () => void;
  /** The tab hiding and the hash edited, while the meadow is kept. */
  keeping: Binding;
};

/**
 * Binds the scene's resize, press and release, the keys and chords that play
 * the meadow, and the pointer that turns and walks the eye; on the scene's
 * shutdown lets go of all of them and stops the sound.
 */
export function listenOnMeadow(
  scene: Phaser.Scene,
  pieces: MeadowPieces,
): void {
  const { resize, tap, instrument, flowers, eye, planter, voice } = pieces;
  const { map, fold, keeping } = pieces;
  const { scale, input, events } = scene;
  const release = () => {
    voice.start();
  };
  const waiting = () => map.open;
  const stops = [
    playTheMeadow(scene, instrument, flowers, eye, planter, waiting, fold),
    eye.listen(scene),
    keeping.bind(),
  ];
  scale.on(Phaser.Scale.Events.RESIZE, resize);
  input.on(Phaser.Input.Events.POINTER_DOWN, tap);
  input.on(Phaser.Input.Events.POINTER_UP, release);
  events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scale.off(Phaser.Scale.Events.RESIZE, resize);
    input.off(Phaser.Input.Events.POINTER_DOWN, tap);
    input.off(Phaser.Input.Events.POINTER_UP, release);
    for (const stop of stops) stop();
    voice.stop();
  });
}
