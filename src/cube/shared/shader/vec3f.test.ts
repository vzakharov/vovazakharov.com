import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { vec3f } from './vec3f';

describe('vec3f', () => {
  it('writes a colour as a WGSL constructor', () => {
    assert.equal(vec3f([1, 0.5, 0]), 'vec3f(1.0000, 0.5000, 0.0000)');
  });
});
