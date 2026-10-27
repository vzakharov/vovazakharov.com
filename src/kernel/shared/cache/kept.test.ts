import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { keptIn } from './kept.ts';

describe('keptIn', () => {
  it('makes a value once and hands back the kept one after', () => {
    const cache = new Map<string, { made: number }>();
    let made = 0;
    const make = () => ({ made: ++made });
    const first = keptIn(cache, 'a', make);
    assert.equal(keptIn(cache, 'a', make), first);
    assert.equal(made, 1);
  });

  // A falsy value is a value: only `undefined` reads as nothing kept.
  it('keeps a false or a zero', () => {
    const cache = new Map<string, number | boolean>();
    keptIn(cache, 'zero', () => 0);
    keptIn(cache, 'no', () => false);
    assert.equal(
      keptIn(cache, 'zero', () => 1),
      0,
    );
    assert.equal(
      keptIn(cache, 'no', () => true),
      false,
    );
  });

  it('keys a WeakMap by the object', () => {
    const cache = new WeakMap<object, string>();
    const key = {};
    keptIn(cache, key, () => 'kept');
    assert.equal(
      keptIn(cache, key, () => 'again'),
      'kept',
    );
    assert.equal(
      keptIn(cache, {}, () => 'other'),
      'other',
    );
  });
});
