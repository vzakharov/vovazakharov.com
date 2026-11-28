import fs from 'node:fs';
import path from 'node:path';

import { songAudio } from '@/clip/shared/score/index.server-only';

import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';

/** Where the clip's scripts keep their files: gitignored. */
export const CLIP_TMP = path.join(REPO_ROOT, 'tmp/clip');

/**
 * The vocal stem the song was mixed from, a WAV that stays in `CLIP_TMP`:
 * it is never committed, only measured.
 */
const VOCALS_URL =
  'https://raw.githubusercontent.com/vovas-music/horowo/main/Media/audio%20%5Bvocals%5D.wav';

/**
 * How far the stem runs ahead of the master, in seconds: the stem's `t` is
 * the master's `t - VOCALS_LEAD`. Measured by cross-correlating the two
 * waveforms, with no drift between them at 5, 35 and 50 s.
 */
export const VOCALS_LEAD = 2.508_625;

/** The file at `url` on disk, downloaded into `CLIP_TMP` on first use. */
async function cached(url: string): Promise<string> {
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

/** The song's MP3, as the catalogue serves it. */
export const songFile = async (): Promise<string> => cached(songAudio());

export const vocalsFile = async (): Promise<string> => cached(VOCALS_URL);
