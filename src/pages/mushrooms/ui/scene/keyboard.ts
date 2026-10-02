/**
 * The meadow played from a computer's keyboard: `g h j k l ; '` the white
 * keys C to B, `y u o p [` the sharps above them, `a s d f` violet's drums and
 * `q w e r` white's, `z`/`x` the octave down and up, `←`/`→` turn the
 * eye while held, or walk it sideways under Shift, and `↑`/`↓` walk it on
 * and back. Keys are read by
 * `event.code`, where they sit rather than what they print, so a Russian
 * layout plays the same.
 */

import type { Direction } from '../../model/cruise';
import type { Drum, FlowerSound, PitchClass } from '../../model/flower-sounds';

/** What a key plays on the instrument. */
export type PlayedKey = FlowerSound | { kind: 'octave'; step: -1 | 1 };

/** Which way a held key moves the eye: -1 leftward or back, 1 rightward or on. */
type Directed = { direction: Direction };

/** A key that turns the eye while held, leftward or rightward. */
type PanKey = Directed & { kind: 'pan' };

/** A key that walks the eye while held, on along its heading or back. */
type StepKey = Directed & { kind: 'step' };

/** A turning key held under Shift: it walks the eye sideways, to its left or right. */
type StrafeKey = Directed & { kind: 'strafe' };

/** A key that moves the eye while held, and so must be let go. */
export type MoveKey = PanKey | StepKey | StrafeKey;

export type KeyAction = PlayedKey | MoveKey;

const LEFTWARD: PanKey = { kind: 'pan', direction: -1 };
const RIGHTWARD: PanKey = { kind: 'pan', direction: 1 };
const ON: StepKey = { kind: 'step', direction: 1 };
const BACK: StepKey = { kind: 'step', direction: -1 };
const MOVE_KEYS: readonly MoveKey[] = [
  LEFTWARD,
  RIGHTWARD,
  ON,
  BACK,
  { kind: 'strafe', direction: -1 },
  { kind: 'strafe', direction: 1 },
];

/** What a turning key does with Shift down or up: strafe or turn, the same way. */
function sideways(
  { direction }: PanKey | StrafeKey,
  shifted: boolean,
): MoveKey {
  return { kind: shifted ? 'strafe' : 'pan', direction };
}

/** Whether `code` names a Shift key. */
function isShift(code: string): boolean {
  return code === 'ShiftLeft' || code === 'ShiftRight';
}

/** C D E F G A B. */
const WHITE_KEYS = [
  ['KeyG', 0],
  ['KeyH', 2],
  ['KeyJ', 4],
  ['KeyK', 5],
  ['KeyL', 7],
  ['Semicolon', 9],
  ['Quote', 11],
] as const satisfies ReadonlyArray<readonly [string, PitchClass]>;

/** C♯ D♯ F♯ G♯ A♯, each above the gap between its two white keys. */
const SHARP_KEYS = [
  ['KeyY', 1],
  ['KeyU', 3],
  ['KeyO', 6],
  ['KeyP', 8],
  ['BracketLeft', 10],
] as const satisfies ReadonlyArray<readonly [string, PitchClass]>;

/** The drums in `DRUMS`' order: violet's row, then white's above it. */
const DRUM_KEYS = [
  ['KeyA', 'kick'],
  ['KeyS', 'tom-low'],
  ['KeyD', 'tom-mid'],
  ['KeyF', 'tom-high'],
  ['KeyQ', 'snare'],
  ['KeyW', 'rim'],
  ['KeyE', 'hat'],
  ['KeyR', 'shaker'],
] as const satisfies ReadonlyArray<readonly [string, Drum]>;

type Bound = [code: string, action: KeyAction];

export const KEYS: ReadonlyMap<string, KeyAction> = new Map([
  ...[...WHITE_KEYS, ...SHARP_KEYS].map(
    ([code, pitchClass]): Bound => [code, { kind: 'note', pitchClass }],
  ),
  ...DRUM_KEYS.map(([code, drum]): Bound => [code, { kind: 'drum', drum }]),
  ['KeyZ', { kind: 'octave', step: -1 }],
  ['KeyX', { kind: 'octave', step: 1 }],
  ['ArrowLeft', LEFTWARD],
  ['ArrowRight', RIGHTWARD],
  ['ArrowUp', ON],
  ['ArrowDown', BACK],
] satisfies Bound[]);

type Pressed = Pick<
  KeyboardEvent,
  'code' | 'repeat' | 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey'
>;

/**
 * What a key press does; nothing for a held key's repeats or a shortcut with
 * a modifier. A turning key under Shift strafes.
 */
export function keyAction(event: Pressed): KeyAction | undefined {
  if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) {
    return undefined;
  }
  const action = KEYS.get(event.code);
  return action?.kind === 'pan' ? sideways(action, event.shiftKey) : action;
}

/**
 * The move keys a key's release lets go, whatever modifiers are down by then:
 * a held arrow let go under a modifier must still stop the eye, and a turning
 * arrow lets go its strafe too, Shift having perhaps come up first.
 */
export function letGoMoves(event: Pick<KeyboardEvent, 'code'>): MoveKey[] {
  const action = KEYS.get(event.code);
  if (action?.kind === 'pan') {
    return [sideways(action, false), sideways(action, true)];
  }
  return action?.kind === 'step' ? [action] : [];
}

/**
 * Plays the key presses `host` takes into `onKey` while it holds focus, and
 * not the page's: single-letter keys bound page-wide would take a screen
 * reader's own. A move key's release goes to `onLetGo`, and so does every
 * move key when `host` loses focus, whose releases it then never hears.
 * Shift going down or up under a held turning arrow hands it from turning to
 * strafing or back, as if the arrow were pressed again. Returns what stops
 * listening.
 */
export function listenForKeys(
  host: HTMLElement,
  onKey: (action: KeyAction) => void,
  onLetGo: (key: MoveKey) => void,
): () => void {
  /** The turning arrows held, by code. */
  const turning = new Map<string, PanKey>();
  const shifted = (event: KeyboardEvent, down: boolean) => {
    if (event.repeat || !isShift(event.code)) return;
    for (const key of turning.values()) {
      onLetGo(sideways(key, !down));
      onKey(sideways(key, down));
    }
  };
  const pressed = (event: KeyboardEvent) => {
    shifted(event, true);
    const action = keyAction(event);
    if (!action) return;
    event.preventDefault();
    const bound = KEYS.get(event.code);
    if (bound?.kind === 'pan') turning.set(event.code, bound);
    onKey(action);
  };
  const lifted = (event: KeyboardEvent) => {
    shifted(event, false);
    turning.delete(event.code);
    for (const key of letGoMoves(event)) onLetGo(key);
  };
  const blurred = () => {
    turning.clear();
    for (const key of MOVE_KEYS) onLetGo(key);
  };
  host.addEventListener('keydown', pressed);
  host.addEventListener('keyup', lifted);
  host.addEventListener('blur', blurred);
  return () => {
    host.removeEventListener('keydown', pressed);
    host.removeEventListener('keyup', lifted);
    host.removeEventListener('blur', blurred);
  };
}
