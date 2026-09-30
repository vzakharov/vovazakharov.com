/**
 * The meadow played from a computer's keyboard: `g h j k l ; '` the white
 * keys C to B, `y u o p [` the sharps above them, `a s d f` violet's drums and
 * `q w e r` white's, `z`/`x` the octave down and up, and `←`/`→` pan the
 * meadow a step. Keys are read by
 * `event.code`, where they sit rather than what they print, so a Russian
 * layout plays the same.
 */

import type { Drum, FlowerSound, PitchClass } from '../../model/flower-sounds';

/** What a key plays on the instrument. */
export type PlayedKey = FlowerSound | { kind: 'octave'; step: -1 | 1 };

/** A key that steps the crop across the world, leftward or rightward. */
type PanKey = { kind: 'pan'; direction: -1 | 1 };

export type KeyAction = PlayedKey | PanKey;

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
  ['ArrowLeft', { kind: 'pan', direction: -1 }],
  ['ArrowRight', { kind: 'pan', direction: 1 }],
] satisfies Bound[]);

type Pressed = Pick<
  KeyboardEvent,
  'code' | 'repeat' | 'altKey' | 'ctrlKey' | 'metaKey'
>;

/** What a key press does; nothing for a held key's repeats or a shortcut with a modifier. */
export function keyAction(event: Pressed): KeyAction | undefined {
  if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) {
    return undefined;
  }
  return KEYS.get(event.code);
}

/**
 * Plays the key presses `host` takes into `onKey` while it holds focus, and
 * not the page's: single-letter keys bound page-wide would take a screen
 * reader's own. Returns what stops listening.
 */
export function listenForKeys(
  host: HTMLElement,
  onKey: (action: KeyAction) => void,
): () => void {
  const pressed = (event: KeyboardEvent) => {
    const action = keyAction(event);
    if (!action) return;
    event.preventDefault();
    onKey(action);
  };
  host.addEventListener('keydown', pressed);
  return () => {
    host.removeEventListener('keydown', pressed);
  };
}
