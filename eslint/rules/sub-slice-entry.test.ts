import * as parser from '@typescript-eslint/parser';
import { Linter } from 'eslint';
import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

import rule from './sub-slice-entry';

const root = path.join(tmpdir(), 'sub-slice-entry');

const linter = new Linter({ configType: 'flat', cwd: root });

function reports(file: string, code: string): string[] {
  return linter
    .verify(
      code,
      [
        {
          files: ['**/*.{ts,tsx}'],
          languageOptions: { parser },
          plugins: { vova: { rules: { 'sub-slice-entry': rule } } },
          rules: { 'vova/sub-slice-entry': 'error' },
        },
      ],
      path.join(root, file),
    )
    .map(({ message, ruleId }) => {
      assert.equal(ruleId, 'vova/sub-slice-entry', message);
      return message;
    });
}

const DOCUMENT = 'src/blog/entities/document';

describe('sub-slice-entry', () => {
  for (const [name, file, code] of [
    [
      'the slice entering a sub-slice by its barrel',
      `${DOCUMENT}/ui/source-list.tsx`,
      "import { x } from '../prose';",
    ],
    [
      'a sub-slice’s suffixed barrel',
      `${DOCUMENT}/index.ts`,
      "export { x } from './prose/index.server-only';",
    ],
    [
      'test code entering by the test-only barrel',
      `${DOCUMENT}/ui/source-list.test.ts`,
      "import { x } from '../prose/index.test-only';",
    ],
    [
      'the slice’s test-only barrel entering the sub-slice’s',
      `${DOCUMENT}/index.test-only.ts`,
      "export { x } from './prose/index.test-only';",
    ],
    [
      'a sub-slice’s files reaching each other',
      `${DOCUMENT}/prose/ui/content-link.tsx`,
      "import { x } from '../model/link';",
    ],
    [
      'a sub-slice reaching its parent',
      `${DOCUMENT}/prose/ui/content-link.tsx`,
      "import { x } from '../../lib/x';",
    ],
    [
      'a sub-slice entering its own nested one by its barrel',
      `${DOCUMENT}/prose/ui/content-link.tsx`,
      "import { x } from '../inner';",
    ],
    [
      'a folder inside a segment',
      `${DOCUMENT}/ui/source-list.tsx`,
      "import { x } from './backdrop/x';",
    ],
    [
      'another slice, which boundaries guards',
      `${DOCUMENT}/ui/source-list.tsx`,
      "import { x } from '@/blog/shared/content/prose/ui/x';",
    ],
  ] as const) {
    it(`allows ${name}`, () => {
      assert.deepEqual(reports(file, code), []);
    });
  }

  for (const [name, file, code, barrel] of [
    [
      'the slice reaching into a sub-slice',
      `${DOCUMENT}/ui/source-list.tsx`,
      "import { x } from '../prose/ui/content-link';",
      '../prose',
    ],
    [
      'the slice reaching into a sub-slice by alias',
      `${DOCUMENT}/index.ts`,
      "export { x } from '@/blog/entities/document/prose/ui/content-link';",
      './prose',
    ],
    [
      'a sibling sub-slice reaching in',
      `${DOCUMENT}/cards/ui/document-cards.tsx`,
      "import { x } from '../../prose/model/link';",
      '../../prose',
    ],
    [
      'a sub-slice reaching into its nested one',
      `${DOCUMENT}/prose/ui/content-link.tsx`,
      "import { x } from '../inner/ui/x';",
      '../inner',
    ],
    [
      'shipped code taking the test-only barrel',
      `${DOCUMENT}/ui/source-list.tsx`,
      "import { x } from '../prose/index.test-only';",
      '../prose',
    ],
  ] as const) {
    it(`flags ${name}`, () => {
      const [message] = reports(file, code);
      assert.match(message ?? '', new RegExp(`\`${barrel}\``));
    });
  }
});
