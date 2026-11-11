import type { World } from './hole';
import { maze } from './maze';
import { type Cell, type Room, roomKey } from './room';
import { openNeighbours } from './rooms';
import { seals } from './seals';
import { mazeWalls, type Walls } from './walls';

const BYTE_BITS = 8;

/** Exactly `count` random bits as a non-negative integer. */
function bits(random: (bytes: Uint8Array) => void, count: number): bigint {
  const bytes = new Uint8Array(Math.ceil(count / BYTE_BITS));
  random(bytes);
  const all = bytes.reduce(
    (acc, byte) => (acc << BigInt(BYTE_BITS)) | BigInt(byte),
    0n,
  );
  return all & ((1n << BigInt(count)) - 1n);
}

const SEED_BITS = 64;

/** Steps through open walls from `from` to `to`, both on one small floor. */
export function steps(walls: Walls, from: Room, to: Room): number {
  const seen = new Set([roomKey(from)]);
  let ring = [from];
  for (let step = 0; ring.length > 0; step += 1) {
    if (ring.some((room) => roomKey(room) === roomKey(to))) return step;
    ring = ring.flatMap((room) =>
      openNeighbours(walls, room).filter((next) => {
        const key = roomKey(next);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }),
    );
  }
  throw new Error(`${roomKey(to)} is not reachable from ${roomKey(from)}`);
}

/**
 * Floor 2's hole room is two steps from its landing, so of its four rooms,
 * which every maze lays out as one chain, exactly one is off the path.
 */
export const FLOOR_TWO_PATH = 2;

function keepsFloorTwo(seed: string, answers: Cell[]): boolean {
  const [landing, below] = answers;
  if (landing === undefined || below === undefined) return true;
  return (
    steps(
      mazeWalls(maze(seed)),
      { n: 2, ...landing },
      { n: 2, x: below.x >> 1n, y: below.y >> 1n },
    ) === FLOOR_TWO_PATH
  );
}

/**
 * Plants a world of `floors` floors: a random 64-bit seed, and for each floor
 * but the last a landing room on the next floor, committed to. The draw is
 * uniform among the worlds that keep `FLOOR_TWO_PATH`, redrawn whole until
 * one does. The answers are the landing rooms (`answers[n - 1]` on floor
 * `n + 1`); the world alone cannot yield them.
 */
export async function plant(
  floors: number,
  random: (bytes: Uint8Array) => void,
): Promise<{ world: World; answers: Cell[] }> {
  const { seed, answers } = draw(floors, random);
  const { hole } = seals(seed);
  const holes = await Promise.all(
    answers.map(async ({ x, y }, index) => hole.at({ n: index + 1, x, y })),
  );
  return { world: { seed, holes }, answers };
}

/** A seed and landing rooms, redrawn whole until they keep `FLOOR_TWO_PATH`. */
function draw(
  floors: number,
  random: (bytes: Uint8Array) => void,
): { seed: string; answers: Cell[] } {
  for (;;) {
    const seed = bits(random, SEED_BITS).toString();
    const answers = Array.from({ length: floors - 1 }, (_, index) => ({
      x: bits(random, index + 1),
      y: bits(random, index + 1),
    }));
    if (keepsFloorTwo(seed, answers)) return { seed, answers };
  }
}
