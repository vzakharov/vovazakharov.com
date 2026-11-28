/**
 * Measures what the clip's scenes read off the audio and writes it under
 * `src/clip/shared/score/` as data, so no scene decodes audio:
 *
 * - `energy-data.ts` — the master's loudness;
 * - `voice-data.ts` — the vocal stem's loudness, in the master's time;
 * - `kick-data.ts` — the kick's onsets, read from the master's band below
 *   90 Hz, where the kick stands clear of the guitars.
 *
 * A loudness is one digit a frame at `ENERGY_RATE`, 0 for silence to 9 for
 * the loudest. Run it again when the master or the stem changes:
 *
 *   pnpm measure:clip
 */

import fs from 'node:fs';
import path from 'node:path';

import type { Ranged } from '@/kernel/shared/typings';

import { ENERGY_RATE } from '@/clip/shared/score';

import { decode, powerDb } from './lib/decode';
import { onsets, type Picking } from './lib/onsets';
import { songFile, VOCALS_LEAD, vocalsFile } from './lib/song-file';

import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';

const LEVEL_RATE = 44_100;
const ONSET_RATE = 22_050;
/** Digits a line of a written module holds: four seconds. */
const LINE = ENERGY_RATE * 4;
const SCORE = path.join(REPO_ROOT, 'src/clip/shared/score');

// Each scale is the range read as 0 and as 9, in dB below full scale.
/** A mastered mix lives near the top. */
const MIX: Ranged = { from: -30, to: -3 };
/** A dry vocal breathes well below it, and silence between lines is near nothing. */
const VOICE: Ranged = { from: -42, to: -18 };

/** The band the kick is read in, and how hard it must hit to count. */
const KICK: Picking = {
  samplingHz: ONSET_RATE,
  band: { from: 35, to: 90 },
  minRise: 8,
  minGap: 0.1,
};

function digits(
  samples: Float32Array,
  { from: floor, to: ceiling }: Ranged,
): string {
  const frames = Math.ceil((samples.length / LEVEL_RATE) * ENERGY_RATE);
  return Array.from({ length: frames }, (_, frame) => {
    const from = Math.floor((frame * LEVEL_RATE) / ENERGY_RATE);
    const to = Math.min(
      samples.length,
      Math.floor(((frame + 1) * LEVEL_RATE) / ENERGY_RATE),
    );
    const level =
      ((powerDb(samples, from, to) - floor) / (ceiling - floor)) * 9;
    return String(Math.min(9, Math.max(0, Math.round(level))));
  }).join('');
}

const HEADER =
  '// Written by `pnpm measure:clip`; run it again rather than editing.';

function writeDigits(file: string, name: string, doc: string, all: string) {
  const lines = Array.from(
    { length: Math.ceil(all.length / LINE) },
    (_, n) => `  '${all.slice(n * LINE, (n + 1) * LINE)}',`,
  );
  fs.writeFileSync(
    path.join(SCORE, file),
    [
      HEADER,
      '',
      `/** ${doc} */`,
      `export const ${name} = [`,
      ...lines,
      "].join('');",
      '',
    ].join('\n'),
  );
  return `${file}: ${String(all.length)} frames`;
}

/** `items` packed into lines as Prettier fills them: as many as fit in 80 columns. */
function fill(items: readonly string[]): string[] {
  const lines: string[] = [];
  for (const item of items) {
    const last = lines.at(-1);
    if (last !== undefined && last.length + item.length + 2 <= 80) {
      lines[lines.length - 1] = `${last} ${item},`;
    } else lines.push(`  ${item},`);
  }
  return lines;
}

function writeTimes(file: string, name: string, doc: string, times: number[]) {
  fs.writeFileSync(
    path.join(SCORE, file),
    [
      HEADER,
      '',
      `/** ${doc} */`,
      `export const ${name}: readonly number[] = [`,
      // A trailing zero is what the linter's number rule strips.
      ...fill(times.map((time) => String(Number(time.toFixed(3))))),
      '];',
      '',
    ].join('\n'),
  );
  return `${file}: ${String(times.length)} onsets`;
}

const [song, vocals] = await Promise.all([songFile(), vocalsFile()]);
const reports = [
  writeDigits(
    'energy-data.ts',
    'ENERGY_DIGITS',
    'The mix’s loudness, one digit a frame at `ENERGY_RATE`, four seconds a line.',
    digits(decode(song, { samplingHz: LEVEL_RATE }), MIX),
  ),
  writeDigits(
    'voice-data.ts',
    'VOICE_DIGITS',
    'The vocal stem’s loudness from the master’s 0 s, one digit a frame at `ENERGY_RATE`, four seconds a line; it ends where the stem does.',
    digits(
      decode(vocals, { samplingHz: LEVEL_RATE, skip: VOCALS_LEAD }),
      VOICE,
    ),
  ),
  writeTimes(
    'kick-data.ts',
    'KICKS',
    'When the kick lands, in seconds.',
    onsets(decode(song, { samplingHz: ONSET_RATE }), KICK),
  ),
];
process.stdout.write(`${reports.join('\n')}\n`);
