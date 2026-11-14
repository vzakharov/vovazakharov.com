// The game's own world: the floor maze rolled as src/dice/shared/roll and
// src/cube/entities/world/model/maze.ts roll it, and the landing and hole
// found by brute force against the world's SHA-256 commitments.
(function (root) {
  'use strict';

  const WORLD = {
    seed: '13628364118019185653',
    holes: null, // filled from world-holes.js
  };

  const C1 = 0xcc9e2d51, C2 = 0x1b873593, KEY_SEEDS = [0x9747b28c, 0x5bd1e995];
  const rotl = (x, r) => (x << r) | (x >>> (32 - r));
  const scramble = (k) => Math.imul(rotl(Math.imul(k, C1), 15), C2);
  const block = (h, k) => (Math.imul(rotl(h ^ scramble(k), 13), 5) + 0xe6546b64) >>> 0;
  function finalize(h, length) {
    let x = h ^ length;
    x ^= x >>> 16;
    x = Math.imul(x, 0x85ebca6b);
    x ^= x >>> 13;
    x = Math.imul(x, 0xc2b2ae35);
    x ^= x >>> 16;
    return x >>> 0;
  }
  function resume(h, before, bytes, length) {
    const byte = (n) => bytes[n] ?? 0;
    const whole = length & ~3;
    let state = h;
    for (let n = 0; n < whole; n += 4)
      state = block(state, byte(n) | (byte(n + 1) << 8) | (byte(n + 2) << 16) | (byte(n + 3) << 24));
    let tail = 0;
    for (let n = length - 1; n >= whole; n -= 1) tail = (tail << 8) | byte(n);
    if (length > whole) state ^= scramble(tail);
    return finalize(state, before + length);
  }
  const murmur3 = (bytes, seed) => resume(seed >>> 0, 0, bytes, bytes.length);

  function pathHash(world) {
    const digits = Uint8Array.from(world, (c) => c.codePointAt(0) ?? 0);
    const [k0, k1] = KEY_SEEDS.map((s) => murmur3(digits, s));
    const keyed = block(block(0, k0), k1);
    const enc = new TextEncoder();
    return (path) => {
      const bytes = enc.encode(path);
      return resume(keyed, 8, bytes, bytes.length);
    };
  }

  const EDGES = ['north', 'east', 'south', 'west'];

  /** Block source for DoorSim.buildMaze: floor `n`'s blocks as the game rolls them. */
  function blockSource(world, n) {
    const H = pathHash(world);
    return (L, bx, by) => {
      const base = `block/${n}/${L}/${bx}/${by}`;
      const omit = Math.floor((H(`${base}/omit`) * 4) / 2 ** 32);
      const door = EDGES.map((edge) => {
        const wide = (BigInt(H(`${base}/door/${edge}/0`)) << 32n) | BigInt(H(`${base}/door/${edge}/1`));
        return Number((wide * (1n << BigInt(L - 1))) >> 64n);
      });
      return { omit, door };
    };
  }

  async function sha256Hex(text) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * The room of floor `n + 1` that floor `n`'s hole drops into, by trying all
   * of them against the commitment, as anyone holding world.json can.
   */
  async function holeTarget(world, holes, n, progress) {
    const want = holes[n - 1];
    const side = 1 << n;
    const batch = 512;
    for (let start = 0; start < side * side; start += batch) {
      const tries = [];
      for (let i = start; i < Math.min(start + batch, side * side); i++) {
        const x = i % side, y = (i / side) | 0;
        tries.push(sha256Hex(`${world}/hole/${n}/${x}/${y}`).then((h) => (h === want ? { x, y } : null)));
      }
      const hit = (await Promise.all(tries)).find(Boolean);
      if (progress) progress(Math.min(1, (start + batch) / (side * side)));
      if (hit) return hit;
    }
    throw new Error(`No room of floor ${n + 1} matches floor ${n}'s commitment`);
  }

  /** Floor `n` as the game plays it: its landing and its hole room. */
  async function gameFloor(n, progress) {
    const holes = root.WORLD_HOLES;
    const fall = await holeTarget(WORLD.seed, holes, n - 1, (p) => progress && progress(p / 2));
    const drop = await holeTarget(WORLD.seed, holes, n, (p) => progress && progress(0.5 + p / 2));
    const side = 1 << (n - 1);
    return { landing: fall.y * side + fall.x, hole: (drop.y >> 1) * side + (drop.x >> 1) };
  }

  root.DoorWorld = { WORLD, pathHash, blockSource, holeTarget, gameFloor };
  if (typeof module !== 'undefined') module.exports = root.DoorWorld;
})(typeof globalThis !== 'undefined' ? globalThis : this);
