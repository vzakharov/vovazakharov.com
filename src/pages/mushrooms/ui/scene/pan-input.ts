import * as Phaser from 'phaser';

import type { Point } from '../../model/geometry';
import {
  type Direction,
  holdKey,
  leftAt,
  letGoKey,
  move,
  openingPan,
  type Pan,
  press,
  recrop,
  release,
  screenOf,
  tick,
  type View,
  worldOf,
} from '../../model/pan';

/** Whether `object` stands fixed on the screen however the camera scrolls, as every control and picker button does. */
function isFixed(object: Phaser.GameObjects.GameObject): boolean {
  return 'scrollFactorX' in object && object.scrollFactorX === 0;
}

/**
 * The crop the scene's camera shows (`pan.ts`), and what moves it: Phaser's
 * one pointer, pressed anywhere but on a control, drags it; a held arrow
 * key turns it, ticked by the scene's clock whenever the crop is read.
 * A press still taps whatever it lands on, since the meadow answers taps on
 * the press; only a finger that moves past the slop pans. Every other
 * finger plays a chord and never reaches Phaser (`instrument-input.ts`), and
 * any pointer but the one that pressed first is ignored until it lifts.
 * Screen and world convert here and nowhere else.
 */
export class Crop {
  private pan: Pan | undefined;
  /** When, on the scene's clock, the pan was last ticked. */
  private ticked = 0;
  /** The id of the pointer whose press moves the crop, until it lifts. */
  private holder: number | undefined;
  /** Seconds on the scene's clock, as of the last frame. */
  private readonly now: () => number;
  /** The camera the crop scrolls, whose zoom is device pixels to a CSS pixel, which a pointer's position is given in. */
  private camera: Phaser.Cameras.Scene2D.Camera | undefined;

  constructor(now: () => number) {
    this.now = now;
  }

  /** Takes the crop across `view`: the visit's opening crop the first time, a re-crop round the screen's centre after. */
  fit(view: View): void {
    const pan = this.current();
    this.pan = pan ? recrop(pan, view, this.now()) : openingPan(view);
  }

  /**
   * The pan as of now: a held key's turn ticked on by the time since it was
   * last read, which the scene's clock, being the frames', steps a frame at
   * a time.
   */
  private current(): Pan | undefined {
    const now = this.now();
    if (this.pan) this.pan = tick(this.pan, now - this.ticked);
    this.ticked = now;
    return this.pan;
  }

  /** The crop's left edge now, in world px; 0 before the first paint. */
  left(): number {
    const pan = this.current();
    return pan ? leftAt(pan, this.now()) : 0;
  }

  /** Scrolls `camera` to the crop as it stands now. */
  scroll(camera: Phaser.Cameras.Scene2D.Camera): void {
    camera.setScroll(this.left(), 0);
  }

  /** `point`, in world px, where the screen shows it now; bound, so it passes as it is. */
  readonly toScreen = <Placed extends Point>(point: Placed): Placed => {
    const pan = this.current();
    return pan ? { ...point, x: screenOf(pan, this.now(), point.x) } : point;
  };

  /** `point`, across the screen in CSS px, where it lies in the world now; bound, so it passes as it is. */
  readonly toWorld = <Placed extends Point>(point: Placed): Placed => {
    const pan = this.current();
    return pan ? { ...point, x: worldOf(pan, this.now(), point.x) } : point;
  };

  /** Whether the screen shows the world's `x` now. */
  shows(x: number): boolean {
    const pan = this.current();
    if (!pan) return false;
    const across = screenOf(pan, this.now(), x);
    return across >= 0 && across <= pan.width;
  }

  /** The arrow key for `direction` went down (`holdKey`); its repeats change nothing. */
  hold(direction: Direction): void {
    const pan = this.current();
    if (pan) this.pan = holdKey(pan, direction, this.now());
  }

  /** The arrow key for `direction` came up (`letGoKey`). */
  letGo(direction: Direction): void {
    const pan = this.current();
    if (pan) this.pan = letGoKey(pan, direction);
  }

  /** Lets `scene`'s pointer drag the crop. Returns what stops it. */
  listen(scene: Phaser.Scene): () => void {
    const { input, cameras } = scene;
    this.camera = cameras.main;
    input.on(Phaser.Input.Events.POINTER_DOWN, this.pressed, this);
    input.on(Phaser.Input.Events.POINTER_MOVE, this.moved, this);
    input.on(Phaser.Input.Events.POINTER_UP, this.lifted, this);
    input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.lifted, this);
    return () => {
      input.off(Phaser.Input.Events.POINTER_DOWN, this.pressed, this);
      input.off(Phaser.Input.Events.POINTER_MOVE, this.moved, this);
      input.off(Phaser.Input.Events.POINTER_UP, this.lifted, this);
      input.off(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.lifted, this);
    };
  }

  /** `pointer` across the screen in CSS px, and when, in seconds on the scene's clock. */
  private sample(pointer: Phaser.Input.Pointer): [x: number, time: number] {
    // `time` is the event's own stamp, on the clock the frames run on, so a
    // finger's velocity is measured between its events, not between frames.
    return [pointer.x / (this.camera?.zoom ?? 1), pointer.time / 1000];
  }

  private readonly pressed = (
    pointer: Phaser.Input.Pointer,
    over: readonly Phaser.GameObjects.GameObject[],
  ): void => {
    const pan = this.current();
    if (
      !pan ||
      this.holder !== undefined ||
      over.some((object) => isFixed(object))
    )
      return;
    this.holder = pointer.id;
    this.pan = press(pan, ...this.sample(pointer));
  };

  private readonly moved = (pointer: Phaser.Input.Pointer): void => {
    if (!this.pan || pointer.id !== this.holder) return;
    this.pan = move(this.pan, ...this.sample(pointer));
  };

  private readonly lifted = (pointer: Phaser.Input.Pointer): void => {
    if (!this.pan || pointer.id !== this.holder) return;
    this.holder = undefined;
    this.pan = release(this.pan, this.sample(pointer)[1]);
  };
}
