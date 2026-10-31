import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { stampFrontmatter } from './translation-stamp.ts';

describe('stampFrontmatter', () => {
  it('adds the stamp to frontmatter that has none', () => {
    assert.equal(
      stampFrontmatter('---\ndescription: x\n---\n\n# Title\n', 'abc'),
      '---\ndescription: x\ntranslatedFrom: abc\n---\n\n# Title\n',
    );
  });

  it('replaces a stamp already there, leaving the rest', () => {
    assert.equal(
      stampFrontmatter(
        '---\ntranslatedFrom: old\ndescription: x\n---\nbody\n',
        'new',
      ),
      '---\ntranslatedFrom: new\ndescription: x\n---\nbody\n',
    );
  });

  it('leaves the body alone even where it repeats the key', () => {
    assert.equal(
      stampFrontmatter('---\na: 1\n---\ntranslatedFrom: body\n', 'h'),
      '---\na: 1\ntranslatedFrom: h\n---\ntranslatedFrom: body\n',
    );
  });

  it('throws on a file with no frontmatter', () => {
    assert.throws(() => stampFrontmatter('# Title\n', 'h'));
  });
});
