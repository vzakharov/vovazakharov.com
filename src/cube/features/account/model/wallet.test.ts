import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { SignMount } from '@/cube/entities/world';

import {
  credited,
  EMPTY_WALLET,
  parsed,
  serialized,
  withRoom,
} from './wallet';

const MOUNT: SignMount = {
  at: { u: 0.5, v: 0.1 },
  facing: { u: 0, v: 1 },
  onPost: false,
};

describe('wallet', () => {
  it('buys a room for its price out of what was credited', () => {
    const wallet = withRoom(credited(EMPTY_WALLET, 1000), '2/0/1', MOUNT, 305);
    assert.equal(wallet.balance, 695);
    assert.deepEqual(wallet.holdings.get('2/0/1'), MOUNT);
  });

  it('refuses a room it cannot pay for, or holds already', () => {
    assert.throws(() => withRoom(EMPTY_WALLET, '2/0/1', MOUNT, 5), RangeError);
    const held = withRoom(credited(EMPTY_WALLET, 10), '2/0/1', MOUNT, 5);
    assert.throws(() => withRoom(held, '2/0/1', MOUNT, 5));
  });

  it('credits only whole кубики above zero', () => {
    for (const bad of [0, -5, 1.5, Number.NaN]) {
      assert.throws(() => credited(EMPTY_WALLET, bad));
    }
  });

  it('comes back from storage as it went in', () => {
    const wallet = withRoom(credited(EMPTY_WALLET, 50), '9/3/4', MOUNT, 5);
    assert.deepEqual(parsed(serialized(wallet)), wallet);
  });

  it('refuses stored text that is no wallet', () => {
    for (const text of [
      '{}',
      '{"balance":-1,"holdings":[]}',
      '{"balance":1.5,"holdings":[]}',
      '{"balance":1,"holdings":[["2/0/1",{"at":{"u":0}}]]}',
    ]) {
      assert.throws(() => parsed(text), /unreadable/);
    }
  });
});
