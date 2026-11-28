import fs from 'node:fs';
import path from 'node:path';

import { songAudio } from '@/clip/shared/score/index.server-only';

import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';

/** Where the clip's scripts keep their files: gitignored. */
export const CLIP_TMP = path.join(REPO_ROOT, 'tmp/clip');

/** The song's MP3 on disk, downloaded into `CLIP_TMP` on first use. */
export async function songFile(): Promise<string> {
  const url = songAudio();
  const name = path.basename(decodeURIComponent(new URL(url).pathname));
  const file = path.join(CLIP_TMP, name);
  if (fs.existsSync(file)) return file;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url} answered ${String(response.status)}`);
  }
  fs.mkdirSync(CLIP_TMP, { recursive: true });
  fs.writeFileSync(file, Buffer.from(await response.arrayBuffer()));
  return file;
}
