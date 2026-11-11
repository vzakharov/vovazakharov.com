import type { Input } from '../model/step';

/** Radians of look per pixel of mouse travel. */
const LOOK_PER_PIXEL = 0.0025;

/** Keys by physical position (`KeyboardEvent.code`), so any layout walks. */
const AXES = {
  KeyW: { axis: 'walk', sign: 1 },
  KeyS: { axis: 'walk', sign: -1 },
  KeyD: { axis: 'strafe', sign: 1 },
  KeyA: { axis: 'strafe', sign: -1 },
} as const satisfies Record<string, { axis: 'walk' | 'strafe'; sign: 1 | -1 }>;

type Code = keyof typeof AXES;

const isCode = (code: string): code is Code => Object.hasOwn(AXES, code);

export type InputBinding = {
  /** This frame's input; the look deltas accumulated since the last read. */
  read: () => Input;
  dispose: () => void;
};

/**
 * Keyboard and pointer-lock mouse bound to `target`: a click on it takes the
 * pointer lock, and only while the lock is held do keys walk and the mouse
 * look, so typing elsewhere on the page moves nobody.
 */
export function bindInput(target: HTMLElement): InputBinding {
  const held = new Set<Code>();
  let turn = 0;
  let tilt = 0;
  const locked = () => document.pointerLockElement === target;

  // Older engines return nothing rather than a promise, hence the `resolve`;
  // a refused lock reaches the page's error reporting like any uncaught one.
  const onClick = () => {
    if (!locked()) {
      Promise.resolve(target.requestPointerLock()).catch(reportError);
    }
  };
  const onMove = (event: MouseEvent) => {
    if (!locked()) return;
    turn += event.movementX * LOOK_PER_PIXEL;
    tilt -= event.movementY * LOOK_PER_PIXEL;
  };
  const onKey = (event: KeyboardEvent) => {
    const { code } = event;
    if (!isCode(code) || !locked()) return;
    event.preventDefault();
    if (event.type === 'keydown') held.add(code);
    else held.delete(code);
  };
  const release = () => {
    if (!locked()) held.clear();
  };

  target.addEventListener('click', onClick);
  document.addEventListener('mousemove', onMove);
  document.addEventListener('pointerlockchange', release);
  globalThis.addEventListener('keydown', onKey);
  globalThis.addEventListener('keyup', onKey);
  const onBlur = () => {
    held.clear();
  };
  globalThis.addEventListener('blur', onBlur);

  return {
    read() {
      const input: Input = { walk: 0, strafe: 0, yawBy: turn, pitchBy: tilt };
      for (const code of held) {
        const { axis, sign } = AXES[code];
        input[axis] += sign;
      }
      turn = 0;
      tilt = 0;
      return input;
    },
    dispose() {
      target.removeEventListener('click', onClick);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('pointerlockchange', release);
      globalThis.removeEventListener('keydown', onKey);
      globalThis.removeEventListener('keyup', onKey);
      globalThis.removeEventListener('blur', onBlur);
      if (locked()) document.exitPointerLock();
    },
  };
}
