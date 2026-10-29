/**
 * The file walk and import resolution the import-graph scripts share, so no two
 * of them disagree on where an import lands. Every path is relative to the
 * working directory, which is the repository root or a test's tree.
 */

import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

export const SOURCE = /\.tsx?$/;

/** Every `.ts`/`.tsx` file under `directory`, at any depth. */
const walk = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && SOURCE.test(entry.name))
    .map((entry) =>
      path.relative(process.cwd(), path.join(entry.parentPath, entry.name)),
    );

export const subdirectories = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

/** Every source file of the apps under `src/` and of the sites' routers. */
export const appFiles = (): string[] => [
  ...walk('src'),
  ...subdirectories('sites').flatMap((site) =>
    walk(path.join('sites', site, 'app')),
  ),
];

/**
 * The path a specifier names, before an extension or `index.ts` is tried; a
 * package specifier names none.
 */
export function resolveImport(
  from: string,
  specifier: string,
): string | undefined {
  if (specifier.startsWith('@/')) return path.join('src', specifier.slice(2));
  if (specifier.startsWith('.')) {
    return path.join(path.dirname(from), specifier);
  }
  return undefined;
}

/** The source file a resolved path loads, if it exists. */
export function sourceFile(base: string): string | undefined {
  const stem = base.replace(SOURCE, '');
  return [base, `${stem}.ts`, `${stem}.tsx`, path.join(stem, 'index.ts')].find(
    (candidate) => SOURCE.test(candidate) && existsSync(candidate),
  );
}
