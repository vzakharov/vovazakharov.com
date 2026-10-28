import * as parser from '@typescript-eslint/parser';
import { Linter } from 'eslint';
import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

import rule from './no-relative-escape';

const root = path.join(tmpdir(), 'no-relative-escape');

const linter = new Linter({ configType: 'flat', cwd: root });

function reports(file: string, code: string): string[] {
  return linter
    .verify(
      code,
      [
        {
          files: ['**/*.{ts,tsx}'],
          languageOptions: { parser },
          plugins: { vova: { rules: { 'no-relative-escape': rule } } },
          rules: { 'vova/no-relative-escape': 'error' },
        },
      ],
      path.join(root, file),
    )
    .map(({ message, ruleId }) => {
      assert.equal(ruleId, 'vova/no-relative-escape', message);
      return message;
    });
}

describe('no-relative-escape', () => {
  for (const [name, file, code] of [
    [
      'a sibling segment of the same slice',
      'src/blog/pages/documents/ui/page.tsx',
      "import { x } from '../lib/x';",
    ],
    [
      'a nested file reaching its slice root',
      'src/mushrooms/pages/mushrooms/ui/scene/sky.ts',
      "import { x } from '../../model/x';",
    ],
    [
      'another segment of a segmented layer',
      'src/shell/app/ui/root-layout.tsx',
      "import '../styles/globals.scss';",
    ],
    [
      'a script inside its app scripts',
      'src/music/scripts/lib/cards.ts',
      "import { x } from '../masters';",
    ],
    [
      'a file outside src',
      'scripts/check.ts',
      "import '../src/kernel/shared/content/paths.ts';",
    ],
  ] as const) {
    it(`allows ${name}`, () => {
      assert.deepEqual(reports(file, code), []);
    });
  }

  for (const [name, file, code, alias] of [
    [
      'another slice of the same layer',
      'src/blog/pages/documents/ui/page.tsx',
      "import { x } from '../../feed/ui/x';",
      '@/blog/pages/feed/ui/x',
    ],
    [
      'an ancestor app',
      'src/basilisk/shared/content/frontmatter.ts',
      "import { x } from '../../../kernel/shared/content/frontmatter';",
      '@/kernel/shared/content/frontmatter',
    ],
    [
      'a script reaching another app',
      'src/basilisk/scripts/lib/docket.ts',
      "import type { X } from '../../../kernel/scripts/lib/read-collection.ts';",
      '@/kernel/scripts/lib/read-collection',
    ],
    [
      'a script reaching its own app layers with a spelled extension',
      'src/kernel/scripts/lib/walk.ts',
      "import '../../shared/content/paths.ts';",
      '@/kernel/shared/content/paths',
    ],
    [
      'a script reaching its own app layers',
      'src/music/scripts/masters.ts',
      "const m = await import('../shared/catalogue/index.ts');",
      '@/music/shared/catalogue',
    ],
  ] as const) {
    it(`flags ${name}`, () => {
      const [message] = reports(file, code);
      assert.match(message ?? '', new RegExp(`\`${alias}\``));
    });
  }
});
