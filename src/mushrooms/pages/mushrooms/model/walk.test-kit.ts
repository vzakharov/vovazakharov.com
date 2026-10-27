import type { Point } from '@/mushrooms/shared/lib/geometry';
import {
  type Camera,
  liftAt,
  moveTo,
  OPENING_EYE,
  openingWalk,
  pressAt,
  tickWalk,
  type Walk,
} from '@/mushrooms/shared/world';
import {
  meadowCamera,
  VIEWPORTS,
} from '@/mushrooms/entities/mushroom/index.node-safe';

export const FRAME = 1 / 60;
export const CAMERAS = VIEWPORTS.flatMap(([name, width, height]) => [
  { name, camera: meadowCamera(width, height) },
  { name: `${name} turned`, camera: meadowCamera(height, width) },
]);
export const TABLET = meadowCamera(1180, 820);

export function apart(one: Point, other: Point): number {
  return Math.hypot(one.x - other.x, one.y - other.y);
}

/** The shorter angle between two headings, in radians. */
export function turnedBy(from: number, to: number): number {
  const turn = (to - from) % (2 * Math.PI);
  return Math.abs(
    turn > Math.PI
      ? turn - 2 * Math.PI
      : turn < -Math.PI
        ? turn + 2 * Math.PI
        : turn,
  );
}

/** A clock and the walk it drives: each call runs `seconds` of frames, ticking the walk. */
export class Clock {
  time = 10;
  walk: Walk;
  constructor(walk: Walk) {
    this.walk = walk;
  }
  /** Runs `seconds`, a frame at a time, handing `each` the walk after every frame. */
  run(seconds: number, each?: (walk: Walk) => void): void {
    for (let spent = 0; spent < seconds - 1e-9; spent += FRAME) {
      this.time += FRAME;
      this.walk = tickWalk(this.walk, FRAME, this.time);
      each?.(this.walk);
    }
  }
  press(point: Point): void {
    this.walk = pressAt(this.walk, point, this.time);
  }
  move(point: Point): void {
    this.walk = moveTo(this.walk, point, this.time);
  }
  lift(): void {
    this.walk = liftAt(this.walk, this.time);
  }
  /** Drags the finger from where it is to `to` over `seconds`, a sample a frame. */
  drag(from: Point, to: Point, seconds: number): void {
    const frames = Math.round(seconds / FRAME);
    for (let frame = 1; frame <= frames; frame++) {
      this.run(FRAME);
      const share = frame / frames;
      this.move({
        x: from.x + (to.x - from.x) * share,
        y: from.y + (to.y - from.y) * share,
      });
    }
  }
}

export function shifted(point: Point, dx: number, dy: number): Point {
  return { x: point.x + dx, y: point.y + dy };
}

/** The opening walk on `camera` with its ground drags in flight. */
export function flying(camera: Camera): Walk {
  return openingWalk(camera, { eye: OPENING_EYE, gait: 'flight' });
}

/** The axis a walk's pressed finger is locked to, if any. */
export function axisOf(walk: Walk): string | undefined {
  return walk.drag?.lock?.axis;
}
