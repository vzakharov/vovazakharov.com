/**
 * Runs a script under tsx from a working directory of the caller's choosing —
 * an end-to-end test's throwaway tree, where tsx's own lookup of the
 * `tsconfig.json` that maps the `@/` alias would come up empty.
 */

import { spawnSync, type SpawnSyncOptions } from 'node:child_process';
import path from 'node:path';

import { REPO_ROOT } from './repo-root';

const TSX = path.join(REPO_ROOT, 'node_modules/.bin/tsx');
const TSCONFIG = path.join(REPO_ROOT, 'tsconfig.json');

export const runTsxScript = (
  script: string,
  args: readonly string[],
  options: SpawnSyncOptions,
) =>
  spawnSync(TSX, ['--tsconfig', TSCONFIG, script, ...args], {
    ...options,
    encoding: 'utf8',
  });
