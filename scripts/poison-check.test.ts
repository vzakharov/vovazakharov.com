/**
 * End-to-end tests for `pnpm check:poison`, after `masd-check.test.ts`: each
 * case writes a throwaway tree to the OS temp directory and runs the real
 * script there, which reads everything from its working directory.
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

const SCRIPT = path.resolve(import.meta.dirname, 'poison-check.ts');
const TSX = path.resolve(import.meta.dirname, '../node_modules/.bin/tsx');

/** Fixture files, keyed by path relative to the tree's root. */
type Tree = Record<string, string>;

const SERVER_ONLY = "import 'server-only';\nexport const secret = 1;";

const BASE: Tree = {
  'package.json': JSON.stringify({
    scripts: {
      og: "scripts/site-task.sh 'tsx --conditions=react-server src/{site}/scripts/render.ts'",
    },
  }),
  'scripts/.keep': '',
  'sites/site/app/page.tsx': "export * from '@/app/pages/home';",
  'src/app/pages/home/index.ts': "export * from './ui';",
  'src/app/pages/home/ui.tsx': "'use client';\nexport const Home = 1;",
  'src/app/shared/config/index.ts': 'export const config = 1;',
  'src/app/shared/config/index.server-only.ts': "export * from './year';",
  'src/app/shared/config/year.ts': SERVER_ONLY,
};

function run(tree: Tree): { status: number; stderr: string } {
  const dir = mkdtempSync(path.join(tmpdir(), 'poison-check-'));
  for (const [file, text] of Object.entries({ ...BASE, ...tree })) {
    const full = path.join(dir, file);
    mkdirSync(path.dirname(full), { recursive: true });
    writeFileSync(full, text);
  }
  const { error, status, stderr } = spawnSync(TSX, [SCRIPT], {
    cwd: dir,
    encoding: 'utf8',
  });
  assert.equal(error, undefined);
  return { status: status ?? -1, stderr };
}

const CLIENT = 'src/app/pages/home/ui.tsx';

describe('poison-check', () => {
  it('passes a clean tree', () => {
    assert.deepEqual(run({}), { status: 0, stderr: '' });
  });

  describe('client roots', () => {
    it('flags a server-only module reached through a barrel, by its shortest chain', () => {
      const { status, stderr } = run({
        [CLIENT]: [
          "'use client';",
          "import { year } from '@/app/shared/config/index.server-only';",
          "import { far } from './far';",
          'export const Home = year + far;',
        ].join('\n'),
        'src/app/pages/home/far.ts':
          "export * from '@/app/shared/config/index.server-only';",
      });
      assert.equal(status, 1);
      assert.equal(
        stderr,
        `poison: client root ${CLIENT} → src/app/shared/config/index.server-only.ts → src/app/shared/config/year.ts\n`,
      );
    });

    it('flags a no-browser barrel, though nothing behind it imports server-only', () => {
      assert.equal(
        run({
          [CLIENT]:
            "'use client';\nexport * from '@/app/shared/fs/index.no-browser';",
          'src/app/shared/fs/index.no-browser.ts': 'export const read = 1;',
        }).stderr,
        `poison: client root ${CLIENT} → src/app/shared/fs/index.no-browser.ts\n`,
      );
    });

    it('follows a dynamic import and an export-from', () => {
      assert.equal(
        run({
          [CLIENT]:
            "'use client';\nexport const load = () => import('./lazy');",
          'src/app/pages/home/lazy.ts': "export * from './deep';",
          'src/app/pages/home/deep.ts': SERVER_ONLY,
        }).status,
        1,
      );
    });

    it('drops type-only imports and re-exports', () => {
      assert.equal(
        run({
          [CLIENT]: [
            "'use client';",
            "import type { secret } from '@/app/shared/config/year';",
            "export type { secret as Secret } from '@/app/shared/config/year';",
            'export const Home: typeof secret = 1;',
          ].join('\n'),
        }).status,
        0,
      );
    });

    it('reads the directive only from the prologue', () => {
      assert.equal(
        run({
          'src/app/pages/home/server.ts': [
            "import { year } from '@/app/shared/config/index.server-only';",
            "'use client';",
            'export const y = year;',
          ].join('\n'),
        }).status,
        0,
      );
    });

    it('groups roots by the import to fix', () => {
      assert.equal(
        run({
          [CLIENT]: "'use client';\nexport * from '../../shared/leak';",
          'src/app/pages/home/other.tsx':
            "'use client';\nexport * from '../../shared/leak';",
          'src/app/shared/leak.ts':
            "export * from '@/app/shared/config/index.server-only';",
        }).stderr,
        `poison: client root src/app/pages/home/other.tsx → src/app/shared/leak.ts → src/app/shared/config/index.server-only.ts → src/app/shared/config/year.ts (+1 more client roots)\n`,
      );
    });
  });

  describe('script roots', () => {
    const LIB = {
      'src/app/scripts/lib/read.ts':
        "export * from '@/app/shared/config/index.server-only';",
    };

    it('flags an entry reaching server-only through its library', () => {
      assert.equal(
        run({ ...LIB, 'src/app/scripts/run.ts': "import './lib/read';" })
          .stderr,
        'poison: script root src/app/scripts/run.ts → src/app/scripts/lib/read.ts → src/app/shared/config/index.server-only.ts → src/app/shared/config/year.ts\n',
      );
    });

    it('exempts an entry package.json runs under react-server', () => {
      assert.deepEqual(
        run({ ...LIB, 'src/app/scripts/render.ts': "import './lib/read';" }),
        { status: 0, stderr: '' },
      );
    });

    it('still flags a test of that entry, which runs without the condition', () => {
      assert.match(
        run({
          ...LIB,
          'src/app/scripts/render.ts': "import './lib/read';",
          'src/app/scripts/render.test.ts': "import './render';",
        }).stderr,
        /^poison: script root src\/app\/scripts\/render\.test\.ts → /,
      );
    });

    it('takes root scripts/ too, and spares a no-browser barrel', () => {
      assert.equal(
        run({
          'scripts/tool.ts': "import '../src/app/shared/fs/index.no-browser';",
          'src/app/shared/fs/index.no-browser.ts': 'export const read = 1;',
        }).status,
        0,
      );
      assert.equal(
        run({ 'scripts/tool.ts': "import '../src/app/shared/config/year';" })
          .status,
        1,
      );
    });
  });
});
