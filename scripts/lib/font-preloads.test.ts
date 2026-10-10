import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Locale } from '@/shared/i18n/locales';

import { fontPreloadFindings, type PageFonts } from './font-preloads.ts';

const LATIN = ['latin-400.woff2', 'latin-700.woff2'];
const CYRILLIC = ['cyrillic-400.woff2', 'cyrillic-700.woff2'];

const page = (
  route: string,
  locale: Locale,
  preloaded: string[],
  used?: string[],
): PageFonts => ({
  route,
  locale,
  preloaded: new Set([...LATIN, ...preloaded]),
  used: used && new Set([...LATIN, ...used]),
});

describe('fontPreloadFindings', () => {
  it('passes preloads that match what every page in the language uses', () => {
    assert.deepEqual(
      fontPreloadFindings([
        page('/cv/cto', 'en', []),
        page('/cv/cto/ru', 'ru', CYRILLIC, CYRILLIC),
        page('/music/minem-babay/ru', 'ru', CYRILLIC, [
          ...CYRILLIC,
          'cyrillic-ext-400.woff2',
        ]),
      ]),
      [],
    );
  });

  it('takes the layout preloads from pages that carry any', () => {
    assert.deepEqual(
      fontPreloadFindings([
        { route: '/404', locale: 'en', preloaded: new Set() },
        page('/cv/cto', 'en', []),
        page('/cv/cto/ru', 'ru', CYRILLIC, CYRILLIC),
      ]),
      [],
    );
  });

  it('reports a file every page uses and one page does not preload', () => {
    assert.deepEqual(
      fontPreloadFindings([
        page('/cv/cto', 'en', []),
        page('/cv/cto/ru', 'ru', CYRILLIC, CYRILLIC),
        page('/music/ru', 'ru', [], CYRILLIC),
      ]),
      CYRILLIC.map((file) => ({
        problem: `does not preload ${file}, which every ru page uses`,
        routes: ['/music/ru'],
      })),
    );
  });

  it('reports a preloaded file a page never uses', () => {
    assert.deepEqual(
      fontPreloadFindings([
        page('/cv/cto', 'en', []),
        page('/cv/cto/ru', 'ru', CYRILLIC, ['cyrillic-400.woff2']),
      ]),
      [
        {
          problem: 'preloads cyrillic-700.woff2, which the page never uses',
          routes: ['/cv/cto/ru'],
        },
      ],
    );
  });

  it('reports a default-locale page preloading another language', () => {
    assert.deepEqual(
      fontPreloadFindings([
        page('/', 'en', []),
        page('/cv/cto', 'en', ['cyrillic-400.woff2']),
      ]),
      [
        {
          problem: 'preloads cyrillic-400.woff2 on a en page',
          routes: ['/cv/cto'],
        },
      ],
    );
  });
});
