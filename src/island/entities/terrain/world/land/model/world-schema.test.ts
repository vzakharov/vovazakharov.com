import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { roll, rollWith } from '../../roll';
import { decodeNormal, type Roll } from '../../roll/index.test-only';
import { pathHash } from './hash';
import { harmonicIndex, rollWorld, worldSchema } from './world-schema';

/** Every path `schema` reads, with the word `H(world, path)` gives it. */
function wordsOf(schema: Roll, world: string) {
  const hash = pathHash(world);
  const words = new Map<string, number>();
  rollWith(schema, (path) => {
    const word = hash(path);
    words.set(path, word);
    return word;
  });
  return words;
}

describe('harmonicIndex', () => {
  it('spells and finds every (l, m) in slot order', () => {
    const degree = 9;
    const index = harmonicIndex(degree);
    assert.equal(index.slots, 99);
    let slot = 0;
    for (let l = 1; l <= degree; l += 1) {
      for (let m = -l; m <= l; m += 1) {
        assert.equal(index.segmentsAt(slot), `${l}/${m}`);
        assert.equal(index.slotOf({ l, m }), slot);
        slot += 1;
      }
    }
    for (const outside of [
      { l: 0, m: 0 },
      { l: 3, m: 4 },
      { l: 10, m: 0 },
    ]) {
      assert.equal(index.slotOf(outside), -1);
    }
  });
});

describe('worldSchema', () => {
  it('keys each word by its path', () => {
    const words = wordsOf(worldSchema(2), '7');
    assert.deepEqual(
      [...words.keys()],
      [
        'land/sea',
        ...['1/-1', '1/0', '1/1', '2/-2', '2/-1', '2/0', '2/1', '2/2'].map(
          (key) => `land/harmonic/${key}`,
        ),
        'noise/seed',
      ],
    );
  });

  it('moves no word when a leaf is added', () => {
    const before = worldSchema(6);
    const after = roll.struct({
      climate: roll.struct({ wetness: roll.uniform(0, 1) }),
      land: roll.struct({
        ...before.fields.land.fields,
        aaa: roll.normal(),
      }),
      noise: roll.struct({
        ...before.fields.noise.fields,
        octaves: roll.word(),
      }),
    });
    for (const world of ['0', '1', '31337']) {
      const old = wordsOf(before, world);
      const grown = wordsOf(after, world);
      assert.equal(grown.size, old.size + 3);
      for (const [path, word] of old) assert.equal(grown.get(path), word, path);
    }
  });

  it('decodes to the schema’s type, a table to a lookup', () => {
    const world = rollWorld('3', 8);
    const hash = pathHash('3');
    assert.equal(world.land.sea, decodeNormal(hash('land/sea')));
    assert.equal(world.noise.seed, hash('noise/seed'));
    assert.equal(
      world.land.harmonic.at({ l: 7, m: -5 }),
      decodeNormal(hash('land/harmonic/7/-5')),
    );
    assert.equal(world.land.harmonic.values.length, 80);
    assert.ok(Number.isNaN(world.land.harmonic.at({ l: 9, m: 0 })));
  });

  it('gives a lower degree the same harmonics', () => {
    const low = rollWorld('12', 5).land.harmonic;
    const high = rollWorld('12', 9).land.harmonic;
    for (let l = 1; l <= 5; l += 1) {
      for (let m = -l; m <= l; m += 1) {
        assert.equal(low.at({ l, m }), high.at({ l, m }));
      }
    }
  });
});
