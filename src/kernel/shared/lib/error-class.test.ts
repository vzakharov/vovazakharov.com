import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { asError, errorClass, withCause } from './error-class';

describe('errorClass', () => {
  it('names its instances', () => {
    const PricingError = errorClass('PricingError');

    assert.equal(new PricingError('no answer').name, 'PricingError');
  });
});

describe('asError', () => {
  it('passes an Error through', () => {
    const error = new TypeError('bad');

    assert.equal(asError(error), error);
  });

  it('wraps anything else, keeping it as the cause', () => {
    const wrapped = asError('a string');

    assert.equal(wrapped.name, 'NonErrorThrown');
    assert.equal(wrapped.message, 'a string');
    assert.equal(wrapped.cause, 'a string');
  });
});

describe('withCause', () => {
  it('makes what was caught the cause, as an Error', () => {
    const error = new TypeError('bad');

    assert.equal(withCause(error).cause, error);
    const { cause } = withCause(7);

    assert.ok(cause instanceof Error);
    assert.equal(cause.name, 'NonErrorThrown');
  });
});
