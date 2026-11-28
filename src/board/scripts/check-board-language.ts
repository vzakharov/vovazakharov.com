/**
 * Fails when any board's files carry Cyrillic. `board sync` stops the same
 * lines where a live edit brings them in; this is the backstop for a hand edit.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { failOnRussian } from './lib/cyrillic.ts';

import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';

/** Every board's own file and zone files: `src/<x>-board/app/config/**.yaml`. */
async function boardFiles(): Promise<string[]> {
  const apps = (await readdir(path.join(REPO_ROOT, 'src'))).filter((name) =>
    name.endsWith('-board'),
  );
  const nested = await Promise.all(
    apps.map(async (app) => {
      const config = path.join(REPO_ROOT, 'src', app, 'app/config');
      const names = await readdir(config, { recursive: true });
      return names
        .filter((name) => name.endsWith('.yaml'))
        .map((name) => path.join(config, name));
    }),
  );
  return nested.flat().toSorted();
}

const files = await boardFiles();
const texts = await Promise.all(
  files.map(async (file) => readFile(file, 'utf8')),
);
failOnRussian(
  new Map(files.map((file, at) => [file, texts[at] ?? ''])),
  'a board is English, quotes translated',
);
