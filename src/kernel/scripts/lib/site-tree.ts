/**
 * Where the scripts find the repository and the site a run serves. Bare Node
 * runs `render-mermaid.ts`, relying on its type stripping, so this file stays
 * free of syntax the stripper cannot erase.
 */

import fs from 'node:fs';
import path from 'node:path';

import {
  GENERATED_DIR,
  resolveSiteId,
} from '../../shared/config/index.node-safe.ts';

export { REPO_ROOT } from './repo-root.ts';

/**
 * Every file under `target`, recursively — or `target` itself when it is a
 * file. {@link GENERATED_DIR} is skipped, which is what keeps the walk off the
 * pipeline's own output.
 */
export function filesUnder(target: string): string[] {
  return fs.statSync(target).isDirectory()
    ? fs
        .readdirSync(target)
        .filter((name) => name !== GENERATED_DIR)
        .flatMap((name) => filesUnder(path.join(target, name)))
    : [target];
}

/** Which site this run serves — the same variable its app's build reads. */
export const RENDERED_SITE = resolveSiteId();
