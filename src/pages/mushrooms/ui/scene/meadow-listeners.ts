import * as Phaser from 'phaser';

/** What the meadow answers on the scene's own events. */
type MeadowHandlers = {
  resize: () => void;
  /** A tap's press, with the game objects under it. */
  tap: (
    pointer: Phaser.Input.Pointer,
    over: readonly Phaser.GameObjects.GameObject[],
  ) => void;
  /** A tap's release: a browser lets sound start only there. */
  release: () => void;
};

/**
 * Binds `handlers` to the scene's resize, press and release, and on the
 * scene's shutdown lets go of them and runs each of `stops` — the meadow's
 * other listeners' unbinding, and the sound's stop — in order.
 */
export function listenOnMeadow(
  scene: Phaser.Scene,
  { resize, tap, release }: MeadowHandlers,
  stops: ReadonlyArray<() => void>,
): void {
  const { scale, input, events } = scene;
  scale.on(Phaser.Scale.Events.RESIZE, resize);
  input.on(Phaser.Input.Events.POINTER_DOWN, tap);
  input.on(Phaser.Input.Events.POINTER_UP, release);
  events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scale.off(Phaser.Scale.Events.RESIZE, resize);
    input.off(Phaser.Input.Events.POINTER_DOWN, tap);
    input.off(Phaser.Input.Events.POINTER_UP, release);
    for (const stop of stops) stop();
  });
}
