import * as Phaser from 'phaser';

import { playTheMeadow } from './instrument-input';
import type { MapView } from './map-view';
import type { MeadowSound } from './sound';

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
  eye: Played[3];
  planter: Played[4];
  /** Started on a tap's release, as a browser lets sound start only there. */
  voice: Pick<MeadowSound, 'start' | 'stop'>;
  /** The meadow's keys wait while it is open. */
  map: Pick<MapView, 'open'>;
};

/**
 * Binds the scene's resize, press and release, the keys and chords that play
 * the meadow, and the pointer that turns and walks the eye; on the scene's
 * shutdown lets go of all of them and stops the sound.
 */
export function listenOnMeadow(
  scene: Phaser.Scene,
  { resize, tap, instrument, flowers, eye, planter, voice, map }: MeadowPieces,
): void {
  const { scale, input, events } = scene;
  const release = () => {
    voice.start();
  };
  const stops = [
    playTheMeadow(scene, instrument, flowers, eye, planter, () => map.open),
    eye.listen(scene),
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
