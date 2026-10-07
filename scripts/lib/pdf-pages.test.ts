import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pdfPageCount } from './pdf-pages.ts';

const pdf = (...lines: string[]): Buffer =>
  Buffer.from(lines.join('\n'), 'latin1');

const PAGE = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] >>';

describe('pdfPageCount', () => {
  it('counts the leaves, not the tree node', () => {
    assert.equal(
      pdfPageCount(
        pdf('<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>', PAGE, PAGE),
        'two.pdf',
      ),
      2,
    );
  });

  it('reads the spacing-free spelling', () => {
    assert.equal(pdfPageCount(pdf('<</Type/Page/Parent 2 0 R>>'), 'a.pdf'), 1);
  });

  it('throws on a file with no page objects in the clear', () => {
    assert.throws(
      () => pdfPageCount(pdf('<< /Type /ObjStm /N 4 >>'), 'packed.pdf'),
      /packed\.pdf has no readable page objects/,
    );
  });
});
