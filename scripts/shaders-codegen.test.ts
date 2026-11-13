import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

const SCRIPT = path.resolve(import.meta.dirname, 'shaders-codegen.ts');
const TSX = path.resolve(import.meta.dirname, '..', 'node_modules/.bin/tsx');
const THEME = 'src/cube/entities/theme';

/**
 * A throwaway tree: the shader factory, the theme's kit with one module, and
 * the files given.
 */
function tree(files: Record<string, string>): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'shaders-codegen-'));
  const all: Record<string, string> = {
    '../../shared/shader/index.ts': "export { wgsl } from './wgsl';",
    '../../shared/shader/wgsl.ts':
      'export const wgsl = (...parts: unknown[]) => parts;',
    'kit/index.ts': "export { BASE } from './lib/base.shader';",
    'kit/lib/base.wgsl': 'fn base() -> f32 {\n  return 1.0;\n}\n',
    ...files,
  };
  for (const [file, text] of Object.entries(all)) {
    const at = path.join(root, THEME, file);
    fs.mkdirSync(path.dirname(at), { recursive: true });
    fs.writeFileSync(at, text);
  }
  return root;
}

function run(root: string): { status: number | null; report: string } {
  const { status, stderr } = spawnSync(TSX, [SCRIPT], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, NODE_OPTIONS: '' },
  });
  return { status, report: stderr };
}

const KIT = 'package::cube::entities::theme::kit::lib::base';

const REFUSALS: ReadonlyArray<[string, Record<string, string>, RegExp]> = [
  [
    'a name used from a module it does not import',
    {
      'dwelling/config/floor.wgsl':
        'fn floor() -> f32 {\n  return base();\n}\n',
      'leisure/config/other.wgsl': `import ${KIT}::base;\n\nfn other() -> f32 {\n  return base();\n}\n`,
    },
    /floor\.wgsl: uses base from .*base\.wgsl unimported/,
  ],

  [
    'an import nothing uses',
    { 'dwelling/config/floor.wgsl': `import ${KIT}::base;\n\nfn floor() {}\n` },
    /base is imported and never used/,
  ],

  [
    'an item the module does not declare',
    {
      'dwelling/config/floor.wgsl': `import ${KIT}::nothing;\n\nfn floor() {}\n`,
    },
    /declares no nothing/,
  ],

  [
    'one band importing another',
    {
      'dwelling/lib/home.wgsl': `import ${KIT}::base;\n\nfn home() -> f32 {\n  return base();\n}\n`,
      'dwelling/index.ts': "export { HOME } from './lib/home.shader';",
      'laboratory/config/floor.wgsl':
        'import package::cube::entities::theme::dwelling::lib::home::home;\n\nfn floor() -> f32 {\n  return home();\n}\n',
    },
    /theme\/dwelling reaches a sibling itself, so it is a band/,
  ],

  [
    'a module its unit does not export',
    {
      'kit/index.ts': 'export {};',
      'dwelling/config/floor.wgsl': `import ${KIT}::base;\n\nfn floor() -> f32 {\n  return base();\n}\n`,
    },
    /kit\/index\.ts does not export BASE/,
  ],

  [
    "super:: out of the importer's unit",
    {
      'dwelling/config/floor.wgsl':
        'import super::super::super::kit::lib::base::base;\n\nfn floor() -> f32 {\n  return base();\n}\n',
    },
    /theme\/kit is entered by a package:: path/,
  ],

  [
    'a layer above the importer',
    {
      'dwelling/config/floor.wgsl':
        'import package::cube::pages::cube::lib::stage::stage;\n\nfn floor() -> f32 {\n  return stage();\n}\n',
      '../../pages/cube/lib/stage.wgsl':
        'fn stage() -> f32 {\n  return 1.0;\n}\n',
    },
    /pages sits above entities/,
  ],
];

describe('pnpm shaders:codegen', () => {
  it('writes each module once, then has nothing to write', () => {
    const root = tree({
      'dwelling/config/floor.wgsl': `import ${KIT}::base;\n\nfn floor() -> f32 {\n  return base();\n}\n`,
    });
    assert.equal(run(root).status, 1);
    const written = fs.readFileSync(
      path.join(root, THEME, 'dwelling/config/floor.shader.ts'),
      'utf8',
    );
    assert.match(
      written,
      /import { wgsl } from '@\/cube\/shared\/shader';\n\nimport { BASE } from '\.\.\/\.\.\/kit';/,
    );
    assert.match(
      written,
      /`\nfn floor\(\) -> f32 {\n {2}return base\(\);\n}\n`,\n {2}BASE,/,
    );
    assert.equal(run(root).status, 0);
  });

  it('imports a bound variable by its name', () => {
    const root = tree({
      'kit/index.ts': [
        "export { BASE } from './lib/base.shader';",
        "export { FRAME } from './lib/frame.shader';",
      ].join('\n'),
      'kit/lib/frame.wgsl':
        'struct Frame {\n  at: vec4f,\n}\n\n@group(0) @binding(0) var<uniform> frame: Frame;\n',
      'dwelling/config/floor.wgsl':
        'import package::cube::entities::theme::kit::lib::frame::frame;\n\nfn floor() -> f32 {\n  return frame.at.x;\n}\n',
    });
    const first = run(root);
    assert.equal(first.status, 1, first.report);
    assert.equal(run(root).status, 0);
  });

  for (const [name, files, says] of REFUSALS) {
    it(`refuses ${name}`, () => {
      const root = tree(files);
      const { status, report } = run(root);
      assert.equal(status, 1);
      assert.match(report, says);
      assert.ok(
        !fs.existsSync(path.join(root, THEME, 'kit/lib/base.shader.ts')),
        'wrote despite the problem',
      );
    });
  }
});
