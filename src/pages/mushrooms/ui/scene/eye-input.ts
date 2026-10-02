import * as Phaser from 'phaser';

import type { Direction } from '../../model/cruise';
import type { Point } from '../../model/geometry';
import type { Camera, Eye } from '../../model/ground';
import {
  eyeAt,
  heldStill,
  holdStrafe,
  holdTurn,
  holdWalk,
  letGoStrafe,
  letGoTurn,
  letGoWalk,
  liftAt,
  moveTo,
  openingWalk,
  pressAt,
  refit,
  tickWalk,
  type Walk,
} from '../../model/walk';
import { ofLayout, type View, viewAt } from './view';
import { layoutUnder } from './view-inverse';

/** Whether `object` stands fixed on the screen however the camera scrolls, as every control and picker button does. */
function isFixed(object: Phaser.GameObjects.GameObject): boolean {
  return 'scrollFactorX' in object && object.scrollFactorX === 0;
}

/**
 * The eye the scene's frames are seen from (`walk.ts`), and what moves it:
 * Phaser's one pointer, pressed anywhere but on a control, turns, walks or
 * strafes it, its axis locked once it leaves the slop; held arrow keys turn
 * it and walk it, and strafe it under Shift, ticked by the scene's clock whenever the eye is read. A press
 * still taps whatever it lands on, since the meadow answers taps on the
 * press. Every other finger plays a chord and never reaches Phaser
 * (`instrument-input.ts`), and any pointer but the one that pressed first is
 * ignored until it lifts. The screen and the layout convert here.
 */
export class EyeInput {
  private walk: Walk | undefined;
  /** When, on the scene's clock, the walk was last ticked. */
  private ticked = 0;
  /** The id of the pointer whose press moves the eye, until it lifts. */
  private holder: number | undefined;
  /** Seconds on the scene's clock, as of the last frame. */
  private readonly now: () => number;
  /** The camera the scene draws through, whose zoom is device pixels to a CSS pixel, which a pointer's position is given in. */
  private camera: Phaser.Cameras.Scene2D.Camera | undefined;

  constructor(now: () => number) {
    this.now = now;
  }

  /** Sees the meadow through `camera`: the opening eye the first time; after, the heading and the place kept. */
  fit(camera: Camera): void {
    const walk = this.current();
    this.walk = walk ? refit(walk, camera, this.now()) : openingWalk(camera);
  }

  /** The walk as of now: the keys' turn and walk ticked on by the time since it was last read. */
  private current(): Walk | undefined {
    const now = this.now();
    if (this.walk) this.walk = tickWalk(this.walk, now - this.ticked, now);
    this.ticked = now;
    return this.walk;
  }

  /** The eye now; none before the first `fit`. */
  eye(): Eye | undefined {
    const walk = this.current();
    return walk && eyeAt(walk, this.now());
  }

  /** The view a frame is drawn through now; none before the first `fit`. */
  view(): View | undefined {
    const walk = this.current();
    return walk && viewAt(walk.lens, eyeAt(walk, this.now()));
  }

  /** How far the eye has walked in all, in the clump's size: what the bob and the footsteps count. */
  walked(): number {
    return this.current()?.stride.walked ?? 0;
  }

  /**
   * How long, in seconds, the pressed finger has stood inside the slop: a
   * candidate long press while it does. None once it has turned or stepped,
   * or with no finger down.
   */
  heldStill(): number | undefined {
    const walk = this.current();
    return walk && heldStill(walk, this.now());
  }

  /**
   * `point`, in the layout's world px, where the screen shows it now, standing
   * over the ground row `footRow` (its own row for a point on the ground);
   * bound, so it passes as it is.
   */
  readonly toScreen = <Placed extends Point>(
    point: Placed,
    footRow = point.y,
  ): Placed => {
    const view = this.view();
    if (!view) return point;
    const { x, y } = ofLayout(view, point, footRow);
    return { ...point, x, y };
  };

  /**
   * The ground under `point`, on the screen in CSS px, in the layout's world
   * px; none above the horizon, or for ground behind the opening eye, which
   * the layout does not reach. Bound, so it passes as it is.
   */
  readonly toLayout = <Placed extends Point>(
    point: Placed,
  ): Placed | undefined => {
    const view = this.view();
    const layout = view && layoutUnder(view, point);
    return layout && { ...point, ...layout };
  };

  /** `←` or `→` went down; its repeats change nothing. */
  holdTurn(direction: Direction): void {
    const walk = this.current();
    if (walk) this.walk = holdTurn(walk, direction, this.now());
  }

  letGoTurn(direction: Direction): void {
    const walk = this.current();
    if (walk) this.walk = letGoTurn(walk, direction);
  }

  /** `↑` or `↓` went down; its repeats change nothing. */
  holdWalk(direction: Direction): void {
    const walk = this.current();
    if (walk) this.walk = holdWalk(walk, direction);
  }

  letGoWalk(direction: Direction): void {
    const walk = this.current();
    if (walk) this.walk = letGoWalk(walk, direction);
  }

  /** Shift with `←` or `→` went down; its repeats change nothing. */
  holdStrafe(direction: Direction): void {
    const walk = this.current();
    if (walk) this.walk = holdStrafe(walk, direction);
  }

  letGoStrafe(direction: Direction): void {
    const walk = this.current();
    if (walk) this.walk = letGoStrafe(walk, direction);
  }

  /** Lets `scene`'s pointer turn and walk the eye. Returns what stops it. */
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

  /** `pointer` on the screen in CSS px, and when, in seconds on the scene's clock. */
  private sample(pointer: Phaser.Input.Pointer): [at: Point, time: number] {
    const zoom = this.camera?.zoom ?? 1;
    // `time` is the event's own stamp, on the clock the frames run on, so a
    // finger's velocity is measured between its events, not between frames.
    return [{ x: pointer.x / zoom, y: pointer.y / zoom }, pointer.time / 1000];
  }

  private readonly pressed = (
    pointer: Phaser.Input.Pointer,
    over: readonly Phaser.GameObjects.GameObject[],
  ): void => {
    const walk = this.current();
    if (
      !walk ||
      this.holder !== undefined ||
      over.some((object) => isFixed(object))
    )
      return;
    this.holder = pointer.id;
    this.walk = pressAt(walk, ...this.sample(pointer));
  };

  private readonly moved = (pointer: Phaser.Input.Pointer): void => {
    const walk = this.current();
    if (!walk || pointer.id !== this.holder) return;
    this.walk = moveTo(walk, ...this.sample(pointer));
  };

  private readonly lifted = (pointer: Phaser.Input.Pointer): void => {
    const walk = this.current();
    if (!walk || pointer.id !== this.holder) return;
    this.holder = undefined;
    this.walk = liftAt(walk, this.sample(pointer)[1]);
  };
}
