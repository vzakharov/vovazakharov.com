import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { setImmediate } from 'node:timers/promises';

import type { Address, Pose } from '@/cube/entities/world';

import { followAddress, WRITE_EVERY } from './fragment';

const pose = (over: Partial<Pose> = {}): Pose => ({
  n: 1,
  x: 0n,
  y: 0n,
  u: 0.5,
  v: 0.5,
  eyeAbove: 0.32,
  scale: 1,
  yaw: 0,
  elevation: 0,
  ...over,
});

/** A follower from floor 1 recording each address it encodes, and each error. */
function recording() {
  const encoded: Address[] = [];
  const errors: Error[] = [];
  const follow = followAddress(
    1,
    null,
    async (address) => {
      encoded.push(address);
      await setImmediate();
      return String(encoded.length);
    },
    (fragment) => {
      assert.ok(fragment);
    },
    (error) => {
      errors.push(error);
    },
  );
  return { follow, encoded, errors };
}

describe('followAddress', () => {
  it('writes at once, then while moving at most every interval', () => {
    const { follow, encoded } = recording();
    follow(pose(), true, 0);
    for (let i = 1; i <= 10; i += 1) {
      follow(pose({ u: 0.5 + i / 100 }), true, 0.1);
    }
    assert.equal(encoded.length, 1 + Math.floor(1 / WRITE_EVERY));
  });

  it('writes when the walk stops, and not again while it stands', () => {
    const { follow, encoded } = recording();
    follow(pose(), true, 0);
    follow(pose({ yaw: 0.1 }), true, 0.1);
    follow(pose({ yaw: 0.1 }), true, 0.1);
    follow(pose({ yaw: 0.1 }), true, 0.1);
    assert.deepEqual(
      encoded.map(({ at }) => at.yaw),
      [0, 0.1],
    );
  });

  it('writes nothing mid-shrink, and takes the landing room as the hatch', () => {
    const { follow, encoded } = recording();
    follow(pose(), true, 0);
    follow(pose({ u: 0.9 }), false, 0.01);
    follow(pose({ n: 2, x: 1n, u: 0.8 }), true, 0.01);
    assert.equal(encoded.length, 2);
    assert.deepEqual(encoded[1]?.hatch, { x: 1n, y: 0n });
  });

  it('reports a floor it did not land on', () => {
    const { follow, encoded, errors } = recording();
    follow(pose({ n: 3 }), true, 0);
    assert.equal(encoded.length, 0);
    assert.equal(errors.length, 1);
  });

  it('lands only the latest write', async () => {
    const written: string[] = [];
    const { promise: held, resolve: release } = Promise.withResolvers<void>();
    let calls = 0;
    const follow = followAddress(
      1,
      null,
      async () => {
        calls += 1;
        const mine = String(calls);
        if (calls === 1) await held;
        return mine;
      },
      (fragment) => {
        written.push(fragment);
      },
      (error) => assert.fail(error),
    );
    follow(pose(), true, 0);
    follow(pose({ u: 0.1 }), true, 0);
    follow(pose({ u: 0.1 }), true, 0);
    release();
    await setImmediate();
    assert.deepEqual(written, ['2']);
  });
});
