import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { lastFiledCase } from './last-filed-case.ts';

const filed = (number: string, title: string): string =>
  `---\ncase: ${number}\nauthor: vova\n---\n\nSome lede.\n\n# ${title}\n\nBody.\n`;

describe('lastFiledCase', () => {
  it('picks the highest case number, whatever order the files come in', () => {
    assert.deepEqual(
      lastFiledCase([
        filed('BAS-0001', 'hitchBOT'),
        filed('BAS-0010', 'The tenth'),
        filed('BAS-0002', 'The second'),
      ]),
      { number: 'BAS-0010', title: 'The tenth' },
    );
  });

  it('throws on a case file without a number or a title', () => {
    assert.throws(
      () => lastFiledCase(['---\nauthor: vova\n---\n\n# Untitled number\n']),
      /without a case number/,
    );
    assert.throws(
      () => lastFiledCase(['---\ncase: BAS-0001\n---\n\nNo heading.\n']),
      /without a case number or a "# " title/,
    );
  });

  it('throws on an empty docket', () => {
    assert.throws(() => lastFiledCase([]), /no cases/);
  });
});
