#!/usr/bin/env node

/**
 * Generates `styles/_breakpoints.scss` from the scale in
 * `src/app/styles/breakpoints.ts`.
 *
 * The scale has to exist in two languages — Mantine resolves responsive props
 * (`cols={{ base: 1, md: 2 }}`) from `theme.breakpoints`, and Sass needs the
 * numbers as literals because a media-query condition cannot read a custom
 * property — and Sass cannot import TypeScript. So the Sass half is derived
 * rather than kept in step by hand.
 *
 *   pnpm styles:breakpoints            # write the partial
 *   pnpm styles:breakpoints --check    # fail on drift, write nothing
 *
 * Bare Node runs this file, relying on its type stripping, so the import of the
 * scale carries its `.ts` extension.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { breakpoints } from '../src/app/styles/breakpoints.ts';

const SOURCE = 'src/app/styles/breakpoints.ts';
const OUTPUT = 'styles/_breakpoints.scss';

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = path.join(REPO_ROOT, OUTPUT);

const expected = `// Generated from ${SOURCE}
// by \`pnpm styles:breakpoints\`. Edit the scale there, not here — the vet
// run's \`--check\` fails on a stale partial.

${Object.entries(breakpoints)
  .map(([name, value]) => `$breakpoint-${name}: ${value};`)
  .join('\n')}
`;

if (!process.argv.includes('--check')) {
  fs.writeFileSync(outputPath, expected);
  console.log(
    `wrote ${OUTPUT} — ${Object.keys(breakpoints).length} breakpoints`
  );
  process.exit(0);
}

const found = fs.existsSync(outputPath)
  ? fs.readFileSync(outputPath, 'utf8')
  : '';

if (found === expected) {
  process.exit(0);
}

console.error(`${OUTPUT} is not what ${SOURCE} generates:\n`);

const expectedLines = expected.split('\n');
const foundLines = found.split('\n');

for (let i = 0; i < Math.max(expectedLines.length, foundLines.length); i += 1) {
  if (expectedLines[i] === foundLines[i]) continue;

  console.error(`  line ${i + 1}`);
  console.error(`    expected: ${expectedLines[i] ?? '(end of file)'}`);
  console.error(`    found:    ${foundLines[i] ?? '(end of file)'}`);
}

console.error(`\nRun \`pnpm styles:breakpoints\`.`);
process.exit(1);
