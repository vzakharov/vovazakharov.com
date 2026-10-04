import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { lastFiledCase } from './last-filed-case.ts';

const filed = (number: string, title: string): string =>
  `---\ncase: ${number}\ndate: 2015-08-01\nauthor: vova\n---\n\nSome lede.\n\n# ${title}\n\nBody.\n`;

describe('lastFiledCase', () => {
  it('picks the highest case number, whatever order the files come in', () => {
    assert.deepEqual(
      lastFiledCase([
        filed('BAS-0001', 'hitchBOT'),
        filed('BAS-0010', 'The tenth'),
        filed('BAS-0002', 'The second'),
      ]),
      { number: 'BAS-0010', date: '2015-08-01', title: 'The tenth' },
    );
  });

  it('throws on a case file without a number, a date or a title', () => {
    assert.throws(
      () =>
        lastFiledCase(['---\ndate: 2015-08-01\n---\n\n# Untitled number\n']),
      /without a case number/,
    );
    assert.throws(
      () => lastFiledCase(['---\ncase: BAS-0001\n---\n\n# Undated\n']),
      /without a case number, a date/,
    );
    assert.throws(
      () =>
        lastFiledCase([
          '---\ncase: BAS-0001\ndate: 2015-08-01\n---\n\nNo heading.\n',
        ]),
      /without a case number, a date or a "# " title/,
    );
  });

  it('throws on an empty docket', () => {
    assert.throws(() => lastFiledCase([]), /no cases/);
  });
});
