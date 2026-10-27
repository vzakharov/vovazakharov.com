import * as parser from '@typescript-eslint/parser';
import { Linter } from 'eslint';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import ts from 'typescript';

import rule from './no-export-namesake';

/** Fixture files, keyed by path relative to the tree's root. */
type Tree = Record<string, string>;

/** What linting `file` of `tree` reports, the rule seeing the whole tree's program. */
function reports(tree: Tree, file: string): string[] {
  const root = mkdtempSync(path.join(tmpdir(), 'no-export-namesake-'));
  for (const [name, text] of Object.entries(tree)) {
    mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    writeFileSync(path.join(root, name), text);
  }
  const program = ts.createProgram(
    Object.keys(tree).map((name) => path.join(root, name)),
    { noEmit: true },
  );
  return new Linter({ configType: 'flat', cwd: root })
    .verify(
      tree[file] ?? '',
      [
        {
          files: ['**/*.ts'],
          languageOptions: { parser, parserOptions: { programs: [program] } },
          plugins: { vova: { rules: { 'no-export-namesake': rule } } },
          rules: { 'vova/no-export-namesake': 'error' },
        },
      ],
      path.join(root, file),
    )
    .map(({ message, ruleId }) => {
      assert.equal(ruleId, 'vova/no-export-namesake', message);
      return message;
    });
}

const LAWN = 'src/game/entities/landscape/lawn.ts';
const WORLD = 'src/game/shared/world/occupant.ts';
const PRIVATE_BESIDE_EXPORTED = {
  [LAWN]: 'const CELL = 4;\nexport const lawn = CELL;',
  [WORLD]: 'export const CELL = 0.02;',
};

describe('no-export-namesake', () => {
  it('flags a private value sharing an exported one’s name, on both sides', () => {
    assert.equal(reports(PRIVATE_BESIDE_EXPORTED, LAWN).length, 1);
    assert.equal(reports(PRIVATE_BESIDE_EXPORTED, WORLD).length, 1);
  });

  it('flags two exported namesakes', () => {
    assert.equal(
      reports(
        {
          [LAWN]: 'export const CELL = 4;',
          [WORLD]: 'export const CELL = 0.02;',
        },
        LAWN,
      ).length,
      1,
    );
  });

  it('counts a value exported by an export list', () => {
    assert.equal(
      reports(
        {
          [LAWN]: 'const CELL = 4;',
          [WORLD]: 'const CELL = 0.02;\nexport { CELL };',
        },
        LAWN,
      ).length,
      1,
    );
  });

  it('names the namesake’s file in its message', () => {
    const [message] = reports(PRIVATE_BESIDE_EXPORTED, LAWN);
    assert.match(
      message ?? '',
      /`CELL`.*`src\/game\/shared\/world\/occupant\.ts`/,
    );
  });

  for (const [name, tree] of [
    [
      'two private namesakes',
      { [LAWN]: 'const CELL = 4;', [WORLD]: 'const CELL = 0.02;' },
    ],
    [
      'a namesake in another app',
      {
        [LAWN]: 'const CELL = 4;',
        'src/blog/shared/x/cell.ts': 'export const CELL = 1;',
      },
    ],
    [
      'a namesake in a test',
      {
        [LAWN]: 'const CELL = 4;',
        'src/game/shared/world/occupant.test.ts': 'export const CELL = 1;',
      },
    ],
    [
      'a namesake in a kit',
      {
        [LAWN]: 'const CELL = 4;',
        'src/game/shared/world/occupant.test-kit.ts': 'export const CELL = 1;',
      },
    ],
    [
      'a re-export, which declares nothing',
      {
        [LAWN]: 'export const CELL = 4;',
        'src/game/entities/landscape/index.ts':
          "export { CELL } from './lawn';",
      },
    ],
    [
      'a name a convention gives every catalogue',
      {
        [LAWN]: 'export const messages = 1;',
        'src/game/pages/play/i18n/index.ts': 'export const messages = 2;',
      },
    ],
    [
      'a function of the same name, the rule reading variables alone',
      {
        [LAWN]: 'const CELL = 4;',
        [WORLD]: 'export function CELL() { return 0.02; }',
      },
    ],
  ] as const) {
    it(`spares ${name}`, () => {
      assert.deepEqual(reports(tree, LAWN), []);
    });
  }
});
