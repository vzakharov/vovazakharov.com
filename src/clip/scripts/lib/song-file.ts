import fs from 'node:fs';
import path from 'node:path';

import { SONG_URL } from '@/clip/shared/score';

import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';

/** Where the clip's scripts keep their files: gitignored. */
export const CLIP_TMP = path.join(REPO_ROOT, 'tmp/clip');

/** The master on disk, downloaded into `CLIP_TMP` on first use. */
export async function songFile(): Promise<string> {
  const file = path.join(CLIP_TMP, path.basename(new URL(SONG_URL).pathname));
  if (fs.existsSync(file)) return file;
  const response = await fetch(SONG_URL);
  if (!response.ok) {
    throw new Error(`${SONG_URL} answered ${String(response.status)}`);
  }
  fs.mkdirSync(CLIP_TMP, { recursive: true });
  fs.writeFileSync(file, Buffer.from(await response.arrayBuffer()));
  return file;
}
