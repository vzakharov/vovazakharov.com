import * as parser from '@typescript-eslint/parser';
import { Linter } from 'eslint';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import rule from './error-class-name';

const CONFIG: Linter.Config[] = [
  {
    files: ['**/*.ts'],
    languageOptions: { parser },
    plugins: { vova: { rules: { 'error-class-name': rule } } },
    rules: { 'vova/error-class-name': 'error' },
  },
];

const linter = new Linter({ configType: 'flat' });

const reports = (code: string) =>
  linter.verify(code, CONFIG, 'error.ts').map(({ ruleId }) => ruleId);

const fixed = (code: string) =>
  linter.verifyAndFix(code, CONFIG, 'error.ts').output;

describe('error-class-name', () => {
  it('spares a constant named as its class', () => {
    assert.deepEqual(
      reports("const PricingError = errorClass('PricingError');"),
      [],
    );
  });

  it('spares a call of another function', () => {
    assert.deepEqual(reports("const PricingError = named('Other');"), []);
  });

  for (const [name, code] of [
    ['a different name', "const PricingError = errorClass('PriceError');"],
    ['a name known only at runtime', 'const PricingError = errorClass(name);'],
    ['no name at all', 'const PricingError = errorClass();'],
  ] as const) {
    it(`flags ${name}, and writes the constant's name in`, () => {
      assert.deepEqual(reports(code), ['vova/error-class-name']);
      assert.equal(
        fixed(code),
        "const PricingError = errorClass('PricingError');",
      );
    });
  }
});
