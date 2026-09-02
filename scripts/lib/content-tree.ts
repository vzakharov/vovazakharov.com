/**
 * Where the render scripts walk for their sources. Bare Node runs them, relying
 * on its type stripping, so this file stays free of syntax the stripper cannot
 * erase.
 */

import fs from 'node:fs';
import path from 'node:path';

export const REPO_ROOT = path.join(import.meta.dirname, '..', '..');

export const CONTENT_ROOT = path.join(REPO_ROOT, 'public', 'content');

/**
 * Every file under `dir` whose name satisfies `matches`, recursively. The
 * `generated/` subtree is skipped: it holds the pipeline's own output, so a
 * walk that reached into it would hand a script its own renders as sources.
 */
export function contentFiles(
  dir: string,
  matches: (name: string) => boolean,
): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return entry.name === 'generated' ? [] : contentFiles(entryPath, matches);
    }

    return matches(entry.name) ? [entryPath] : [];
  });
}
