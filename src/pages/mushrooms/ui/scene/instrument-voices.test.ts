import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DRUMS } from '../../model/flower-sounds';
import { HIGHEST_NOTE, LOWEST_NOTE } from '../../model/notes';
import {
  DRUM_SPECS,
  type DrumSpec,
  HISS_CEILING,
  noteEnvelope,
} from './instrument-voices';

/** The quickest attack a soft drum has, in seconds: anything sharper clicks. */
const SOFTEST_CLICK = 0.003;

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

describe('the drums', () => {
  const specs: Array<[string, DrumSpec]> = Object.entries(DRUM_SPECS);

  it('are soft: rounded attacks, filtered noise, no peak past half', () => {
    for (const [drum, { attack, body, hiss }] of specs) {
      assert.ok(attack >= SOFTEST_CLICK, drum);
      assert.ok(body ?? hiss, `${drum} makes a sound`);
      if (hiss) assert.ok(hiss.frequency <= HISS_CEILING, drum);
      for (const part of [body, hiss]) {
        if (part) assert.ok(part.peak <= 0.5 && part.lasts <= 0.6, drum);
      }
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
