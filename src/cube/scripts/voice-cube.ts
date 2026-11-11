/**
 * Writes what the cube's voices say as WAV files to listen to, with a
 * `manifest.json` beside them naming each file's set, floor, speaker and line
 * as written.
 *
 *   pnpm voice:cube                  # into tmp/cube-voice/
 *   pnpm voice:cube --out some/dir
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  lineFor,
  type Moment,
  type Speaker,
  utter,
  voiceOf,
  wavOf,
} from '@/cube/features/voice';

import { flag } from '@/kernel/scripts/lib/argv';

const RATE = 44_100;

/** One thing to hear per floor and moment: who says what, picked by which grain. */
const takes = (
  speaker: Speaker,
  moments: readonly Moment[],
  floors: readonly number[],
) =>
  floors.flatMap((floor) =>
    moments.map((moment, grain) => ({ speaker, moment, floor, grain })),
  );

/** The floors a set is heard on: the top, each change of tongue, the bottom. */
const DOWN = [1, 5, 9, 14, 19, 24, 32, 45, 55, 67] as const;

/**
 * The three sets: the visitor's wordless sounds as they tire; the building's
 * announcements as its English decays; and whoever else is somewhere in it.
 */
const SETS = {
  visitor: [
    ...takes('visitor', ['first-shrink'], [1]),
    ...takes('visitor', ['second-shrink'], [2]),
    ...takes('visitor', ['shrink', 'landing', 'mutter'], DOWN.slice(1)),
  ],
  building: takes('building', ['announcement', 'announcement'], DOWN),
  somewhere: takes('somewhere', ['hello', 'numbers', 'laugh', 'lullaby'], DOWN),
};

const padded = (n: number) => String(n).padStart(2, '0');

function main(): void {
  const out = flag('out') ?? 'tmp/cube-voice';
  mkdirSync(out, { recursive: true });
  const manifest = Object.entries(SETS).flatMap(([set, said]) =>
    said.map(({ speaker, moment, floor, grain }, n) => {
      const line = lineFor(moment, floor, grain);
      const file = `${set}-${padded(n + 1)}-floor-${padded(floor)}-${moment}.wav`;
      writeFileSync(
        path.join(out, file),
        wavOf(utter(line, voiceOf(speaker, floor), RATE), RATE),
      );
      return { file, set, floor, speaker, moment, line: line.text };
    }),
  );
  writeFileSync(
    path.join(out, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  process.stdout.write(`${String(manifest.length)} files in ${out}\n`);
}

main();
