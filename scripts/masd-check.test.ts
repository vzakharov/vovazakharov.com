/**
 * End-to-end tests for `pnpm check:masd`, after `type-overlap-check.test.ts`:
 * each case writes a throwaway tree to the OS temp directory and runs the real
 * script there, which reads everything from its working directory.
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

const SCRIPT = path.resolve(import.meta.dirname, 'masd-check.ts');

/** Fixture files, keyed by path relative to the tree's root. */
type Tree = Record<string, string>;

// kernel ← blog ← site, kernel ← game: `blog` has one child, so the site's
// router mounts it to earn it.
const GRAPH = JSON.stringify({
  kernel: [],
  blog: ['kernel'],
  site: ['blog'],
  game: ['kernel'],
});

const BASE: Tree = {
  'src/masd.json': GRAPH,
  'src/kernel/shared/ui/index.ts': 'export const ui = 1;',
  'src/blog/pages/documents/index.ts': 'export const documents = 1;',
  'src/site/pages/home/index.ts': 'export const home = 1;',
  'src/game/pages/play/index.ts': 'export const play = 1;',
  'sites/site/app/page.tsx': [
    "export * from '@/site/pages/home';",
    "export * from '@/blog/pages/documents';",
    "export * from '@/game/pages/play';",
  ].join('\n'),
};

function run(tree: Tree): { status: number; stderr: string } {
  const dir = mkdtempSync(path.join(tmpdir(), 'masd-check-'));
  for (const [file, text] of Object.entries({ ...BASE, ...tree })) {
    const full = path.join(dir, file);
    mkdirSync(path.dirname(full), { recursive: true });
    writeFileSync(full, text);
  }
  const { error, status, stderr } = spawnSync(process.execPath, [SCRIPT], {
    cwd: dir,
    encoding: 'utf8',
  });
  assert.equal(error, undefined);
  return { status: status ?? -1, stderr };
}

const ENTITY = 'src/blog/entities/card/index.ts';
const UNREFERENCED =
  'src/blog/entities/card: This slice has no references. Consider removing it.\n';
const MERGE_INTO_HOME =
  'src/blog/entities/card: This slice has only one reference in slice "pages/home". Consider merging them.\n';

