/**
 * The meadow played from a computer's keyboard: `g h j k l ; '` the white
 * keys C to B, `y u o p [` the sharps above them, `a s d f` violet's drums and
 * `q w e r` white's, `.`/`/` the octave down and up; while held, `←`/`→`
 * turn the eye, `↑`/`↓` walk it on and back, and `z`/`c` walk it sideways
 * to its left and right, any of them together. Keys are read by
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

/** A key that walks the eye sideways while held, to its left or right. */
type StrafeKey = Directed & { kind: 'strafe' };

/** A key that moves the eye while held, and so must be let go. */
export type MoveKey = PanKey | StepKey | StrafeKey;

export type KeyAction = PlayedKey | MoveKey;

/** The keys that move the eye while held, any of them at once. */
const MOVES: ReadonlyMap<string, MoveKey> = new Map<string, MoveKey>([
  ['ArrowLeft', { kind: 'pan', direction: -1 }],
  ['ArrowRight', { kind: 'pan', direction: 1 }],
  ['ArrowUp', { kind: 'step', direction: 1 }],
  ['ArrowDown', { kind: 'step', direction: -1 }],
  ['KeyZ', { kind: 'strafe', direction: -1 }],
  ['KeyC', { kind: 'strafe', direction: 1 }],
]);

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
  ['Period', { kind: 'octave', step: -1 }],
  ['Slash', { kind: 'octave', step: 1 }],
  ...MOVES,
] satisfies Bound[]);

type Pressed = Pick<
  KeyboardEvent,
  'code' | 'repeat' | 'altKey' | 'ctrlKey' | 'metaKey'
>;

/**
 * What a key press does; nothing for a held key's repeats or a shortcut with
 * a modifier. Shift changes nothing.
 */
export function keyAction(event: Pressed): KeyAction | undefined {
  if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) {
    return undefined;
  }
  return KEYS.get(event.code);
}

/**
 * The move key a key's release lets go, whatever modifiers are down by then:
 * a held key let go under a modifier must still stop the eye.
 */
export function letGoMove(
  event: Pick<KeyboardEvent, 'code'>,
): MoveKey | undefined {
  return MOVES.get(event.code);
}

/**
 * Plays the key presses `host` takes into `onKey` while it holds focus, and
 * not the page's: single-letter keys bound page-wide would take a screen
 * reader's own. A move key's release goes to `onLetGo`, and so does every
 * move key when `host` loses focus, whose releases it then never hears.
 * Returns what stops listening.
 */
export function listenForKeys(
  host: HTMLElement,
  onKey: (action: KeyAction) => void,
  onLetGo: (key: MoveKey) => void,
): () => void {
  const pressed = (event: KeyboardEvent) => {
    const action = keyAction(event);
    if (!action) return;
    event.preventDefault();
    onKey(action);
  };
  const lifted = (event: KeyboardEvent) => {
    const key = letGoMove(event);
    if (key) onLetGo(key);
  };
  const blurred = () => {
    for (const key of MOVES.values()) onLetGo(key);
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
