import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { decodeNormal, decodeUniform } from './decode';
import { roll, rollWith } from './roll';

describe('rollWith', () => {
  const pair = {
    slots: 2,
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

const pickAt = (k: number, word: number) =>
  rollWith(roll.struct({ p: roll.pick(k) }), () => word).p;

describe('over and key', () => {
  const schema = roll.struct({
    block: roll.over(
      roll.key({ n: roll.int, x: roll.big }),
      roll.struct({
        omit: roll.pick(4),
        door: roll.over(roll.key(['north', 'east'] as const), roll.wide()),
      }),
    ),
  });

  it('spells a record key as `/`-joined parts and a wide leaf as two words', () => {
    const asked: string[] = [];
    const words: Record<string, number> = {
      'block/3/5/omit': 2 ** 31,
      'block/3/5/door/east/0': 7,
      'block/3/5/door/east/1': 9,
    };
    const rolled = rollWith(schema, (path) => {
      asked.push(path);
      return words[path] ?? Number.NaN;
    });
    assert.deepEqual(asked, []);

    // A struct under an `over` reads its own leaves when entered; a nested
    // `over` stays lazy until asked.
    const block = rolled.block.at({ n: 3, x: 5n });
    const omit: number = block.omit;
    assert.equal(omit, 2);
    assert.deepEqual(asked, ['block/3/5/omit']);

    asked.length = 0;
    const door: bigint = block.door.at('east');
    assert.equal(door, (7n << 32n) | 9n);
    assert.deepEqual(asked, ['block/3/5/door/east/0', 'block/3/5/door/east/1']);
  });

  it('types a record key by its parts and checks them at run time', () => {
    const rolled = rollWith(schema, () => 0);
    assert.throws(() => {
      // @ts-expect-error `x` is a bigint part
      rolled.block.at({ n: 0, x: 0 });
    }, /Not a bigint: 0/);
  });

  it('rejects a name outside a closed list', () => {
    const rolled = rollWith(schema, () => 0);
    const door = rolled.block.at({ n: 0, x: 0n }).door;
    assert.throws(() => {
      // @ts-expect-error 'south' is not one of the list's names
      door.at('south');
    }, /Not a key of \[north, east]: south/);
  });

  it('rejects an integer part that is not a safe integer', () => {
    assert.throws(() => roll.int(1.5), /Not a safe integer/);
    assert.throws(() => roll.int(2 ** 53), /Not a safe integer/);
    assert.equal(roll.int(-7), '-7');
  });

  it('spells a bigint part in decimal, sign and size intact', () => {
    assert.equal(roll.big(-12n), '-12');
    const huge = 2n ** 100n;
    assert.equal(roll.big(huge), '1267650600228229401496703205376');
    assert.equal(roll.big(-huge), '-1267650600228229401496703205376');
  });
});

describe('wide', () => {
  const schema = roll.struct({ w: roll.wide() });
  const compose = (high: number, low: number) =>
    rollWith(schema, (path) => (path === 'w/0' ? high : low)).w;

  it('reads the high word at `/0` and the low word at `/1`', () => {
    assert.equal(compose(1, 2), (1n << 32n) | 2n);
  });

  it('spans [0, 2^64) with max words', () => {
    const max = 2 ** 32 - 1;
    assert.equal(compose(max, max), 2n ** 64n - 1n);
    assert.equal(compose(0, 0), 0n);
  });
});

describe('pick', () => {
  it('maps the word range onto [0, k)', () => {
    assert.equal(pickAt(10, 0), 0);
    assert.equal(pickAt(10, 2 ** 32 - 1), 9);
    assert.equal(pickAt(7, 2 ** 31), Math.floor(7 / 2));
    assert.equal(pickAt(4, 2 ** 31), 2);
  });

  it('refuses a k that is not an integer in [1, 2^21]', () => {
    assert.throws(() => roll.pick(0), /Cannot pick among 0/);
    assert.throws(() => roll.pick(1.5), /Cannot pick among 1.5/);
    assert.throws(() => roll.pick(2 ** 21 + 1), /Cannot pick among/);
    assert.doesNotThrow(() => roll.pick(2 ** 21));
  });

  it('hits every value about equally over evenly spread words', () => {
    const k = 4;
    const draws = 4000;
    const counts = Array.from({ length: k }, () => 0);
    for (let i = 0; i < draws; i += 1) {
      const value = pickAt(k, Math.floor((i * 2 ** 32) / draws));
      counts[value] = (counts[value] ?? 0) + 1;
    }
    for (const count of counts) {
      assert.ok(
        Math.abs(count - draws / k) <= draws * 0.01,
        `counts: ${counts.join(', ')}`,
      );
    }
  });
});
