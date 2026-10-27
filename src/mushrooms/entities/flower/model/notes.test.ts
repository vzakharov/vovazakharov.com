import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { PITCH_CLASSES, type PitchClass } from './flower-sounds';
import {
  frequencyOf,
  HIGHEST_NOTE,
  keyNote,
  LOWEST_NOTE,
  MELODY_REST,
  nearestNote,
  shiftOctave,
  strike,
} from './notes';

const [C, D, E, A] = [0, 2, 4, 9] as const satisfies readonly PitchClass[];

describe('nearestNote', () => {
  it('starts in the middle octave', () => {
    assert.equal(nearestNote(undefined, C), LOWEST_NOTE + 12);
  });

  it('plays the same note again for the same class', () => {
    assert.equal(nearestNote(72, C), 72);
  });

  it('steps to the nearer of the notes above and below', () => {
    const a = LOWEST_NOTE + 9;
    assert.equal(nearestNote(a, E), a - 5, 'A down to E');
    assert.equal(nearestNote(a, D), a + 5, 'A up to D');
  });

  it('folds back into range at either end', () => {
    const topA = LOWEST_NOTE + 24 + 9;
    assert.equal(nearestNote(topA, D), LOWEST_NOTE + 24 + 2);
    const bottomD = LOWEST_NOTE + 2;
    assert.equal(nearestNote(bottomD, A), LOWEST_NOTE + 9);
  });

  it('breaks a tritone’s tie toward the middle', () => {
    assert.equal(nearestNote(LOWEST_NOTE, 6), LOWEST_NOTE + 6);
    assert.equal(nearestNote(HIGHEST_NOTE - 11, 6), HIGHEST_NOTE - 11 - 6);
  });

  it('keeps the class, the range, and a step of at most 11', () => {
    for (let anchor = LOWEST_NOTE - 14; anchor <= HIGHEST_NOTE + 14; anchor++) {
      for (const pitchClass of PITCH_CLASSES) {
        const note = nearestNote(anchor, pitchClass);
        assert.equal(note % 12, pitchClass);
        assert.ok(note >= LOWEST_NOTE && note <= HIGHEST_NOTE);
        if (anchor >= LOWEST_NOTE && anchor <= HIGHEST_NOTE) {
          assert.ok(Math.abs(note - anchor) <= 11);
          const edge = anchor < LOWEST_NOTE + 6 || anchor > HIGHEST_NOTE - 6;
          if (!edge) assert.ok(Math.abs(note - anchor) <= 6);
        }
      }
    }
  });
});

describe('strike', () => {
  it('anchors on the last note until the melody rests', () => {
    const first = strike(undefined, A, 0);
    const next = strike(first.melody, E, 1);
    assert.equal(next.note, first.note - 5);
    const rested = strike(next.melody, E, 1 + MELODY_REST + 1);
    assert.equal(rested.note, LOWEST_NOTE + 12 + E);
  });
});

describe('the keyboard', () => {
  it('plays absolute notes in its octave, held to the three', () => {
    assert.equal(keyNote(1, C), 72);
    assert.equal(shiftOctave(2, 1), 2);
    assert.equal(shiftOctave(0, -1), 0);
    assert.equal(shiftOctave(1, 1), 2);
  });
});

describe('frequencyOf', () => {
  it('tunes A4 to 440 and C4 to middle C', () => {
    assert.equal(frequencyOf(69), 440);
    assert.ok(Math.abs(frequencyOf(60) - 261.63) < 0.01);
  });
});
