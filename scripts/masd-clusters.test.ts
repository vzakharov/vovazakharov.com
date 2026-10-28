/**
 * End-to-end tests for `pnpm masd:clusters`, after `masd-check.test.ts`: each
 * case writes a throwaway tree to the OS temp directory and runs the real script
 * there, which reads everything from its working directory.
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

const SCRIPT = path.resolve(import.meta.dirname, 'masd-clusters.ts');
const TSX = path.resolve(import.meta.dirname, '../node_modules/.bin/tsx');

/** Fixture files, keyed by path relative to the tree's root. */
type Tree = Record<string, string>;

const SLICE = 'src/app/features/feed';

/** A file of the slice importing each of `imports`, relative to the slice. */
const importing = (...imports: string[]): string =>
  [
    ...imports.map((file, index) => `import * as m${index} from './${file}';`),
    `export const used = [${imports.map((_, index) => `m${index}`).join(', ')}];`,
  ].join('\n');

function run(tree: Tree): { status: number; stdout: string } {
  const dir = mkdtempSync(path.join(tmpdir(), 'masd-clusters-'));
  const files = {
    'sites/site/app/page.tsx': "export * from '@/app/features/feed';",
    ...tree,
  };
  for (const [file, text] of Object.entries(files)) {
    const full = path.join(dir, file);
    mkdirSync(path.dirname(full), { recursive: true });
    writeFileSync(full, text);
  }
  const { error, status, stdout } = spawnSync(TSX, [SCRIPT], {
    cwd: dir,
    encoding: 'utf8',
  });
  assert.equal(error, undefined);
  return { status: status ?? -1, stdout };
}

// The slice's door reaches two closures: `top` with the files under it, and
// `other` with its helper.
const FEED: Tree = {
  [`${SLICE}/index.ts`]: importing('ui/top', 'ui/other'),
  [`${SLICE}/ui/top.ts`]: importing('x', '../model/y'),
  [`${SLICE}/ui/x.ts`]: importing('../model/y'),
  [`${SLICE}/model/y.ts`]: 'export const y = 1;',
  [`${SLICE}/model/w.ts`]: 'export const w = 1;',
  [`${SLICE}/ui/other.ts`]: importing('../lib/z'),
  [`${SLICE}/lib/z.ts`]: 'export const z = 1;',
};

describe('masd:clusters', () => {
  it('prints the best closure and each next one it does not overlap', () => {
    const { status, stdout } = run(FEED);
    assert.equal(status, 0);
    assert.equal(
      stdout,
      [
        `${SLICE} (7 files)`,
        '  ui/top.ts: 3 files, ΔQ 0.32',
        '    model/y.ts',
        '    ui/top.ts',
        '    ui/x.ts',
        '  ui/other.ts: 2 files, ΔQ 0.21',
        '    lib/z.ts',
        '    ui/other.ts',
        '1 of 1 slices hold a cluster.',
        '',
      ].join('\n'),
    );
  });

  it('drops a closure made of whole segments', () => {
    const { stdout } = run({
      [`${SLICE}/index.ts`]: importing('ui/top', 'ui/other', 'lib/z'),
      [`${SLICE}/ui/top.ts`]: importing('x'),
      [`${SLICE}/ui/x.ts`]: 'export const x = 1;',
      [`${SLICE}/ui/other.ts`]: 'export const other = 1;',
      [`${SLICE}/lib/z.ts`]: importing('q'),
      [`${SLICE}/lib/q.ts`]: 'export const q = 1;',
    });
    assert.match(stdout, /^ {2}ui\/top\.ts:/m);
    assert.doesNotMatch(stdout, /lib\/z\.ts:/);
  });

  it('reads no test code as part of a slice', () => {
    const { stdout } = run({
      ...FEED,
      [`${SLICE}/index.test-only.ts`]: importing('ui/x'),
      [`${SLICE}/ui/x.test.ts`]: importing('x', 'top'),
    });
    assert.equal(stdout, run(FEED).stdout);
  });

  it('reports a slice with no cluster as none', () => {
    const { status, stdout } = run({
      [`${SLICE}/index.ts`]: importing('ui/a', 'ui/b'),
      [`${SLICE}/ui/a.ts`]: 'export const a = 1;',
      [`${SLICE}/ui/b.ts`]: 'export const b = 1;',
    });
    assert.equal(status, 0);
    assert.equal(stdout, '0 of 1 slices hold a cluster.\n');
  });
});
