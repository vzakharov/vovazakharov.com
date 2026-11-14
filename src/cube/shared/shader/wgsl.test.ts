import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { assemble, vec3f, wgsl } from './wgsl';

describe('assemble', () => {
  const base = wgsl('base', 'fn base() {}');
  const left = wgsl('left', 'fn left() {}', base);
  const right = wgsl('right', 'fn right() {}', base);

  it('places each piece once, after what it needs', () => {
    assert.equal(
      assemble([wgsl('top', 'fn top() {}', left, right)]),
      ['fn base() {}', 'fn left() {}', 'fn right() {}', 'fn top() {}'].join(
        '\n\n',
      ),
    );
  });

  it('takes several roots as one source', () => {
    assert.equal(
      assemble([left, base, right]),
      ['fn base() {}', 'fn left() {}', 'fn right() {}'].join('\n\n'),
    );
  });

  it('refuses two different pieces under one name', () => {
    assert.throws(
      () => assemble([left, wgsl('left', 'fn other() {}')]),
      /both named left/,
    );
  });
});

describe('vec3f', () => {
  it('writes a colour as a WGSL constructor', () => {
    assert.equal(vec3f([1, 0.5, 0]), 'vec3f(1.0000, 0.5000, 0.0000)');
  });
});
