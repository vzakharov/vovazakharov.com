import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { decodeNormal, decodeUniform } from './decode';
import { roll, rollWith } from './roll';

describe('rollWith', () => {
  const pair = {
    size: 2,
    slotOf: (key: 'left' | 'right') => (key === 'left' ? 0 : 1),
    segmentsAt: (slot: number) => (slot === 0 ? 'left' : 'right'),
  };
  const schema = roll.struct({
    a: roll.uniform(-2, 2),
    b: roll.struct({ c: roll.normal(), d: roll.table(pair, roll.word()) }),
  });
  const words: Record<string, number> = {
    a: 1 << 30,
    'b/c': 3 * 2 ** 30,
    'b/d/left': 17,
    'b/d/right': 2 ** 32 - 1,
  };

  it('reads each leaf’s word by its path and decodes it', () => {
    const rolled = rollWith(schema, (path) => words[path] ?? Number.NaN);
    assert.equal(rolled.a, decodeUniform(1 << 30, -2, 2));
    assert.equal(rolled.b.c, decodeNormal(3 * 2 ** 30));
    assert.equal(rolled.b.d.at('left'), 17);
    assert.equal(rolled.b.d.at('right'), 2 ** 32 - 1);
    assert.deepEqual([...rolled.b.d.values], [17, 2 ** 32 - 1]);
  });
});
