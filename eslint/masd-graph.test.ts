/**
 * The graph's checks on invented graphs, since the real one has neither several
 * parents nor a diamond.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ancestors,
  descendants,
  directoryMismatches,
  insignificantApps,
  loadGraph,
  parseGraph,
} from './masd-graph.ts';

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
