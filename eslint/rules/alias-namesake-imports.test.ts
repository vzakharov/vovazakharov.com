import * as parser from '@typescript-eslint/parser';
import { Linter } from 'eslint';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import rule from './alias-namesake-imports';

/** What linting `code` reports. */
function reports(code: string): string[] {
  return new Linter({ configType: 'flat' })
    .verify(
      code,
      [
        {
          files: ['**/*.ts'],
          languageOptions: { parser },
          plugins: { vova: { rules: { 'alias-namesake-imports': rule } } },
          rules: { 'vova/alias-namesake-imports': 'error' },
        },
      ],
      'file.ts',
    )
    .map(({ message, ruleId }) => {
      assert.equal(ruleId, 'vova/alias-namesake-imports', message);
      return message;
    });
}

describe('alias-namesake-imports', () => {
  it('flags the bare import of a name another module’s import renamed', () => {
    const found = reports(
      "import { messages as blogMessages } from '@/blog/shared/i18n';\n" +
        "import { messages } from '../i18n';",
    );
    assert.equal(found.length, 1);
    assert.match(
      found[0] ?? '',
      /`messages`.*`@\/blog\/shared\/i18n`.*`\.\.\/i18n`/,
    );
  });

  it('flags a type import as well as a value', () => {
    assert.equal(
      reports(
        "import type { Props as CardProps } from './card';\n" +
          "import { type Props } from './list';",
      ).length,
      1,
    );
  });

  for (const [name, code] of [
    [
      'every import of the name renamed',
      "import { messages as blogMessages } from '@/blog/shared/i18n';\n" +
        "import { messages as homeMessages } from '../i18n';",
    ],
    [
      'a name from one module, twice',
      "import { messages } from '../i18n';\n" +
        "import { type messages as M } from '../i18n';",
    ],
    [
      'a default import, which its importer names',
      "import a from './a';\nimport { default as b } from './b';",
    ],
  ] as const) {
    it(`spares ${name}`, () => {
      assert.deepEqual(reports(code), []);
    });
  }
});
