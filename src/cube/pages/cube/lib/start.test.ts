import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { encodeAddress, planted } from '@/cube/entities/world';

import { startOf } from './start';

const NO_QUERY = new URLSearchParams();

describe('startOf', () => {
  it('starts asleep on the shore with no fragment', async () => {
    const start = await startOf(NO_QUERY, '');
    assert.equal(start?.ashore, 'asleep');
    assert.equal(start.resumable, true);
  });

  it('starts awake on the shore at #awake', async () => {
    const start = await startOf(NO_QUERY, 'awake');
    assert.equal(start?.ashore, 'awake');
    assert.equal(start.resumable, true);
    assert.equal(start.pose.n, 1);
  });

  it('resumes inside at an address the fragment spells', async () => {
    const at = { n: 1, x: 0n, y: 0n, u: 0.25, v: 0.75, yaw: 0, elevation: 0 };
    const fragment = await encodeAddress(planted, { hatch: null, at });
    const start = await startOf(NO_QUERY, fragment);
    assert.equal(start?.ashore, null);
    assert.equal(start.pose.n, 1);
    assert.ok(Math.abs(start.pose.u - 0.25) < 0.01);
  });

  it('leads nowhere from a fragment that spells nothing', async () => {
    assert.equal(await startOf(NO_QUERY, 'not-an-address'), null);
    assert.equal(await startOf(NO_QUERY, 'Awake'), null);
  });

  it('starts inside on the floor a cheat names, whatever the fragment', async () => {
    const start = await startOf(
      new URLSearchParams({ cheated_to: '2' }),
      'awake',
    );
    assert.equal(start?.ashore, null);
    assert.equal(start.pose.n, 2);
    assert.equal(start.resumable, false);
  });
});
