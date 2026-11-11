import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { holeQuarter, holesOf, parseWorld, type World } from './hole';
import { maze } from './maze';
import { FLOOR_TWO_PATH, plant, steps } from './plant';
import { counterRandom } from './plant.test-kit';
import { planted } from './planted';
import { mazeWalls } from './walls';

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

/** Floor 2's steps from its landing room to its hole room, read off the holes. */
async function floorTwoPath(world: World): Promise<number> {
  const [[, , lx, ly]] = await scan(world, 1);
  const [[hx, hy]] = await scan(world, 2);
  return steps(
    mazeWalls(maze(world.seed)),
    { n: 2, x: BigInt(lx), y: BigInt(ly) },
    { n: 2, x: BigInt(hx), y: BigInt(hy) },
  );
}

describe('the floor-two rule', () => {
  it('holds in every world plant draws', async () => {
    const random = counterRandom();
    for (let draw = 0; draw < 8; draw += 1) {
      const { world } = await plant(FLOORS, random);
      assert.equal(await floorTwoPath(world), FLOOR_TWO_PATH);
    }
  });

  it('holds in the planted world', async () => {
    assert.equal(await floorTwoPath(planted), FLOOR_TWO_PATH);
  });
});

describe('holesOf', () => {
  it('answers as holeQuarter for the rooms it resolved, and only them', async () => {
    const { world, answers } = await plant(FLOORS, counterRandom());
    const landing = answers[1];
    assert.ok(landing);
    const room = { n: 2, x: landing.x >> 1n, y: landing.y >> 1n };
    const holeOf = await holesOf(world, [room, { n: 2, x: 0n, y: 0n }]);
    assert.deepEqual(holeOf(room), {
      qx: Number(landing.x & 1n),
      qy: Number(landing.y & 1n),
    });
    assert.throws(() => holeOf({ n: 3, x: 0n, y: 0n }));
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
