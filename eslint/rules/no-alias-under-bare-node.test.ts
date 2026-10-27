import * as parser from '@typescript-eslint/parser';
import { Linter } from 'eslint';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';

import rule from './no-alias-under-bare-node';

// A throwaway repository: `package.json` names one bare-Node entry, which
// loads a library and reaches a second one by `import type` alone, so Node
// never loads the second; another entry runs under tsx.
const root = mkdtempSync(path.join(tmpdir(), 'no-alias-under-bare-node-'));
after(() => {
  rmSync(root, { recursive: true, force: true });
});

function put(file: string, text: string): void {
  mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  writeFileSync(path.join(root, file), text);
}

const ENTRY = 'src/kernel/scripts/check.ts';
const LOADED = 'src/kernel/scripts/lib/walk.ts';
const TYPED = 'src/kernel/scripts/lib/shapes.ts';
const TSX = 'src/kernel/scripts/render.ts';

put(
  'package.json',
  JSON.stringify({
    scripts: { check: `node ${ENTRY}`, render: `tsx ${TSX}` },
  }),
);
put(
  ENTRY,
  "import { walk } from './lib/walk.ts';\nimport type { Shape } from './lib/shapes.ts';",
);
put(LOADED, '');
put(TYPED, '');
put(TSX, '');

const linter = new Linter({ configType: 'flat', cwd: root });

function reports(file: string, code: string): string[] {
  return linter
    .verify(
      code,
      [
        {
          files: ['**/*.{ts,tsx}'],
          languageOptions: { parser },
          plugins: {
            vova: { rules: { 'no-alias-under-bare-node': rule } },
          },
          rules: { 'vova/no-alias-under-bare-node': 'error' },
        },
      ],
      path.join(root, file),
    )
    .map(({ message, ruleId }) => {
      assert.equal(ruleId, 'vova/no-alias-under-bare-node', message);
      return message;
    });
}

describe('no-alias-under-bare-node', () => {
  for (const [name, file, code] of [
    [
      'a type-only import by alias',
      LOADED,
      "import type { Locale } from '@/kernel/shared/i18n';",
    ],
    [
      'a type-only re-export by alias',
      LOADED,
      "export type { Locale } from '@/kernel/shared/i18n';",
    ],
    [
      'a relative import with its extension',
      LOADED,
      "import { x } from '../../shared/content/paths.ts';",
    ],
    [
      'a file the entry reaches by type alone',
      TYPED,
      "import { x } from '@/kernel/shared/i18n';",
    ],
    ['a file tsx runs', TSX, "import { x } from '@/kernel/shared/i18n';"],
  ] as const) {
    it(`allows ${name}`, () => {
      assert.deepEqual(reports(file, code), []);
    });
  }

  for (const [name, file, code] of [
    ['a value import', ENTRY, "import { x } from '@/kernel/shared/i18n';"],
    [
      'an inline type import, which Node keeps as `import {}`',
      LOADED,
      "import { type Locale } from '@/kernel/shared/i18n';",
    ],
    ['a re-export', LOADED, "export { x } from '@/kernel/shared/i18n';"],
    ['a dynamic import', LOADED, "await import('@/kernel/shared/i18n');"],
  ] as const) {
    it(`flags ${name}`, () => {
      const [message] = reports(file, code);
      assert.match(message ?? '', /`@\/kernel\/shared\/i18n`.*`tsx`/);
    });
  }
});
