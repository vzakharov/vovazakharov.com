/**
 * Where a flower's or a key's pitch class sounds: the nearest note of that
 * class to the last note played, within the game's three octaves, so a run
 * of taps walks up and down as a melody does instead of jumping by octaves.
 * Notes are MIDI numbers.
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
 * tritone's tie the one toward the middle of the range. With no anchor,
 * `octave`'s.
 */
export function nearestNote(
  anchor: number | undefined,
  pitchClass: PitchClass,
  octave = HOME_OCTAVE,
): number {
  if (anchor === undefined) return keyNote(octave, pitchClass);
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

/** The note `pitchClass` plays at `now`, a melody that has rested starting in `octave`, and the melody it leaves. */
export function strike(
  melody: Melody,
  pitchClass: PitchClass,
  now: number,
  octave = HOME_OCTAVE,
): { note: number; melody: Melody } {
  const note = nearestNote(anchorOf(melody, now), pitchClass, octave);
  return { note, melody: { note, at: now } };
}

/**
 * `melody` with its last note moved `step` octaves at `now`, so the next
 * note is found round it; as it was where it has rested or the move would
 * leave the range.
 */
export function shiftMelody(melody: Melody, step: number, now: number): Melody {
  const anchor = anchorOf(melody, now);
  if (anchor === undefined) return melody;
  const note = anchor + 12 * step;
  return note < LOWEST_NOTE || note > HIGHEST_NOTE ? melody : { note, at: now };
}

/** The note of `pitchClass` in `octave` (0 to `OCTAVES` − 1). */
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
