import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DRUMS, PITCH_CLASSES } from '../../model/flower-sounds';
import { type KeyAction, keyAction, KEYS } from './keyboard';

const press = (code: string, held: Partial<KeyboardEvent> = {}) =>
  keyAction({
    code,
    repeat: false,
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    ...held,
  });

const actions = [...KEYS.values()];
const notes = actions.flatMap((action) =>
  action.kind === 'note' ? [action.pitchClass] : [],
);
const drums = actions.flatMap((action) =>
  action.kind === 'drum' ? [action.drum] : [],
);

describe('the keyboard', () => {
  it('plays every pitch class once, C on g and B on the quote', () => {
    assert.deepEqual(
      notes.toSorted((a, b) => a - b),
      [...PITCH_CLASSES],
    );
    assert.deepEqual(press('KeyG'), { kind: 'note', pitchClass: 0 });
    assert.deepEqual(press('Quote'), { kind: 'note', pitchClass: 11 });
    assert.deepEqual(press('KeyY'), { kind: 'note', pitchClass: 1 });
  });

  it('plays the drums in their order, violet on a s d f and white on q w e r', () => {
    assert.deepEqual(drums, [...DRUMS]);
    assert.deepEqual(press('KeyA'), { kind: 'drum', drum: 'kick' });
    assert.deepEqual(press('KeyR'), { kind: 'drum', drum: 'shaker' });
  });

  it('shifts the octave on z and x', () => {
    const shifts: Array<KeyAction | undefined> = [press('KeyZ'), press('KeyX')];
    assert.deepEqual(shifts, [
      { kind: 'octave', step: -1 },
      { kind: 'octave', step: 1 },
    ]);
  });

  it('pans a step on the arrows', () => {
    assert.deepEqual(press('ArrowLeft'), { kind: 'pan', direction: -1 });
    assert.deepEqual(press('ArrowRight'), { kind: 'pan', direction: 1 });
  });

  it('ignores a held key’s repeats, a shortcut and a key it has no use for', () => {
    assert.equal(press('KeyG', { repeat: true }), undefined);
    assert.equal(press('KeyG', { metaKey: true }), undefined);
    assert.equal(press('KeyC', { ctrlKey: true }), undefined);
    assert.equal(press('KeyI'), undefined);
  });
});
