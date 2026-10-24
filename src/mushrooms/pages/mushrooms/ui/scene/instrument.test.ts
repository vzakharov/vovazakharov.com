import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Drum } from '../../model/flower-sounds';
import { LOWEST_NOTE } from '../../model/notes';
import { Instrument } from './instrument';

/** What the instrument asked the synth for, in order. */
function played(): {
  heard: Array<number | Drum>;
  instrument: Instrument;
  clock: { now: number };
} {
  const heard: Array<number | Drum> = [];
  const voice = {
    note: (note: number) => heard.push(note),
    drum: (drum: Drum) => heard.push(drum),
    start: () => {
      // Nothing to unlock in a test.
    },
  };
  const clock = { now: 0 };
  const instrument = new Instrument(voice, () => clock.now);
  return { heard, instrument, clock };
}

const middle = LOWEST_NOTE + 12;

describe('Instrument', () => {
  it('walks a tapped melody by the nearest note', () => {
    const { heard, instrument } = played();
    instrument.flower({ kind: 'note', pitchClass: 9 }, true);
    instrument.flower({ kind: 'note', pitchClass: 4 }, true);
    assert.deepEqual(heard, [middle + 9, middle + 4]);
  });

  it('lets a bee’s flower play from the melody without moving it', () => {
    const { heard, instrument } = played();
    instrument.flower({ kind: 'note', pitchClass: 9 }, true);
    instrument.flower({ kind: 'note', pitchClass: 4 }, false);
    instrument.flower({ kind: 'note', pitchClass: 11 }, true);
    assert.deepEqual(heard, [middle + 9, middle + 4, middle + 11]);
  });

  it('anchors the flowers on the last key played', () => {
    const { heard, instrument } = played();
    assert.equal(instrument.key({ kind: 'octave', step: 1 }), undefined);
    instrument.key({ kind: 'note', pitchClass: 0 });
    instrument.flower({ kind: 'note', pitchClass: 11 }, true);
    assert.deepEqual(heard, [middle + 12, middle + 11]);
  });

  it('walks a keyed melody by the nearest note, as a tapped one', () => {
    const { heard, instrument } = played();
    instrument.key({ kind: 'note', pitchClass: 9 });
    instrument.key({ kind: 'note', pitchClass: 0 });
    instrument.key({ kind: 'note', pitchClass: 7 });
    assert.deepEqual(heard, [middle + 9, middle + 12, middle + 7]);
  });

  it('moves the melody an octave by an octave key', () => {
    const { heard, instrument } = played();
    instrument.key({ kind: 'note', pitchClass: 9 });
    instrument.key({ kind: 'octave', step: -1 });
    instrument.key({ kind: 'note', pitchClass: 11 });
    assert.deepEqual(heard, [middle + 9, middle - 1]);
  });

  it('holds the octave at the range’s ends', () => {
    const { heard, instrument } = played();
    for (let press = 0; press < 5; press++) {
      instrument.key({ kind: 'octave', step: -1 });
    }
    instrument.key({ kind: 'note', pitchClass: 0 });
    assert.deepEqual(heard, [LOWEST_NOTE]);
  });

  it('plays a drum as it is, from a flower or a key', () => {
    const { heard, instrument } = played();
    instrument.flower({ kind: 'drum', drum: 'kick' }, true);
    assert.deepEqual(instrument.key({ kind: 'drum', drum: 'hat' }), {
      kind: 'drum',
      drum: 'hat',
    });
    assert.deepEqual(heard, ['kick', 'hat']);
  });
});
