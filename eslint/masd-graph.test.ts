/**
 * The graph's checks on invented graphs, since the real one has neither several
 * parents nor a diamond.
 */

import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

import {
  ancestors,
  descendants,
  directoryMismatches,
  insignificantApps,
  loadGraph,
  parseGraph,
  PLACE_FILE,
  placeOf,
  segmentOrder,
  STANDARD_SEGMENTS,
} from './masd-graph.ts';

/** A place with these segment directories, and `segments` as its file's. */
function place(segments: readonly string[], declared?: readonly string[]) {
  const dir = mkdtempSync(path.join(tmpdir(), 'masd-place-'));
  for (const segment of segments) mkdirSync(path.join(dir, segment));
  if (declared !== undefined) {
    writeFileSync(
      path.join(dir, PLACE_FILE),
      JSON.stringify({ segments: declared }),
    );
  }
  return dir;
}

// base ← left, right ← both: a diamond, `both` having two parents.
const DIAMOND = parseGraph({
  base: [],
  left: ['base'],
  right: ['base'],
  both: ['left', 'right'],
});

describe('parseGraph', () => {
  it('accepts the real graph', () => {
    assert.ok(loadGraph().has('kernel'));
  });

  it('refuses a parent declared below its child', () => {
    assert.throws(
      () => parseGraph({ child: ['parent'], parent: [] }),
      /child is declared above its parent/,
    );
  });

  it('refuses a cycle, which needs a parent declared late', () => {
    assert.throws(() => parseGraph({ a: ['b'], b: ['a'] }), /declared above/);
  });

  it('refuses an app naming itself', () => {
    assert.throws(() => parseGraph({ a: ['a'] }), /declared above/);
  });

  it('refuses a parent that is no app', () => {
    assert.throws(() => parseGraph({ a: ['ghost'] }), /ghost, which is no app/);
  });

  it('refuses a parent named twice', () => {
    assert.throws(
      () => parseGraph({ a: [], b: ['a', 'a'] }),
      /names a parent twice/,
    );
  });

  it('refuses an app name that is not kebab-case', () => {
    assert.throws(() => parseGraph({ Kernel: [] }));
    assert.throws(() => parseGraph({ '1': [] }));
  });
});

describe('ancestors and descendants', () => {
  it('follow every parent, through a diamond once', () => {
    assert.deepEqual([...ancestors(DIAMOND, 'both')].toSorted(), [
      'base',
      'left',
      'right',
    ]);
    assert.deepEqual([...ancestors(DIAMOND, 'base')], []);
  });

  it('are each other’s inverse', () => {
    assert.deepEqual([...descendants(DIAMOND, 'base')].toSorted(), [
      'both',
      'left',
      'right',
    ]);
    assert.deepEqual([...descendants(DIAMOND, 'left')], ['both']);
  });
});

describe('insignificantApps', () => {
  it('flags an app with one child and nothing mounted', () => {
    assert.deepEqual(insignificantApps(DIAMOND, new Set()), ['left', 'right']);
  });

  it('spares one a router mounts', () => {
    assert.deepEqual(insignificantApps(DIAMOND, new Set(['left'])), ['right']);
  });

  it('spares the real graph’s abstract apps', () => {
    assert.deepEqual(
      insignificantApps(
        loadGraph(),
        new Set([
          'shell',
          'vova',
          'music',
          'mushrooms',
          'bible',
          'basilisk',
          'maya',
        ]),
      ),
      [],
    );
  });
});

describe('placeOf', () => {
  for (const [file, placed] of [
    [
      'blog/pages/documents/ui/page.tsx',
      { place: 'blog/pages/documents', segment: 'ui' },
    ],
    [
      'blog/pages/documents/ui/deep/x.ts',
      { place: 'blog/pages/documents', segment: 'ui' },
    ],
    ['blog/pages/documents/index.ts', { place: 'blog/pages/documents' }],
    ['kernel/shared/seo/index.ts', { place: 'kernel/shared', segment: 'seo' }],
    [
      'kernel/shared/lib/class-names.ts',
      { place: 'kernel/shared', segment: 'lib' },
    ],
    ['music/scripts/lib/cards.ts', { place: 'music/scripts', segment: 'lib' }],
    ['music/scripts/masters.ts', { place: 'music/scripts' }],
  ] as const) {
    it(`places ${file}`, () => {
      assert.deepEqual(placeOf(file.split('/').join(path.sep)), {
        ...placed,
        place: placed.place.split('/').join(path.sep),
      });
    });
  }

  it('places nothing above a layer', () => {
    assert.equal(placeOf('masd.json'), undefined);
    assert.equal(placeOf(path.join('kernel', 'shared')), undefined);
  });
});

describe('segmentOrder', () => {
  it('is the standard order for a place with no file', () => {
    assert.deepEqual(segmentOrder(place(['ui', 'lib'])), STANDARD_SEGMENTS);
  });

  it('is the file’s order where the place declares one', () => {
    assert.deepEqual(
      segmentOrder(place(['ui', 'seo', 'lib'], ['ui', 'seo', 'lib'])),
      ['ui', 'seo', 'lib'],
    );
  });

  for (const [name, segments, declared, problem] of [
    [
      'a segment outside the standard order',
      ['ui', 'seo'],
      undefined,
      /seo is outside/,
    ],
    [
      'a segment outside the declared order',
      ['ui', 'seo', 'i18n'],
      ['ui', 'seo'],
      /i18n is outside/,
    ],
    ['a segment named twice', ['ui', 'seo'], ['ui', 'seo', 'seo'], /twice/],
    [
      'standard segments reordered',
      ['lib', 'seo', 'ui'],
      ['lib', 'seo', 'ui'],
      /reorders/,
    ],
    [
      'a segment the place lacks',
      ['seo'],
      ['seo', 'cache'],
      /names cache, which is no segment/,
    ],
    ['only standard segments', ['ui', 'lib'], ['ui', 'lib'], /only standard/],
    ['a file not of the declared shape', ['seo'], [], /too_small|>=1/],
  ] as const) {
    it(`refuses ${name}`, () => {
      assert.throws(() => segmentOrder(place(segments, declared)), problem);
    });
  }
});

describe('directoryMismatches', () => {
  it('names an app without a directory and a directory without an app', () => {
    assert.deepEqual(
      directoryMismatches(DIAMOND, ['base', 'left', 'right', 'x']),
      [
        'masd: both is in the graph but has no directory',
        'masd: src/x is not in the graph',
      ],
    );
  });
});
