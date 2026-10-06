import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  mentionsPrintRasterDomain,
  splitOnPrintRasterDomains,
} from './print-raster.ts';

describe('mentionsPrintRasterDomain', () => {
  it('finds a bare domain', () => {
    assert.equal(mentionsPrintRasterDomain('paindirection.pages.dev'), true);
  });

  it('finds the domain inside a URL', () => {
    assert.equal(
      mentionsPrintRasterDomain('https://paindirection.pages.dev/'),
      true,
    );
  });

  // The Wayback Machine's address embeds the original, so an archive link
  // names the domain as surely as the link it preserves.
  it('finds the domain inside an archive URL', () => {
    assert.equal(
      mentionsPrintRasterDomain(
        'http://web.archive.org/web/20261001063602/https://paindirection.pages.dev/',
      ),
      true,
    );
  });

  it('ignores case', () => {
    assert.equal(mentionsPrintRasterDomain('PainDirection.Pages.Dev'), true);
  });

  it('answers the same on a second call', () => {
    const text = 'see paindirection.pages.dev';

    assert.equal(mentionsPrintRasterDomain(text), true);
    assert.equal(mentionsPrintRasterDomain(text), true);
  });

  it('passes a lookalike whose dots are other characters', () => {
    assert.equal(mentionsPrintRasterDomain('paindirection-pages-dev'), false);
  });

  it('passes a different pages.dev site', () => {
    assert.equal(mentionsPrintRasterDomain('example.pages.dev'), false);
  });
});

describe('splitOnPrintRasterDomains', () => {
  it('returns text with no mention as one plain run', () => {
    assert.deepEqual(splitOnPrintRasterDomains('nothing here'), [
      { text: 'nothing here', raster: false },
    ]);
  });

  it('cuts each mention into a run of its own', () => {
    assert.deepEqual(
      splitOnPrintRasterDomains(
        'at paindirection.pages.dev, and PAINDIRECTION.PAGES.DEV again',
      ),
      [
        { text: 'at ', raster: false },
        { text: 'paindirection.pages.dev', raster: true },
        { text: ', and ', raster: false },
        { text: 'PAINDIRECTION.PAGES.DEV', raster: true },
        { text: ' again', raster: false },
      ],
    );
  });

  it('leaves no empty run at either edge', () => {
    assert.deepEqual(splitOnPrintRasterDomains('paindirection.pages.dev'), [
      { text: 'paindirection.pages.dev', raster: true },
    ]);
  });
});
