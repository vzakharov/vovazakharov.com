import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { PlayedKey } from './keyboard';
import { type FlowerInView, keyedFlowers, playKey } from './keyed-flowers';

const IN_VIEW: FlowerInView[] = [
  { id: 'c', sound: { kind: 'note', pitchClass: 0 } },
  { id: 'e', sound: { kind: 'note', pitchClass: 4 } },
  { id: 'other c', sound: { kind: 'note', pitchClass: 0 } },
  { id: 'kick', sound: { kind: 'drum', drum: 'kick' } },
];

describe('the flowers a key plays through', () => {
  it('are the flowers in view with the key’s pitch class, every one of them', () => {
    assert.deepEqual(
      keyedFlowers({ kind: 'note', pitchClass: 0 }, IN_VIEW).map(
        ({ id }) => id,
      ),
      ['c', 'other c'],
    );
  });

  it('are the flowers in view with the key’s drum', () => {
    assert.deepEqual(
      keyedFlowers({ kind: 'drum', drum: 'kick' }, IN_VIEW).map(({ id }) => id),
      ['kick'],
    );
  });

  it('are none for a sound no flower in view makes, so the key is silent', () => {
    assert.deepEqual(
      keyedFlowers({ kind: 'note', pitchClass: 7 }, IN_VIEW),
      [],
    );
    assert.deepEqual(keyedFlowers({ kind: 'drum', drum: 'hat' }, IN_VIEW), []);
    assert.deepEqual(keyedFlowers({ kind: 'note', pitchClass: 0 }, []), []);
  });
});

/** The keys `played` played through `inView`: what the instrument sounded and which flowers answered. */
function played(keys: readonly PlayedKey[], inView: readonly FlowerInView[]) {
  const sounded: PlayedKey[] = [];
  const answered: string[][] = [];
  let woken = 0;
  const instrument = {
    wake: () => {
      woken++;
    },
    key: (action: PlayedKey) => {
      sounded.push(action);
      return action.kind === 'octave' ? undefined : action;
    },
  };
  const keyed = {
    inView: () => inView,
    answer: (flowers: readonly FlowerInView[]) => {
      answered.push(flowers.map(({ id }) => id));
    },
  };
  for (const key of keys) playKey(instrument, keyed, key);
  return { sounded, answered, woken };
}

describe('a played key', () => {
  it('sounds through the flowers in view that make its sound, which answer it', () => {
    const { sounded, answered } = played(
      [{ kind: 'note', pitchClass: 0 }],
      IN_VIEW,
    );
    assert.deepEqual(sounded, [{ kind: 'note', pitchClass: 0 }]);
    assert.deepEqual(answered, [['c', 'other c']]);
  });

  it('is silent with no such flower in view, and nothing answers', () => {
    const { sounded, answered, woken } = played(
      [
        { kind: 'note', pitchClass: 11 },
        { kind: 'drum', drum: 'snare' },
      ],
      IN_VIEW,
    );
    assert.deepEqual(sounded, []);
    assert.deepEqual(answered, []);
    assert.equal(woken, 2, 'a key still lets the sound start');
  });

  it('shifts the octave whatever is in view', () => {
    const { sounded, answered } = played([{ kind: 'octave', step: 1 }], []);
    assert.deepEqual(sounded, [{ kind: 'octave', step: 1 }]);
    assert.deepEqual(answered, []);
  });
});
