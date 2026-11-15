import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type Address, decodeAddress, encodeAddress } from './address';
import { plant } from './plant';
import { counterRandom } from './plant.test-kit';

const FLOORS = 6;

const { world, answers } = await plant(FLOORS, counterRandom());

/** An address on floor `n` of the test world, its hatch the real one. */
const on = (n: number): Address => ({
  hatch: answers[n - 2] ?? null,
  at: {
    n,
    x: (1n << BigInt(n - 1)) - 1n,
    y: 0n,
    u: 0.3125,
    v: 0.8125,
    yaw: Math.PI / 2,
    elevation: -0.5,
  },
});

/** `text` with the character at `index` swapped for another. */
const swapped = (text: string, index: number): string =>
  text.slice(0, index) +
  (text[index] === 'A' ? 'B' : 'A') +
  text.slice(index + 1);

/** `address` written and read back in the test world. */
const roundTrip = async (address: Address): Promise<Address | null> =>
  decodeAddress(world, await encodeAddress(world, address));

describe('an address', () => {
  it('round-trips on every floor, standing where it was written', async () => {
    const floors = Array.from({ length: FLOORS }, (_, i) => i + 1);
    const decodes = await Promise.all(
      floors.map(async (n) => roundTrip(on(n))),
    );
    for (const [i, decoded] of decodes.entries()) {
      const n = i + 1;
      const address = on(n);
      assert.ok(decoded);
      assert.deepEqual(decoded.hatch, address.hatch);
      const { at } = decoded;
      assert.deepEqual([at.n, at.x, at.y], [n, address.at.x, address.at.y]);
      assert.ok(Math.abs(at.u - address.at.u) < 2 ** -16);
      assert.ok(Math.abs(at.v - address.at.v) < 2 ** -16);
      assert.ok(Math.abs(at.yaw - address.at.yaw) < 1e-3);
      assert.ok(Math.abs(at.elevation - address.at.elevation) < 0.02);
      assert.ok(Math.abs(at.elevation) <= Math.abs(address.at.elevation));
    }
  });

  it('is base64url, its hatch growing a bit per axis a floor', async () => {
    const first = await encodeAddress(world, on(1));
    const third = await encodeAddress(world, on(3));
    assert.match(first, /^[\w-]+$/);
    assert.equal(first.length, 15);
    assert.equal(third.length, 16);
  });

  it('reads the same written twice, and differently in another world', async () => {
    const other = await plant(FLOORS, counterRandom());
    assert.equal(
      await encodeAddress(world, on(2)),
      await encodeAddress(other.world, on(2)),
    );
    // The same counter, a byte along, draws another world.
    const shifted = counterRandom();
    shifted(new Uint8Array(1));
    const { world: elsewhere } = await plant(FLOORS, shifted);
    assert.notEqual(elsewhere.seed, world.seed);
    assert.equal(
      await decodeAddress(elsewhere, await encodeAddress(world, on(1))),
      null,
    );
  });

  it('is refused with any hatch but the one the hole above commits to', async () => {
    const n = 3;
    const side = 1n << BigInt(n - 1);
    const hatches = Array.from({ length: Number(side * side) }, (_, i) => ({
      x: BigInt(i) % side,
      y: BigInt(i) / side,
    }));
    const decoded = await Promise.all(
      hatches.map(async (hatch) => roundTrip({ ...on(n), hatch })),
    );
    const real = answers[n - 2];
    assert.ok(real);
    assert.deepEqual(
      decoded.map((address) => address?.hatch ?? null),
      hatches.map((hatch) =>
        hatch.x === real.x && hatch.y === real.y ? hatch : null,
      ),
    );
  });

  it('is refused with the hatch of the floor above', async () => {
    const [, above, own] = answers;
    assert.ok(above && own);
    assert.notDeepEqual(above, own);
    assert.equal(await roundTrip({ ...on(4), hatch: above }), null);
  });

  it('is refused when any one character is changed', async () => {
    const text = await encodeAddress(world, on(3));
    const edits = Array.from(text, (_, i) => swapped(text, i));
    const decoded = await Promise.all(
      edits.map(async (edit) => decodeAddress(world, edit)),
    );
    assert.deepEqual(
      decoded,
      edits.map(() => null),
    );
  });

  it('is refused when malformed', async () => {
    const text = await encodeAddress(world, on(2));
    const bad = ['', '!', text.slice(0, -1), `${text}A`, `${text}AAAA`, 'AA'];
    const decoded = await Promise.all(
      bad.map(async (fragment) => decodeAddress(world, fragment)),
    );
    assert.deepEqual(
      decoded,
      bad.map(() => null),
    );
  });

  it('will not write a hatch that does not fit its floor', async () => {
    await assert.rejects(encodeAddress(world, { ...on(3), hatch: null }));
    await assert.rejects(
      encodeAddress(world, { ...on(1), hatch: { x: 0n, y: 0n } }),
    );
    await assert.rejects(
      encodeAddress(world, { hatch: null, at: { ...on(1).at, n: FLOORS + 1 } }),
    );
  });
});
