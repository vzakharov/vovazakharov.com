import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { holeQuarter, parseWorld, type World } from './hole';
import { plant } from './plant';
import { planted } from './planted';

/** A deterministic byte source: a counter, run through a multiplicative mix. */
function counterRandom(): (bytes: Uint8Array) => void {
  let counter = 0;
  return (bytes) => {
    for (let i = 0; i < bytes.length; i += 1) {
      counter += 1;
      bytes[i] = (Math.imul(counter, 2_654_435_761) >>> 24) & 0xff;
    }
  };
}

const FLOORS = 6;

/** Every room of floor `n` with its hole quarter, if it has one. */
async function scan(world: World, n: number) {
  const side = 2 ** (n - 1);
  const rooms = Array.from({ length: side * side }, (_, i) => ({
    x: i % side,
    y: Math.floor(i / side),
  }));
  const quarters = await Promise.all(
    rooms.map(async ({ x, y }) => holeQuarter(world, n, BigInt(x), BigInt(y))),
  );
  return rooms.flatMap(({ x, y }, i) => {
    const quarter = quarters[i];
    return quarter ? [[x, y, quarter.qx, quarter.qy]] : [];
  });
}

describe('plant', () => {
  it('gives each floor one hole room, over the kept landing room', async () => {
    const { world, answers } = await plant(FLOORS, counterRandom());
    assert.equal(world.holes.length, FLOORS - 1);
    assert.equal(answers.length, FLOORS - 1);
    const found = await Promise.all(
      answers.map(async (_, index) => scan(world, index + 1)),
    );
    assert.deepEqual(
      found,
      answers.map(({ x, y }) => [
        [Number(x >> 1n), Number(y >> 1n), Number(x & 1n), Number(y & 1n)],
      ]),
    );
  });

  it('has no hole on the last floor', async () => {
    const { world } = await plant(FLOORS, counterRandom());
    assert.deepEqual(await scan(world, FLOORS), []);
  });

  it('draws a seed with no leading zero and rooms inside the floor', async () => {
    const { world, answers } = await plant(20, counterRandom());
    assert.match(world.seed, /^(?:0|[1-9]\d*)$/);
    for (const [index, { x, y }] of answers.entries()) {
      const side = 2n ** BigInt(index + 1);
      assert.ok(x >= 0n && x < side && y >= 0n && y < side);
    }
  });
});

describe('the planted world', () => {
  it('parses and has 66 commitments', () => {
    assert.equal(planted.holes.length, 66);
  });

  it('is rejected when malformed', () => {
    assert.throws(() => parseWorld({ seed: '1', holes: ['ABC'] }));
    assert.throws(() => parseWorld({ seed: '01', holes: [] }));
    assert.throws(() => parseWorld({ holes: [] }));
  });
});
