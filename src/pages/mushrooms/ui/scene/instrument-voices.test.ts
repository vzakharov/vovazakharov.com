import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DRUMS } from '../../model/flower-sounds';
import { HIGHEST_NOTE, LOWEST_NOTE } from '../../model/notes';
import {
  type Band,
  DRUM_SPECS,
  drumParts,
  type DrumSpec,
  noteEnvelope,
  noteParts,
  type Part,
} from './instrument-voices';
import { loudest } from './part-loudness';

describe('noteEnvelope', () => {
  it('comes down in loudness and length from the lowest note to the highest', () => {
    for (let note = LOWEST_NOTE; note < HIGHEST_NOTE; note++) {
      const here = noteEnvelope(note);
      const next = noteEnvelope(note + 1);
      for (const key of ['peak', 'overtone', 'attack', 'lasts'] as const) {
        assert.ok(next[key] <= here[key], `${key} at ${String(note)}`);
      }
    }
  });

  it('brings the top about 6 dB below the bottom', () => {
    const ratio =
      noteEnvelope(HIGHEST_NOTE).peak / noteEnvelope(LOWEST_NOTE).peak;
    assert.ok(Math.abs(20 * Math.log10(ratio) + 6) < 0.5);
  });

  it('holds past either end of the range', () => {
    assert.deepEqual(noteEnvelope(LOWEST_NOTE - 12), noteEnvelope(LOWEST_NOTE));
    assert.deepEqual(
      noteEnvelope(HIGHEST_NOTE + 12),
      noteEnvelope(HIGHEST_NOTE),
    );
  });
});

/** A tap the child makes should never click: no drum rises quicker than this, in seconds. */
const SOFTEST_CLICK = 0.003;
/** No drum rings past this, in seconds: a soft kit's hits are short. */
const LONGEST_RING = 0.6;
/** Nothing a hiss lets through reaches past this, in Hz: a hat's shimmer, short of a cymbal's sizzle. */
const HISS_CEILING = 8000;
/** A phone's speaker gives back little below this, in Hz. */
const PHONE_BAND = 300;
/** C5, the home octave's C: the note every sound is measured against. */
const MIDDLE_NOTE = 72;
/** How far under a middle note, in dB, a sound may lie on a phone and still be heard in a chord. */
const HEARD_BESIDE_A_NOTE = 12;
/**
 * `loudest` leaves out the master compressor, which in Chromium's offline
 * render took up to about 4 dB more off a drum than off a middle note
 * (docs/remove-before-merging/frames/bite-10/sound.md); a drum is asked to
 * clear the bar by this much, in dB, more.
 */
const COMPRESSION_ALLOWANCE = 5;
/** How far over a middle note, in dB, a drum may ring on a phone: the kit sits under the melody. */
const DRUM_OVER_A_NOTE = 6;
/** How far over a middle note, in dB, a drum may go at all, its low body counted: a soft thump, never a boom. */
const THUMP_OVER_A_NOTE = 10;

/** The upper −3 dB edge of a bandpass centred on `frequency` with `q`, in Hz. */
function upperEdge({ frequency, q }: Band): number {
  return (frequency * (Math.sqrt(1 + 4 * q ** 2) + 1)) / (2 * q);
}

describe('the drums', () => {
  const specs: Array<[string, DrumSpec]> = Object.entries(DRUM_SPECS);
  const middle = noteParts(MIDDLE_NOTE);
  const onAPhone = (parts: readonly Part[]) =>
    loudest(parts, PHONE_BAND) - loudest(middle, PHONE_BAND);

  it('are soft: rounded attacks, short rings, every one making a sound', () => {
    for (const [drum, { attack, body, ring, hiss }] of specs) {
      assert.ok(attack >= SOFTEST_CLICK, drum);
      assert.ok(body ?? ring ?? hiss, `${drum} makes a sound`);
      for (const part of [body, ring, hiss]) {
        if (part) assert.ok(part.lasts <= LONGEST_RING, drum);
      }
    }
  });

  it('keep every hiss under the ceiling to its upper −3 dB edge', () => {
    for (const [drum, { hiss }] of specs) {
      if (hiss) assert.ok(upperEdge(hiss) <= HISS_CEILING, drum);
    }
  });

  it('are each heard beside a middle note on a phone, and never over it', () => {
    for (const drum of DRUMS) {
      const level = onAPhone(drumParts(drum));
      const floor = -HEARD_BESIDE_A_NOTE + COMPRESSION_ALLOWANCE;
      assert.ok(level >= floor, `${drum} at ${level.toFixed(1)} dB`);
      assert.ok(level <= DRUM_OVER_A_NOTE, `${drum} at ${level.toFixed(1)} dB`);
    }
  });

  it('thump no louder than a stated reach over a middle note, their bodies counted', () => {
    for (const drum of DRUMS) {
      const level = loudest(drumParts(drum)) - loudest(middle);
      assert.ok(
        level <= THUMP_OVER_A_NOTE,
        `${drum} at ${level.toFixed(1)} dB`,
      );
    }
  });

  it('put the kick under the toms, and the toms low to high', () => {
    const lowest = (drum: (typeof DRUMS)[number]) =>
      Math.min(...((DRUM_SPECS[drum] as DrumSpec).body?.pitches ?? [Infinity]));
    const skins = DRUMS.slice(0, 4).map((drum) => lowest(drum));
    assert.deepEqual(
      skins,
      skins.toSorted((a, b) => a - b),
    );
  });
});

describe('the notes', () => {
  it('are each heard beside a middle note on a phone, from the lowest to the highest', () => {
    const middle = loudest(noteParts(MIDDLE_NOTE), PHONE_BAND);
    for (let note = LOWEST_NOTE; note <= HIGHEST_NOTE; note++) {
      const level = loudest(noteParts(note), PHONE_BAND) - middle;
      assert.ok(
        level >= -HEARD_BESIDE_A_NOTE,
        `${String(note)} at ${level.toFixed(1)} dB`,
      );
    }
  });
});
