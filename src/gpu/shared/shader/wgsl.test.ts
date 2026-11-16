import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { assemble, wgsl } from './wgsl';

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
