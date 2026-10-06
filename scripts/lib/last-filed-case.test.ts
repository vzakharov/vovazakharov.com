import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { lastFiledCase } from './last-filed-case.ts';

const filed = (number: string, title: string): string =>
  `---\ncase: ${number}\ndate: 2015-08-01\nfiled: 2026-10-05\nauthor: vova\n---\n\nSome lede.\n\n# ${title}\n\nBody.\n`;

describe('lastFiledCase', () => {
  it('picks the highest case number, whatever order the files come in', () => {
    assert.deepEqual(
      lastFiledCase([
        filed('BAS-0001', 'hitchBOT'),
        filed('BAS-0010', 'The tenth'),
        filed('BAS-0002', 'The second'),
      ]),
      { number: 'BAS-0010', filed: '2026-10-05', title: 'The tenth' },
    );
  });

  it('throws on a case file without a number, a filing date or a title', () => {
    assert.throws(
      () =>
        lastFiledCase(['---\ndate: 2015-08-01\n---\n\n# Untitled number\n']),
      /without a case number/,
    );
    assert.throws(
      () => lastFiledCase(['---\ncase: BAS-0001\n---\n\n# Unfiled\n']),
      /without a case number, a filing date/,
    );
    assert.throws(
      () =>
        lastFiledCase([
          '---\ncase: BAS-0001\nfiled: 2026-10-05\n---\n\nNo heading.\n',
        ]),
      /without a case number, a filing date or a "# " title/,
    );
  });

  it('throws on an empty docket', () => {
    assert.throws(() => lastFiledCase([]), /no cases/);
  });
});
