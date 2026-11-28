/**
 * Measures the master's loudness at `ENERGY_RATE` frames a second and writes
 * it to `src/clip/shared/score/energy-data.ts` as one digit a frame, 0 for
 * silence to 9 for the loudest stab, so a scene reads the mix's stabs and
 * holes without decoding audio. Run it again when the master changes:
 *
 *   pnpm measure:clip
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { ENERGY_RATE } from '@/clip/shared/score';

import { songFile } from './lib/song-file';

import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';

const SAMPLE_RATE = 44_100;
/** The loudness read as 0 and as 9, in dB below full scale: a mastered mix lives near the top. */
const FLOOR_DB = -30;
const CEILING_DB = -3;
/** Digits a line of the written module holds: four seconds. */
const LINE = ENERGY_RATE * 4;

const OUT = path.join(REPO_ROOT, 'src/clip/shared/score/energy-data.ts');

/** The master as mono float samples. */
function decode(file: string): Float32Array {
  const run = spawnSync(
    'ffmpeg',
    [
      ['-hide_banner', '-loglevel', 'error', '-i', file],
      ['-ac', '1', '-ar', String(SAMPLE_RATE), '-f', 'f32le', '-'],
    ].flat(),
    { maxBuffer: 1 << 30 },
  );
  if (run.status !== 0) throw new Error(`ffmpeg could not decode ${file}`);
  const { buffer, byteOffset, byteLength } = run.stdout;
  return new Float32Array(buffer.slice(byteOffset, byteOffset + byteLength));
}

function digits(samples: Float32Array): string {
  const frames = Math.ceil((samples.length / SAMPLE_RATE) * ENERGY_RATE);
  return Array.from({ length: frames }, (_, frame) => {
    const from = Math.floor((frame * SAMPLE_RATE) / ENERGY_RATE);
    const to = Math.min(
      samples.length,
      Math.floor(((frame + 1) * SAMPLE_RATE) / ENERGY_RATE),
    );
    let sum = 0;
    for (let n = from; n < to; n += 1) sum += (samples[n] ?? 0) ** 2;
    const db = 10 * Math.log10(sum / Math.max(1, to - from) + 1e-12);
    const level = ((db - FLOOR_DB) / (CEILING_DB - FLOOR_DB)) * 9;
    return String(Math.min(9, Math.max(0, Math.round(level))));
  }).join('');
}

const all = digits(decode(await songFile()));
const lines = Array.from(
  { length: Math.ceil(all.length / LINE) },
  (_, n) => `  '${all.slice(n * LINE, (n + 1) * LINE)}',`,
);
fs.writeFileSync(
  OUT,
  [
    '// Written by `pnpm measure:clip` from the master; run it again rather than editing.',
    '',
    '/** The mix’s loudness, one digit a frame at `ENERGY_RATE`, four seconds a line. */',
    'export const ENERGY_DIGITS = [',
    ...lines,
    "].join('');",
    '',
  ].join('\n'),
);
process.stdout.write(
  `${path.relative(REPO_ROOT, OUT)}: ${String(all.length)} frames\n`,
);
