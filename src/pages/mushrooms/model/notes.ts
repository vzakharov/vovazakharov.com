/**
 * Where a flower's pitch class sounds: the nearest note of that class to the
 * last note played, within the game's three octaves, so a run of taps walks
 * up and down as a melody does instead of jumping by octaves. Notes are MIDI
 * numbers.
 */

import type { PitchClass } from './flower-sounds';

/** The lowest note the meadow plays, C4; a phone's speaker loses the octave below. */
export const LOWEST_NOTE = 60;
const OCTAVES = 3;
export const HIGHEST_NOTE = LOWEST_NOTE + OCTAVES * 12 - 1;
/** The octave a melody starts in, and the keyboard with it: the middle one. */
export const HOME_OCTAVE = 1;
/** After this long without a note, in seconds, the next starts back in the middle octave. */
export const MELODY_REST = 10;

const MIDDLE = LOWEST_NOTE + OCTAVES * 6;

/** `note` moved by whole octaves into the game's range. */
function intoRange(note: number): number {
  let inside = note;
  while (inside < LOWEST_NOTE) inside += 12;
  while (inside > HIGHEST_NOTE) inside -= 12;
  return inside;
}

/**
 * The note of class `pitchClass` nearest `anchor`: the same note for the same
 * class, the nearer of the one above and the one below otherwise, and on a
 * tritone's tie the one toward the middle of the range. With no anchor, the
 * middle octave's.
 */
export function nearestNote(
  anchor: number | undefined,
  pitchClass: PitchClass,
): number {
  if (anchor === undefined) return keyNote(HOME_OCTAVE, pitchClass);
  const up = (((pitchClass - anchor) % 12) + 12) % 12;
  if (up === 0) return intoRange(anchor);
  const above = anchor + up;
  const below = anchor - (12 - up);
  const toward =
    up < 6 ? above : up > 6 ? below : anchor >= MIDDLE ? below : above;
  return intoRange(toward);
}

/** The last note played and when, in seconds; `undefined` before the first. */
export type Melody = { note: number; at: number } | undefined;

/** The melody's anchor at `now`: the last note, unless it has rested past `MELODY_REST`. */
function anchorOf(melody: Melody, now: number): number | undefined {
  return melody && now - melody.at <= MELODY_REST ? melody.note : undefined;
}

/** The note a flower of `pitchClass` plays at `now`, and the melody it leaves. */
export function strike(
  melody: Melody,
  pitchClass: PitchClass,
  now: number,
): { note: number; melody: Melody } {
  const note = nearestNote(anchorOf(melody, now), pitchClass);
  return { note, melody: { note, at: now } };
}

/** The note a key of `pitchClass` plays in `octave` (0 to `OCTAVES` − 1), as a piano's key does. */
export function keyNote(octave: number, pitchClass: PitchClass): number {
  return LOWEST_NOTE + octave * 12 + pitchClass;
}

/** The keyboard's octave moved by `step`, held at the range's ends. */
export function shiftOctave(octave: number, step: number): number {
  return Math.min(OCTAVES - 1, Math.max(0, octave + step));
}

/** A note's frequency in Hz, A4 at 440. */
export function frequencyOf(note: number): number {
  return 440 * 2 ** ((note - 69) / 12);
}