describe('masd-check', () => {
  it('passes a clean tree', () => {
    assert.deepEqual(run({}), { status: 0, stderr: '' });
  });

  it('counts a slice used by two descendants as significant', () => {
    assert.deepEqual(
      run({
        [ENTITY]: 'export const card = 1;',
        'src/site/pages/home/ui.ts':
          "import { card } from '@/blog/entities/card';",
        'src/blog/pages/documents/ui.ts':
          "import { card } from '@/blog/entities/card';",
      }).status,
      0,
    );
  });

  it('flags a slice used from one slice, though that slice is in a descendant', () => {
    const { status, stderr } = run({
      [ENTITY]: 'export const card = 1;',
      'src/site/pages/home/ui.ts':
        "import { card } from '@/blog/entities/card';",
    });
    assert.equal(status, 1);
    assert.equal(stderr, MERGE_INTO_HOME);
  });

  describe('a slice with one reference, by modularity over its own app', () => {
    const CONSUMER: Tree = {
      'src/site/pages/home/ui.ts': "import { a } from '@/blog/entities/card';",
    };
    // Three edges inside the card: the barrel to each file, and `a` to `b`.
    const COHESIVE: Tree = {
      ...CONSUMER,
      [ENTITY]: "export * from './a';\nexport * from './b';",
      'src/blog/entities/card/a.ts':
        "import { b } from './b';\nexport const a = b;",
      'src/blog/entities/card/b.ts': 'export const b = 1;',
    };
    // Two edges elsewhere in blog, so the card is not the whole graph.
    const REST_OF_BLOG: Tree = {
      'src/blog/pages/documents/index.ts': "export * from './ui';",
      'src/blog/pages/documents/ui.ts': "import { x } from '@/blog/shared/x';",
      'src/blog/shared/x/index.ts': 'export const x = 1;',
    };
    const shared = (names: string[]): Tree =>
      Object.fromEntries(
        names.map((name) => [
          `src/blog/shared/${name}/index.ts`,
          `export const ${name} = 1;`,
        ]),
      );

    it('passes a slice holding more of its edges than chance', () => {
      assert.deepEqual(run({ ...COHESIVE, ...REST_OF_BLOG }), {
        status: 0,
        stderr: '',
      });
    });

    it('flags one whose files mostly import outside it', () => {
      assert.equal(
        run({
          ...CONSUMER,
          ...REST_OF_BLOG,
          ...shared(['p', 'q', 'r', 's', 't']),
          [ENTITY]: "export * from './a';\nexport * from './b';",
          'src/blog/entities/card/a.ts': [
            "import { p } from '@/blog/shared/p';",
            "import { q } from '@/blog/shared/q';",
            "import { r } from '@/blog/shared/r';",
            'export const a = p + q + r;',
          ].join('\n'),
          'src/blog/entities/card/b.ts': [
            "import { s } from '@/blog/shared/s';",
            "import { t } from '@/blog/shared/t';",
            'export const b = s + t;',
          ].join('\n'),
        }).stderr,
        MERGE_INTO_HOME,
      );
    });

    it('flags a one-file slice, which has no edge inside it', () => {
      assert.equal(
        run({
          ...CONSUMER,
          ...REST_OF_BLOG,
          [ENTITY]: "import { x } from '@/blog/shared/x';\nexport const a = x;",
        }).stderr,
        MERGE_INTO_HOME,
      );
    });

    it('counts no descendant edge, however many', () => {
      // The card is the whole of blog, so it holds exactly its share by chance;
      // the site's edges would lower that share if they counted.
      const site = Object.fromEntries(
        ['a', 'b', 'c', 'd'].map((name) => [
          `src/site/pages/home/${name}.ts`,
          "import './ui';\nexport const y = 1;",
        ]),
      );
      assert.equal(run({ ...COHESIVE, ...site }).stderr, MERGE_INTO_HOME);
    });

    it('still flags it with no references', () => {
      assert.equal(
        run({
          ...COHESIVE,
          ...REST_OF_BLOG,
          'src/site/pages/home/ui.ts': '',
        }).stderr,
        UNREFERENCED,
      );
    });
  });

  it('flags a slice nothing uses', () => {
    assert.equal(
      run({ [ENTITY]: 'export const card = 1;' }).stderr,
      UNREFERENCED,
    );
  });

  it('does not count an app script as a reference', () => {
    assert.equal(
      run({
        [ENTITY]: 'export const card = 1;',
        'src/blog/scripts/render.ts':
          "import { card } from '@/blog/entities/card';",
      }).stderr,
      UNREFERENCED,
    );
  });

  it('does not count a test as a reference', () => {
    assert.equal(
      run({
        [ENTITY]: 'export const card = 1;',
        'src/blog/pages/documents/ui.test.ts':
          "import { card } from '@/blog/entities/card';",
      }).stderr,
      UNREFERENCED,
    );
  });

  it('does not count a test kit as a reference', () => {
    assert.equal(
      run({
        [ENTITY]: 'export const card = 1;',
        'src/blog/pages/documents/ui.test-kit.ts':
          "import { card } from '@/blog/entities/card';",
      }).stderr,
      UNREFERENCED,
    );
  });

  it('flags a slice only one shared layer uses, and spares one the app layer uses', () => {
    assert.equal(
      run({
        [ENTITY]: 'export const card = 1;',
        'src/blog/shared/x/index.ts': "export * from '../../entities/card';",
      }).stderr,
      'src/blog/entities/card: This slice has only one reference on layer "shared". Consider moving this code to "shared".\n',
    );
    assert.equal(
      run({
        [ENTITY]: 'export const card = 1;',
        'src/blog/app/ui/index.ts': "export * from '@/blog/entities/card';",
      }).status,
      0,
    );
  });

  it('flags an app with one child that no router mounts', () => {
    const { status, stderr } = run({
      'sites/site/app/page.tsx':
        "export * from '@/site/pages/home';\nexport * from '@/game/pages/play';",
    });
    assert.equal(status, 1);
    assert.equal(
      stderr,
      'masd: blog has one child and nothing a router mounts; fold it into its child\n',
    );
  });

  it('names a directory the graph lacks', () => {
    assert.equal(
      run({ 'src/stray/pages/x/index.ts': 'export {};' }).stderr,
      'masd: src/stray is not in the graph\n',
    );
  });

  it('reports a graph that does not parse', () => {
    const { status, stderr } = run({
      'src/masd.json': JSON.stringify({ blog: ['kernel'], kernel: [] }),
    });
    assert.equal(status, 1);
    assert.match(stderr, /blog is declared above its parent kernel/);
  });
});
