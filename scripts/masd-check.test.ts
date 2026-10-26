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
    assert.equal(
      stderr,
      'src/blog/entities/card: This slice has only one reference in slice "pages/home". Consider merging them.\n',
    );
  });

  describe('a slice with one reference and a narrow public API', () => {
    const CONSUMER = {
      'src/site/pages/home/ui.ts': "import { a } from '@/blog/entities/card';",
    };
    // Six names defined, the barrel handing on `count` of them.
    const card = (barrel: string): Tree => ({
      ...CONSUMER,
      [ENTITY]: barrel,
      'src/blog/entities/card/a.ts':
        'export const a = 1;\nexport function b() {}\nexport type C = 1;',
      'src/blog/entities/card/d.ts':
        'export class D {}\nexport const e = 1, f = 2;',
    });

    it('passes when the barrel hands on a third', () => {
      assert.deepEqual(run(card("export { a, D } from './a';")), {
        status: 0,
        stderr: '',
      });
    });

    it('is flagged when it hands on more', () => {
      assert.equal(
        run(card("export { a, b, D } from './a';")).stderr,
        'src/blog/entities/card: This slice has only one reference in slice "pages/home". Consider merging them.\n',
      );
    });

    it('counts every name of a file a barrel re-exports whole', () => {
      assert.equal(run(card("export * from './d';")).status, 1);
    });

    it('is still flagged with no references', () => {
      assert.equal(
        run({
          ...card("export { a } from './a';"),
          'src/site/pages/home/ui.ts': '',
        }).stderr,
        'src/blog/entities/card: This slice has no references. Consider removing it.\n',
      );
    });
  });

  it('flags a slice nothing uses', () => {
    assert.equal(
      run({ [ENTITY]: 'export const card = 1;' }).stderr,
      'src/blog/entities/card: This slice has no references. Consider removing it.\n',
    );
  });

  it('does not count an app script as a reference', () => {
    assert.equal(
      run({
        [ENTITY]: 'export const card = 1;',
        'src/blog/scripts/render.ts':
          "import { card } from '@/blog/entities/card';",
      }).stderr,
      'src/blog/entities/card: This slice has no references. Consider removing it.\n',
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
