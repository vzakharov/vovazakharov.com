import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import COPY from './messages/en.json';

describe('look hint copy', () => {
  const looks = COPY.hint.keys.find(({ does }) => does === 'look up, down');

  it('names the keys the controls hint gives the look', () => {
    assert.ok(looks !== undefined);
    const [up, down] = looks.keys.split(' ');
    assert.ok(COPY.look.up.keys.includes(String(up)));
    assert.ok(COPY.look.down.keys.includes(String(down)));
  });

  it('gives a touch screen the gesture rather than a key', () => {
    for (const { keys, touch } of [COPY.look.up, COPY.look.down]) {
      assert.notEqual(keys, touch);
      assert.match(touch, /two fingers/i);
    }
  });
});
