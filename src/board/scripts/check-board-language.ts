/**
 * Fails when any board's files carry Cyrillic: a board is written in English,
 * an operator's words on it included, translated. Run by
 * `src/board/scripts/vet-boards.sh` when a branch changes a board.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { cyrillicLines } from './lib/cyrillic.ts';

import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';

/** Every board's own file and zone files: `src/<x>-board/app/config/**.yaml`. */
async function boardFiles(): Promise<string[]> {
  const apps = (await readdir(path.join(REPO_ROOT, 'src'))).filter((name) =>
    name.endsWith('-board'),
  );
  const nested = await Promise.all(
    apps.map(async (app) => {
      const config = path.join('src', app, 'app/config');
      const names = await readdir(path.join(REPO_ROOT, config), {
        recursive: true,
      });
      return names
        .filter((name) => name.endsWith('.yaml'))
        .map((name) => path.join(config, name));
    }),
  );
  return nested.flat().toSorted();
}

const findings = (
  await Promise.all(
    (await boardFiles()).map(async (file) =>
      cyrillicLines(await readFile(path.join(REPO_ROOT, file), 'utf8')).map(
        ({ line, words }) => `${file}:${line}: “${words}”`,
      ),
    ),
  )
).flat();
for (const finding of findings) process.stderr.write(`${finding}\n`);
if (findings.length > 0)
  throw new Error(
    `${findings.length} board line(s) carry Russian; a board is English, quotes translated`,
  );
