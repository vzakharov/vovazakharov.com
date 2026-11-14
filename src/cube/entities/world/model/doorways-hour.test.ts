import assert from 'node:assert/strict';
import { it } from 'node:test';

import {
  adjacency,
  type Kinded,
  roomsOf,
  sideOf,
  wallsOf,
} from './doorways.test-kit';
import { maze } from './maze';

/** Rooms a player walks into in an hour: a step every ~3.6 s. */
const HOUR = 1008;

/**
 * `steps` moves of a player who remembers every room: always on to the
 * nearest room not yet entered, the way back through known rooms included.
 * The rooms stood in, in order.
 */
function explore(adj: number[][], start: number, steps: number): number[] {
  const entered = new Uint8Array(adj.length);
  const prev = new Int32Array(adj.length);
  const stamp = new Int32Array(adj.length);
  const out = [start];
  entered[start] = 1;
  for (let here = start, round = 1; out.length <= steps; round += 1) {
    const queue = [here];
    stamp[here] = round;
    let found = -1;
    for (let head = 0; head < queue.length && found < 0; head += 1) {
      const u = queue[head] ?? 0;
      for (const v of adj[u] ?? []) {
        if (stamp[v] === round) continue;
        stamp[v] = round;
        prev[v] = u;
        if (entered[v] === 0) {
          found = v;
          break;
        }
        queue.push(v);
      }
    }
    if (found < 0) break;
    const leg: number[] = [];
    for (let r = found; r !== here; r = prev[r] ?? here) leg.push(r);
    out.push(...leg.toReversed().slice(0, steps + 1 - out.length));
    entered[found] = 1;
    here = found;
  }
  return out;
}

/** How many of `openings` a walk stands beside, each counted once. */
function met(rooms: number[], openings: Kinded[], side: number): number {
  const walked = new Set(rooms);
  return openings.filter((wall) =>
    roomsOf(wall, side).some((room) => walked.has(room)),
  ).length;
}

// The simulator's explorer met 54 doors and 18 gaps an hour on its floor 7, a
// maze with more openings than most (9.1 a hundred rooms against ~8.6).
it('an explorer meets about 50 doors and 15 gaps an hour on floor 7', (t) => {
  const n = 7;
  const side = sideOf(n);
  const tally = { door: 0, gap: 0, runs: 0 };
  for (const seed of ['1', '8675309', '42']) {
    const walls = wallsOf(maze(seed), n);
    const adj = adjacency(n, walls, ({ kind }) => kind !== 'wall');
    const doors = walls.filter(({ kind }) => kind === 'door');
    const gaps = walls.filter(({ kind }) => kind === 'gap');
    for (let run = 0; run < 10; run += 1) {
      const rooms = explore(adj, (run * 1777 + 5) % (side * side), HOUR);
      tally.door += met(rooms, doors, side);
      tally.gap += met(rooms, gaps, side);
      tally.runs += 1;
    }
  }
  const doors = tally.door / tally.runs;
  const gaps = tally.gap / tally.runs;
  t.diagnostic(`${doors} doors, ${gaps} gaps an hour`);
  assert.ok(doors > 40 && doors < 65, `${doors} doors`);
  assert.ok(gaps > 10 && gaps < 25, `${gaps} gaps`);
});
