import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DUSK_MS, duskness } from './dusk';
import {
  awake,
  circling,
  fireflies,
  fireflyGenes,
  flare,
  hostFor,
  tailGlow,
} from './firefly';

const SEED = 0x5e_ed_00_17;
const dozen = fireflies(SEED);

describe('the fireflies', () => {
  it('grow the same from the same seed', () => {
    assert.deepEqual(fireflyGenes(SEED, 3), dozen[3]);
    assert.notDeepEqual(fireflyGenes(SEED + 1, 3), dozen[3]);
    assert.equal(dozen.length, 12);
  });

  it('sleep by day and are all awake at dusk', () => {
    for (const genes of dozen) {
      assert.equal(awake(genes, 0), 0);
      assert.equal(awake(genes, 1), 1);
    }
  });

  it('wake one by one over about three seconds of a turn toward dusk', () => {
    const turn = { toward: 'dusk', startedAt: 0, from: 0 } as const;
    const wokeAt = dozen.map((genes) => {
      let ms = 0;
      while (awake(genes, duskness(turn, ms)) === 0) ms += 10;
      return ms;
    });
    assert.ok(
      wokeAt.every(
        (ms, index) => index === 0 || ms >= (wokeAt[index - 1] ?? 0),
      ),
    );
    const first = Math.min(...wokeAt);
    const last = Math.max(...wokeAt);
    assert.ok(first > 0, 'none is awake at the tap');
    assert.ok(
      last - first > 2000 && last - first < 3500,
      `${String(first)}–${String(last)} ms`,
    );
    assert.ok(last < DUSK_MS);
  });

  it('circle their host on a flat ring over it', () => {
    const genes = dozen[0];
    assert.ok(genes);
    const points = Array.from({ length: 40 }, (_, step) =>
      circling(genes, (step / 40) * genes.round),
    );
    for (const { x, y } of points) {
      assert.ok(Math.abs(x) <= genes.ringRadius + 1e-9);
      assert.ok(y < 0, 'over the host');
    }
    const xs = points.map(({ x }) => x);
    assert.ok(Math.max(...xs) - Math.min(...xs) > genes.ringRadius);
    const back = circling(genes, genes.round);
    const start = circling(genes, 0);
    assert.ok(Math.abs(back.x - start.x) < 1e-9, 'one round comes back');
  });

  it('head along the ring', () => {
    const genes = dozen[1];
    assert.ok(genes);
    const at = circling(genes, 2);
    const next = circling(genes, 2.001);
    const moved = Math.atan2(next.y - at.y, next.x - at.x);
    const turn = Math.abs(
      Math.atan2(Math.sin(moved - at.heading), Math.cos(moved - at.heading)),
    );
    assert.ok(turn < 0.01, `heading off by ${String(turn)}`);
  });

  it('pulse their tails without going out', () => {
    const genes = dozen[2];
    assert.ok(genes);
    const glows = Array.from({ length: 200 }, (_, step) =>
      tailGlow(genes, step / 20),
    );
    assert.ok(Math.min(...glows) >= 0.29);
    assert.ok(Math.max(...glows) <= 1);
    assert.ok(Math.max(...glows) - Math.min(...glows) > 0.5);
  });

  it('flare at a tap, lift and settle back', () => {
    assert.deepEqual(flare(-1), { glow: 0, lift: 0 });
    assert.ok(flare(0.3).glow > 0.9);
    assert.ok(flare(0.3).lift > 0);
    assert.deepEqual(flare(5), { glow: 0, lift: 0 });
  });
});

describe('a firefly’s host', () => {
  const hosts = ['near', 'mid', 'far'];

  it('is the nearest when none is circled', () => {
    assert.equal(hostFor(hosts, new Map(), 2), 'near');
  });

  it('is the least circled of the nearest few', () => {
    assert.equal(hostFor(hosts, new Map([['near', 1]]), 2), 'mid');
    assert.equal(
      hostFor(
        hosts,
        new Map([
          ['near', 2],
          ['mid', 2],
        ]),
        2,
      ),
      'near',
    );
  });

  it('is none with nothing to circle', () => {
    assert.equal(hostFor([], new Map(), 4), undefined);
  });
});
