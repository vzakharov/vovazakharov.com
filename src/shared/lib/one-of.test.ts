import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isOneOf, oneOf } from './one-of.ts';

const VALUES = ['vova', 'lsa'] as const;

describe('isOneOf', () => {
  it('accepts a listed literal', () => {
    assert.equal(isOneOf(VALUES)('lsa'), true);
  });

  it('rejects an unlisted string', () => {
    assert.equal(isOneOf(VALUES)('playgram'), false);
  });

  // The guard takes `unknown`, so anything a route segment or an environment
  // read can hand over has to answer false rather than throw.
  it('rejects a non-string', () => {
    for (const value of [undefined, null, 0, {}, ['lsa']]) {
      assert.equal(isOneOf(VALUES)(value), false);
    }
  });
});

describe('oneOf', () => {
  it('returns the value it was given', () => {
    assert.equal(oneOf(VALUES, 'vova', 'NEXT_PUBLIC_SITE'), 'vova');
  });

  it('names the subject, the list and the bad value in the throw', () => {
    assert.throws(
      () => oneOf(VALUES, undefined, 'NEXT_PUBLIC_SITE'),
      /^Error: NEXT_PUBLIC_SITE must be one of vova, lsa, not undefined$/,
    );
  });
});
