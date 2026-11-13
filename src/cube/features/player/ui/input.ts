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

/** The key that takes a pill or presses a sign, by position as the axes are. */
const USE = 'KeyE';

/**
 * The keys that answer a question, by the letter the question names: the
 * letter a key types where the layout types Latin ones, its position where
 * it does not.
 */
const ANSWERS = { y: 'yes', n: 'no' } as const;
const ANSWER_CODES = { KeyY: 'yes', KeyN: 'no' } as const;

const isIn = <T extends object>(
  table: T,
  key: string,
): key is string & keyof T => Object.hasOwn(table, key);

/** What pressing the key typing `key` at position `code` answers, if anything. */
export function answerOf(key: string, code: string): Input['answer'] {
  const letter = key.toLowerCase();
  if (/^[a-z]$/u.test(letter))
    return isIn(ANSWERS, letter) ? ANSWERS[letter] : null;
  return isIn(ANSWER_CODES, code) ? ANSWER_CODES[code] : null;
}

/**
 * The word that, typed with a floor's two digits after it, takes the body to
 * that floor: its keys by position, as the axes are, so it is typed where a
 * QWERTY has `goto05`.
 */
const GO_TO =
  /^KeyG KeyO KeyT KeyO (?:Digit|Numpad)(\d) (?:Digit|Numpad)(\d)$/u;
const GO_TO_KEYS = 6;

/** The keys that, held, slow the run to a walk. */
const WALKING = new Set(['ShiftLeft', 'ShiftRight']);

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
  const shifts = new Set<string>();
  let turn = 0;
  let tilt = 0;
  let use = false;
  let answer: Input['answer'] = null;
  let goTo: number | null = null;
  let typed: string[] = [];
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
    const { code, key, type, ctrlKey, metaKey, repeat, target: on } = event;
    const notAMove = isTextField(on) || ctrlKey || metaKey;
    if (type === 'keydown' && !repeat && !notAMove) {
      typed = [...typed, code].slice(-GO_TO_KEYS);
      const floor = GO_TO.exec(typed.join(' '));
      if (floor !== null) {
        goTo = Number(`${floor[1] ?? ''}${floor[2] ?? ''}`);
        typed = [];
      }
    }
    if (type === 'keydown' && !repeat && !notAMove) {
      answer = answerOf(key, code) ?? answer;
    }
    if (code === USE && type === 'keydown' && !repeat) {
      if (notAMove) return;
      event.preventDefault();
      use = true;
      return;
    }
    if (WALKING.has(code)) {
      if (type === 'keyup') shifts.delete(code);
      else shifts.add(code);
      return;
    }
    if (!isCode(code)) return;
    if (type === 'keyup') {
      held.delete(code);
      return;
    }
    if (notAMove) return;
    event.preventDefault();
    held.add(code);
  };
  const onBlur = () => {
    held.clear();
    shifts.clear();
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
        walking: shifts.size > 0,
        use,
        answer,
        goTo,
      };
      for (const code of held) {
        const { axis, sign } = AXES[code];
        input[axis] += sign;
      }
      turn = 0;
      tilt = 0;
      use = false;
      answer = null;
      goTo = null;
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
