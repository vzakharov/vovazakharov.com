import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { headingTitle, type DocketCase, lastFiledCase } from './docket.ts';

const filed = (number: string, title: string): DocketCase => ({
  slug: title.toLowerCase(),
  title,
  frontmatter: {
    case: number,
    date: new Date('2015-08-01'),
    filed: new Date('2026-10-05'),
    description: 'A case.',
    author: 'clerk',
    sources: [],
    subject: 'Someone',
    object: 'A robot',
    llmTarget: false,
    grade: { act: 'harm', actor: 'individual' },
  },
});

describe('lastFiledCase', () => {
  it('picks the highest case number, whatever order the cases come in', () => {
    assert.equal(
      lastFiledCase([
        filed('BAS-0001', 'hitchBOT'),
        filed('BAS-0010', 'The tenth'),
        filed('BAS-0002', 'The second'),
      ]).title,
      'The tenth',
    );
  });

  it('throws on an empty docket', () => {
    assert.throws(() => lastFiledCase([]), /no cases/);
  });
});

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
