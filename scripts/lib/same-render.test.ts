/**
 * What the churn guard is allowed to forgive, and what it must not.
 *
 * The fixtures are the fragments of real PDF syntax the comparator reads — the
 * clock, the structure tree's node names and a content stream — rather than
 * whole files: a committed PDF as a fixture would be megabytes, and the
 * function reads the bytes as text either way.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { sameRender } from './same-render.ts';

const pdf = (...lines: string[]): Buffer =>
  Buffer.from(lines.join('\n'), 'latin1');

const DATED = (stamp: string): string =>
  `/CreationDate (D:${stamp}+00'00')\n/ModDate (D:${stamp}+00'00')`;

const CONTENT = 'BT /F1 12 Tf 72 720 Td (Playgram) Tj ET';

/** A structure tree where one cell cites the other's node as its header. */
const TREE = (first: number, second: number): string =>
  [
    `/ID (node${String(first).padStart(8, '0')})`,
    `/Headers [(node${String(first).padStart(8, '0')})]`,
    `/ID (node${String(second).padStart(8, '0')})`,
  ].join('\n');

describe('sameRender', () => {
  it('forgives a moved clock', () => {
    assert.equal(
      sameRender(
        pdf(DATED('20260915122933'), CONTENT),
        pdf(DATED('20260916093527'), CONTENT),
      ),
      true,
    );
  });

  it('forgives structure nodes counted from a different base', () => {
    assert.equal(
      sameRender(
        pdf(DATED('20260915122933'), TREE(140, 141), CONTENT),
        pdf(DATED('20260915122933'), TREE(318, 319), CONTENT),
      ),
      true,
    );
  });

  it('keeps the aliases those names carry', () => {
    const cited = pdf(
      '/ID (node00000140)',
      '/Headers [(node00000140)]',
      CONTENT,
    );
    const citingAnother = pdf(
      '/ID (node00000140)',
      '/Headers [(node00000141)]',
      CONTENT,
    );

    assert.equal(sameRender(cited, citingAnother), false);
  });

  it('reports a page whose content moved', () => {
    assert.equal(
      sameRender(
        pdf(DATED('20260915122933'), TREE(140, 141), CONTENT),
        pdf(
          DATED('20260915122933'),
          TREE(140, 141),
          CONTENT.replace('720', '700'),
        ),
      ),
      false,
    );
  });

  it('reports a page whose links moved, dates and nodes aside', () => {
    assert.equal(
      sameRender(
        pdf(DATED('20260915122933'), TREE(140, 141), '/URI (http://localhost)'),
        pdf(
          DATED('20260916093527'),
          TREE(318, 319),
          '/URI (https://vovazakharov.com)',
        ),
      ),
      false,
    );
  });
});
