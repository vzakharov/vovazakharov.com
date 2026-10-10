/**
 * The static exports a vet check reads, as the build above it left them under
 * `apps/<site>/out/`. Bare Node runs the checks that import this, so it stays
 * free of anything from the app.
 */

import fs from 'node:fs';
import path from 'node:path';

const APPS = path.join(import.meta.dirname, '..', '..', 'apps');

/** Every file under `dir` ending in `extension`, at any depth. */
export function walk(dir: string, extension: string): string[] {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) return walk(full, extension);

    return entry.name.endsWith(extension) ? [full] : [];
  });
}

/** Each built site's `out/`, failing the check when there is none to read. */
export function builtSites(): string[] {
  const built = fs
    .readdirSync(APPS, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(APPS, entry.name, 'out'))
    .filter((dir) => fs.existsSync(dir));

  if (built.length === 0) {
    throw new Error(
      'No built site found under apps/*/out — run `pnpm build` first.\n' +
        'This check reads the rendered pages, so it has nothing to say without it.',
    );
  }

  return built;
}

/** The address a page in the export answers at: `cv/cto/ru.html` → `/cv/cto/ru`. */
export const pageRoute = (out: string, page: string): string =>
  `/${path.relative(out, page).replace(/(^|\/)index\.html$|\.html$/, '')}`;
