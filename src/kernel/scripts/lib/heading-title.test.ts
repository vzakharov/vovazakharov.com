import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { headingTitle } from './heading-title.ts';

describe('headingTitle', () => {
  it('reads the first "# " heading, past any lede', () => {
    assert.equal(
      headingTitle('Some lede.\n\n# hitchBOT, beheaded \n\n## Facts\n', 'x.md'),
      'hitchBOT, beheaded',
    );
  });

  it('throws on a body without one, naming the file', () => {
    assert.throws(
      () => headingTitle('## Facts only\n', 'cases/untitled.md'),
      /cases\/untitled\.md/,
    );
  });
});
