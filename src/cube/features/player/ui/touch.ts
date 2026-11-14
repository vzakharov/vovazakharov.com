import type { CanDispose } from '@/kernel/shared/typings';

import type { Point } from '@/scene/shared/lib/plane';

import type { Touched } from '../model/step';

/** CSS pixels a thumb travels from where it landed to push the stick full over. */
const STICK_REACH = 56;

/** Radians of look per CSS pixel a finger drags. */
const LOOK_PER_PIXEL = 0.006;

/** A touch let go within this many milliseconds… */
const TAP_MS = 300;
/** …having strayed no more than this many CSS pixels, is a tap. */
const TAP_SLOP = 12;

/** A finger down on the target, where it last was in CSS pixels. */
type Finger = Point & {
  id: number;
  /** When it landed, as the events stamp time. */
  landed: number;
  /** How far the finger has strayed since it landed, CSS pixels. */
  strayed: number;
};

export type TouchBinding = CanDispose & {
  /** This frame's touch; the look and the tap accumulated since the last read. */
  read: () => Touched;
  /** Whether the pointer last pressed on the target was a finger. */
  touching: () => boolean;
};

/**
 * Fingers on `target`: one landing on its left half is a stick, anchored
 * where it landed, that walks and strafes as it is pushed; one on the right
 * half looks as it drags. A short, still touch anywhere uses what is in reach.
 */
export function bindTouch(target: HTMLElement): TouchBinding {
  let stick: (Finger & { dx: number; dy: number }) | null = null;
  let look: Finger | null = null;
  let turn = 0;
  let tilt = 0;
  let use = false;
  let fingered = false;

  const onDown = (event: PointerEvent) => {
    fingered = event.pointerType === 'touch';
    if (!fingered) return;
    const { pointerId: id, clientX: x, clientY: y, timeStamp } = event;
    const finger = { id, x, y, landed: timeStamp, strayed: 0 };
    const { left, width } = target.getBoundingClientRect();
    if (x < left + width / 2) {
      if (stick !== null) return;
      stick = { ...finger, dx: 0, dy: 0 };
    } else {
      if (look !== null) return;
      look = finger;
    }
    target.setPointerCapture(id);
  };
  const onMove = (event: PointerEvent) => {
    const { pointerId: id, clientX: x, clientY: y } = event;
    if (stick?.id === id) {
      stick.dx = x - stick.x;
      stick.dy = y - stick.y;
      stick.strayed = Math.max(stick.strayed, Math.hypot(stick.dx, stick.dy));
    } else if (look?.id === id) {
      turn += (x - look.x) * LOOK_PER_PIXEL;
      tilt -= (y - look.y) * LOOK_PER_PIXEL;
      look.strayed += Math.hypot(x - look.x, y - look.y);
      look.x = x;
      look.y = y;
    }
  };
  const onUp = (event: PointerEvent) => {
    const { pointerId: id, timeStamp, type } = event;
    const finger = stick?.id === id ? stick : look?.id === id ? look : null;
    if (finger === null) return;
    const tapped =
      type === 'pointerup' &&
      timeStamp - finger.landed < TAP_MS &&
      finger.strayed < TAP_SLOP;
    if (tapped) use = true;
    if (finger === stick) stick = null;
    else look = null;
  };

  target.addEventListener('pointerdown', onDown);
  target.addEventListener('pointermove', onMove);
  target.addEventListener('pointerup', onUp);
  target.addEventListener('pointercancel', onUp);

  return {
    read() {
      // Pushed past its reach, the stick is still only full over.
      const over =
        stick === null
          ? 0
          : Math.max(STICK_REACH, Math.hypot(stick.dx, stick.dy));
      const touched: Touched = {
        walk: stick === null ? 0 : -stick.dy / over,
        strafe: stick === null ? 0 : stick.dx / over,
        yawBy: turn,
        elevationBy: tilt,
        use,
      };
      turn = 0;
      tilt = 0;
      use = false;
      return touched;
    },
    touching: () => fingered,
    dispose() {
      target.removeEventListener('pointerdown', onDown);
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerup', onUp);
      target.removeEventListener('pointercancel', onUp);
    },
  };
}
