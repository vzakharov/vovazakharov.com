#!/usr/bin/env node

/**
 * Steiger over every app root in `src/masd.json`, one run each:
 *
 *   pnpm lint:fsd
 *
 * Steiger finds no FSD root above several of them, and each app is an FSD tree
 * of its own, so a root is the unit it can check. What crosses roots —
 * imports between apps, and a slice earned only by its descendants' use — is
 * `eslint-plugin-boundaries` and `scripts/masd-check.ts`. See
 * .claude/rules/masd.md.
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';

import { loadGraph } from '../eslint/masd-graph.ts';

const REPO_ROOT = path.join(import.meta.dirname, '..');

// Run from the repository root, where `steiger.config.mjs` resolves.
const failed = [...loadGraph().keys()].filter(
  (app) =>
    spawnSync('pnpm', ['exec', 'steiger', `src/${app}`], {
      cwd: REPO_ROOT,
      stdio: 'inherit',
    }).status !== 0,
);

if (failed.length > 0) {
  process.stderr.write(`lint:fsd: Steiger failed on ${failed.join(', ')}\n`);
  process.exitCode = 1;
}
