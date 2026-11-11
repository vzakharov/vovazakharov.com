import { asError } from '@/kernel/shared/lib/error-class';

import type { Input } from '../model/step';

/** Radians of look per pixel of mouse travel. */
const LOOK_PER_PIXEL = 0.0025;

type Axis = 'walk' | 'strafe' | 'turnKeys' | 'tiltKeys';

/** Keys by physical position (`KeyboardEvent.code`), so any layout walks. */
const AXES = {
  KeyW: { axis: 'walk', sign: 1 },
  KeyS: { axis: 'walk', sign: -1 },
  KeyD: { axis: 'strafe', sign: 1 },
  KeyA: { axis: 'strafe', sign: -1 },
  ArrowRight: { axis: 'turnKeys', sign: 1 },
  ArrowLeft: { axis: 'turnKeys', sign: -1 },
  ArrowUp: { axis: 'tiltKeys', sign: 1 },
  ArrowDown: { axis: 'tiltKeys', sign: -1 },
} as const satisfies Record<string, { axis: Axis; sign: 1 | -1 }>;

type Code = keyof typeof AXES;

const isCode = (code: string): code is Code => Object.hasOwn(AXES, code);

/** The key that pulls a lever, by position as the axes are. */
const PULL = 'KeyE';

/** Whether keys typed at `target` are text, not a move. */
const isTextField = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLInputElement &&
      !['button', 'checkbox', 'radio', 'range', 'reset', 'submit'].includes(
        target.type,
      )));

export type InputBinding = {
  /** This frame's input; the look deltas accumulated since the last read. */
  read: () => Input;
  dispose: () => void;
};

/**
 * Keyboard and pointer-lock mouse bound to `target`. Keys move whenever the
 * page has focus, except while typing into a text field; a click on `target`
 * takes the pointer lock, and only while it is held does the mouse look. A
 * refused lock goes to `onError`.
 */
export function bindInput(
  target: HTMLElement,
  onError: (error: Error) => void,
): InputBinding {
  const held = new Set<Code>();
  let turn = 0;
  let tilt = 0;
  let pull = false;
  const locked = () => document.pointerLockElement === target;

  // Older engines return nothing rather than a promise, hence the `resolve`.
  const onClick = () => {
    if (!locked()) {
      Promise.resolve(target.requestPointerLock()).catch((error: unknown) => {
        onError(asError(error));
      });
    }
  };
  const onMove = (event: MouseEvent) => {
    if (!locked()) return;
    turn += event.movementX * LOOK_PER_PIXEL;
    tilt -= event.movementY * LOOK_PER_PIXEL;
  };
  const onKey = (event: KeyboardEvent) => {
    const { code, type, ctrlKey, metaKey, repeat, target: on } = event;
    if (code === PULL && type === 'keydown' && !repeat) {
      if (isTextField(on) || ctrlKey || metaKey) return;
      event.preventDefault();
      pull = true;
      return;
    }
    if (!isCode(code)) return;
    if (type === 'keyup') {
      held.delete(code);
      return;
    }
    if (isTextField(on) || ctrlKey || metaKey) return;
    event.preventDefault();
    held.add(code);
  };
  const onBlur = () => {
    held.clear();
  };

  target.addEventListener('click', onClick);
  document.addEventListener('mousemove', onMove);
  globalThis.addEventListener('keydown', onKey);
  globalThis.addEventListener('keyup', onKey);
  globalThis.addEventListener('blur', onBlur);

  return {
    read() {
      const input: Input = {
        walk: 0,
        strafe: 0,
        turnKeys: 0,
        tiltKeys: 0,
        yawBy: turn,
        elevationBy: tilt,
        pull,
      };
      for (const code of held) {
        const { axis, sign } = AXES[code];
        input[axis] += sign;
      }
      turn = 0;
      tilt = 0;
      pull = false;
      return input;
    },
    dispose() {
      target.removeEventListener('click', onClick);
      document.removeEventListener('mousemove', onMove);
      globalThis.removeEventListener('keydown', onKey);
      globalThis.removeEventListener('keyup', onKey);
      globalThis.removeEventListener('blur', onBlur);
      if (locked()) document.exitPointerLock();
    },
  };
}
