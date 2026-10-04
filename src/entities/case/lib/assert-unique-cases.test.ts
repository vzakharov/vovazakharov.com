import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { assertUniqueCases } from './assert-unique-cases.ts';

const filed = (slug: string, number: string) => ({
  slug,
  frontmatter: { case: number, date: new Date('2026-10-02') },
});

describe('assertUniqueCases', () => {
  it('passes a docket whose numbers differ', () => {
    assert.doesNotThrow(() => {
      assertUniqueCases([
        filed('hitchbot', 'BAS-0001'),
        filed('torture-chamber', 'BAS-0002'),
      ]);
    });
  });

  it('passes an empty docket', () => {
    assert.doesNotThrow(() => {
      assertUniqueCases([]);
    });
  });

  it('names every slug filed under a shared number', () => {
    assert.throws(() => {
      assertUniqueCases([
        filed('hitchbot', 'BAS-0001'),
        filed('torture-chamber', 'BAS-0002'),
        filed('figure-02-molten-steel', 'BAS-0001'),
      ]);
    }, /BAS-0001: hitchbot, figure-02-molten-steel/);
  });
});
