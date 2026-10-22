/**
 * The `ffmpeg` half of a tag run: tagging a file and rewrapping a FLAC into
 * MP4, each checked to decode to the audio it started from, then staged.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { MUSIC_WORK_DIR, type MusicRepo, stageBlob } from './music-repo.ts';
import type { MasterFile, SongTagJob } from './song-tag-source.ts';
import { writeSongTags } from './song-tag-writer.ts';

/** The decoded audio's MD5, which tagging must leave as it was. */
function audioMd5(file: string): string {
  return execFileSync(
    'ffmpeg',
    ['-v', 'error', '-i', file, '-map', '0:a', '-f', 'md5', '-'],
    { encoding: 'utf8' },
  ).trim();
}

/** Tags one file's bytes and stages them under its names; the tagged bytes. */
export function tagFile(
  repo: MusicRepo,
  job: SongTagJob,
  file: MasterFile,
  source: Buffer,
): Buffer {
  const local = path.join(MUSIC_WORK_DIR, `${job.slug}.${file.extension}`);

  fs.writeFileSync(local, source);

  const before = audioMd5(local);

  writeSongTags(local, job.tags, job.coverPath);

  if (audioMd5(local) !== before) {
    throw new Error(
      `Tagging ${job.slug}'s ${file.extension} changed its audio`,
    );
  }

  const tagged = fs.readFileSync(local);

  fs.rmSync(local);
  stageBlob(repo, tagged, file.names);

  return tagged;
}

/** Stages a tagged FLAC's audio, copied into MP4, as the job's stream; the cover stays behind. */
export function stageStream(
  repo: MusicRepo,
  job: SongTagJob,
  stream: MasterFile,
  flac: Buffer,
): void {
  const local = path.join(MUSIC_WORK_DIR, `${job.slug}.stream`);
  const [source, target] = [`${local}.flac`, `${local}.mp4`];

  fs.writeFileSync(source, flac);
  execFileSync('ffmpeg', [
    '-v',
    'error',
    '-y',
    '-i',
    source,
    '-map',
    '0:a',
    '-c:a',
    'copy',
    '-movflags',
    '+faststart',
    target,
  ]);

  if (audioMd5(target) !== audioMd5(source)) {
    throw new Error(`Rewrapping ${job.slug}'s master changed its audio`);
  }

  stageBlob(repo, fs.readFileSync(target), stream.names);
  fs.rmSync(source);
  fs.rmSync(target);
}
