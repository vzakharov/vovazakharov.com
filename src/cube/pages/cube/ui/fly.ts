import { asError } from '@/kernel/shared/lib/error-class';

import { type Pose, rebase, ROOM_HEIGHT } from '@/cube/entities/world';

import type { FrameHook } from './cube-scene';

/** Room sides a second, and how much faster with Shift held. */
const SPEED = 0.28;
const SPRINT = 4;
/** Radians per pixel of mouse movement. */
const LOOK = 0.0025;
const PITCH_LIMIT = (89 * Math.PI) / 180;
/** How close the eye may come to its floor's slab and ceiling. */
const MARGIN = 0.02;

/**
 * A free fly through the walls of the eye's floor, until the player feature
 * moves the eye: WASD along the look, Space and C up and down, Shift faster,
 * the mouse looking once a click has locked the pointer.
 */
export function installFly(
  canvas: HTMLCanvasElement,
  onError: (error: Error) => void,
): {
  onFrame: FrameHook;
  dispose: () => void;
} {
  const held = new Set<string>();
  let turn = 0;
  let tilt = 0;
  const down = (event: KeyboardEvent) => {
    held.add(event.code);
  };
  const up = (event: KeyboardEvent) => {
    held.delete(event.code);
  };
  const look = (event: MouseEvent) => {
    if (document.pointerLockElement !== canvas) return;
    turn += event.movementX * LOOK;
    tilt -= event.movementY * LOOK;
  };
  const lock = () => {
    canvas.requestPointerLock().catch((error: unknown) => {
      onError(asError(error));
    });
  };
  const release = () => {
    held.clear();
  };
  globalThis.addEventListener('keydown', down);
  globalThis.addEventListener('keyup', up);
  globalThis.addEventListener('blur', release);
  document.addEventListener('mousemove', look);
  canvas.addEventListener('click', lock);

  const axis = (plus: string, minus: string) =>
    (held.has(plus) ? 1 : 0) - (held.has(minus) ? 1 : 0);

  const onFrame: FrameHook = (pose: Pose, seconds: number) => {
    const yaw = pose.yaw + turn;
    const pitch = Math.max(
      -PITCH_LIMIT,
      Math.min(PITCH_LIMIT, pose.elevation + tilt),
    );
    turn = 0;
    tilt = 0;
    const step =
      SPEED *
      seconds *
      (held.has('ShiftLeft') || held.has('ShiftRight') ? SPRINT : 1);
    const ahead = axis('KeyW', 'KeyS') * step;
    const aside = axis('KeyD', 'KeyA') * step;
    const rise = axis('Space', 'KeyC') * step;
    return rebase({
      ...pose,
      yaw,
      elevation: pitch,
      u: pose.u + ahead * Math.cos(yaw) - aside * Math.sin(yaw),
      v: pose.v + ahead * Math.sin(yaw) + aside * Math.cos(yaw),
      eyeAbove: Math.max(
        MARGIN,
        Math.min(ROOM_HEIGHT - MARGIN, pose.eyeAbove + rise),
      ),
    });
  };

  return {
    onFrame,
    dispose: () => {
      globalThis.removeEventListener('keydown', down);
      globalThis.removeEventListener('keyup', up);
      globalThis.removeEventListener('blur', release);
      document.removeEventListener('mousemove', look);
      canvas.removeEventListener('click', lock);
    },
  };
}
