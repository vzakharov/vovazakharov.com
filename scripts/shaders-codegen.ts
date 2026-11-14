#!/usr/bin/env tsx

/**
 * Links the `.wgsl` modules under `src/` and writes beside each one the
 * TypeScript module its importers read, `<name>.shader.generated.ts`, exporting the
 * module as one `wgsl(...)` piece whose needs are its imports:
 *
 *   pnpm shaders:codegen
 *
 * A `.wgsl` file is WGSL with WESL `import` statements at its head
 * (`import super::hash::{fbm, worley};`, `import package::cube::…::{…};`,
 * `package` being `src/`, as `wesl.toml` says), so an editor resolves them.
 * The rest of the file ships unchanged, placed by `assemble()` like any piece
 * written in TypeScript. `scripts/lib/wesl/checks.ts` says what is checked.
 *
 * Like `pnpm styles:codegen`, it **exits non-zero when it had to write**, so a
 * vet run both repairs a stale module and reports it; on a broken import it
 * writes nothing and names each one.
 */

import fs from 'node:fs';
import path from 'node:path';

import { loadGraph } from '../eslint/masd-graph.ts';
import { generatedOf, linkAll } from './lib/wesl/link.ts';
import { render } from './lib/wesl/render.ts';

/** One line of this script's report, on stderr. */
const report = (line: string): void => {
  process.stderr.write(`${line}\n`);
};

const filesEnding = (suffix: string): string[] =>
  fs
    .readdirSync('src', { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith(suffix))
    .map((file) => path.join('src', file))
    .toSorted((a, b) => a.localeCompare(b));

const graph = loadGraph();
const { linked, errors } = await linkAll(graph, filesEnding('.wgsl'));
if (errors.length > 0) {
  for (const error of errors) report(error);
  report(`${String(errors.length)} shader import problems; nothing written.`);
  process.exit(1);
}

const rendered = await Promise.all(
  linked.map(async (module) => ({
    output: generatedOf(module.file),
    source: module.file,
    expected: await render(graph, module),
  })),
);
let rewrote = false;
for (const { output, source, expected } of rendered) {
  const found = fs.existsSync(output) ? fs.readFileSync(output, 'utf8') : '';
  if (found === expected) continue;
  fs.writeFileSync(output, expected);
  report(`regenerated ${output} from ${source}`);
  rewrote = true;
}
for (const output of filesEnding('.shader.generated.ts')) {
  if (fs.existsSync(output.replace(/\.shader\.generated\.ts$/, '.wgsl'))) {
    continue;
  }
  fs.rmSync(output);
  report(`removed ${output}, whose .wgsl is gone`);
  rewrote = true;
}
if (rewrote) {
  report('A generated shader module was stale and has been rewritten.');
  process.exit(1);
}
