import * as parser from '@typescript-eslint/parser';
import { Linter } from 'eslint';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

import rule from './segment-order';

const root = mkdtempSync(path.join(tmpdir(), 'segment-order-'));

// A slice with the standard segments, a shared layer declaring its own, and a
// descendant app's shared reaching it.
for (const segment of ['ui', 'model', 'api', 'shape', 'lib']) {
  mkdirSync(path.join(root, 'src/app1/pages/home', segment), {
    recursive: true,
  });
}
for (const segment of ['ui', 'seo', 'lib']) {
  mkdirSync(path.join(root, 'src/app1/shared', segment), { recursive: true });
}
mkdirSync(path.join(root, 'src/app2/shared/lib'), { recursive: true });
writeFileSync(
  path.join(root, 'src/app1/shared/masd.json'),
  JSON.stringify({ segments: ['ui', 'seo', 'lib'] }),
);

const linter = new Linter({ configType: 'flat', cwd: root });

function reports(file: string, code: string): string[] {
  return linter
    .verify(
      code,
      [
        {
          files: ['**/*.{ts,tsx}'],
          languageOptions: { parser },
          plugins: { vova: { rules: { 'segment-order': rule } } },
          rules: { 'vova/segment-order': 'error' },
        },
      ],
      path.join(root, file),
    )
    .map(({ message, ruleId }) => {
      assert.equal(ruleId, 'vova/segment-order', message);
      return message;
    });
}

describe('segment-order', () => {
  for (const [name, file, code] of [
    [
      'a segment reaching one below',
      'src/app1/pages/home/model/store.ts',
      "import { fetch } from '../api/fetch';",
    ],
    [
      'a segment reaching the lowest',
      'src/app1/pages/home/ui/view/card.tsx',
      "import { x } from '../../lib/x';",
    ],
    [
      'files of one segment',
      'src/app1/pages/home/api/fetch.ts',
      "import { x } from './shared-bit';",
    ],
    [
      'the slice root reaching any segment',
      'src/app1/pages/home/index.ts',
      "export { Page } from './ui/page';",
    ],
    [
      'a declared order',
      'src/app1/shared/seo/meta.ts',
      "import { x } from '../lib/x';",
    ],
    [
      'an import leaving the place',
      'src/app1/pages/home/lib/x.ts',
      "import { y } from '../../other/ui/y';",
    ],
    [
      'a file outside any layer',
      'src/app1/scripts/lib/x.ts',
      "import { y } from '../ui/y';",
    ],
    [
      'an alias into a lower segment of its own place',
      'src/app1/shared/seo/meta.ts',
      "import { x } from '@/app1/shared/lib/x';",
    ],
    [
      'an alias into an ancestor’s shared',
      'src/app2/shared/lib/x.ts',
      "import { seo } from '@/app1/shared/seo';",
    ],
  ] as const) {
    it(`allows ${name}`, () => {
      assert.deepEqual(reports(file, code), []);
    });
  }

  for (const [name, file, code, from, to] of [
    [
      'api reaching model',
      'src/app1/pages/home/api/fetch.ts',
      "import type { Movie } from '../model/movie';",
      'api',
      'model',
    ],
    [
      'a test reaching ui',
      'src/app1/pages/home/model/store.test.ts',
      "import { render } from '../ui/render';",
      'model',
      'ui',
    ],
    [
      'a re-export upwards',
      'src/app1/pages/home/shape/index.ts',
      "export * from '../api/fetch';",
      'shape',
      'api',
    ],
    [
      'a dynamic import upwards',
      'src/app1/shared/lib/x.ts',
      "const seo = await import('../seo/meta');",
      'lib',
      'seo',
    ],
    [
      'an alias upwards in its own place',
      'src/app1/shared/lib/x.ts',
      "import { meta } from '@/app1/shared/seo/meta';",
      'lib',
      'seo',
    ],
    [
      'an alias naming a segment by its directory',
      'src/app1/shared/lib/x.ts',
      "import { seo } from '@/app1/shared/seo';",
      'lib',
      'seo',
    ],
  ] as const) {
    it(`flags ${name}`, () => {
      const [message] = reports(file, code);
      assert.match(
        message ?? '',
        new RegExp(`\`${from}\` may not import \`${to}\``),
      );
    });
  }
});
