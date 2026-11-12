/**
 * The sound's test bench: renders what the cube's outside sounds like, and the
 * one-shot cues, to files a person can listen to and pictures and numbers an
 * agent can check — a stereo WAV and a spectrogram for every scene and cue, a
 * plot of each scene's loudness against what the water is doing, and a
 * report of levels printed and written beside them.
 *
 *   pnpm sound:cube                  # into tmp/cube-sound/
 *   pnpm sound:cube --out some/dir
 *   pnpm sound:cube --only waking    # one scene, or `cues`
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { pathHash } from '@/dice/shared/roll';

import {
  type Beds,
  bedsOf,
  gustAt,
  LAYERS,
  type OutsideMix,
  outsideMix,
  rendered,
  type Scene,
  shoreOf,
  surfAt,
  whole,
} from '@/cube/features/sound';

import { flag } from '@/kernel/scripts/lib/argv';

import { cueTakes } from './lib/cue-takes';
import { plotPicture, pngOf, spectrogramPicture } from './lib/picture';
import { type Scenes, scenesOf } from './lib/sound-scenes';
import {
  bandOver,
  decibels,
  following,
  levelOf,
  mean,
  spectrogramOf,
} from './lib/spectrum';
import { STAND_IN_PLACES, STAND_IN_SEA } from './lib/stand-in-sea';
import { stereoWavOf } from './lib/stereo-wav';

const RATE = 32_000;

/** The mixer's own level, which everything heard goes through. */
const MASTER = 0.8;

/** The parts of the spectrum a scene is measured in, in hertz. */
const BANDS = {
  hum: [30, 320],
  roar: [60, 700],
  hiss: [2000, 9000],
  all: [25, 15_000],
} as const;

const fixed = (value: number, digits = 1): string => value.toFixed(digits);

const mid = (left: Float32Array, right: Float32Array): Float32Array =>
  left.map((sample, i) => (sample + (right[i] ?? 0)) / 2);

const scaled = (samples: Float32Array, by: number): Float32Array =>
  samples.map((sample) => by * sample);

/** `mix` with the cube's hum taken out: what is left is what masks it. */
const humless = (mix: OutsideMix): OutsideMix => ({
  ...mix,
  layers: {
    ...mix.layers,
    hum: { left: 0, right: 0 },
    under: { left: 0, right: 0 },
  },
});

/** One scene rendered, drawn and measured; returns its lines of the report. */
function take(
  out: string,
  name: string,
  { from, seconds, mixAt, told }: Scenes[string],
  beds: Beds,
  scene: Scene,
): string[] {
  const [left, right] = rendered(beds, mixAt, from, seconds, RATE).map((ear) =>
    scaled(ear, MASTER),
  );
  if (left === undefined || right === undefined) return [];
  writeFileSync(path.join(out, `${name}.wav`), stereoWavOf(left, right, RATE));
  const heard = spectrogramOf(mid(left, right), RATE);
  writeFileSync(
    path.join(out, `${name}-spectrum.png`),
    pngOf(spectrogramPicture(heard, 1200, 420)),
  );

  const [bare] = rendered(beds, (t) => humless(mixAt(t)), from, seconds, RATE);
  const masker = spectrogramOf(scaled(bare ?? left, MASTER), RATE);
  const humBand = mean(bandOver(spectrogramOf(left, RATE), ...BANDS.hum));
  const maskBand = mean(bandOver(masker, ...BANDS.hum));

  const moments = heard.columns.map(
    (_, column) => from + column * heard.secondsPerColumn,
  );
  const water = (part: 'breaking' | 'running' | 'draining'): number[] =>
    moments.map((t) =>
      mean(scene.shore.map((stretch) => surfAt(scene.sea, stretch, t)[part])),
    );
  const roar = bandOver(heard, ...BANDS.roar);
  const hiss = bandOver(heard, ...BANDS.hiss);
  writeFileSync(
    path.join(out, `${name}-levels.png`),
    pngOf(
      plotPicture(
        [
          { values: roar.map((p) => decibels(p)), colour: [230, 120, 60] },
          { values: water('breaking'), colour: [120, 60, 30] },
          { values: hiss.map((p) => decibels(p)), colour: [120, 200, 255] },
          { values: water('running'), colour: [50, 90, 140] },
          { values: moments.map((t) => gustAt(t)), colour: [90, 160, 90] },
        ],
        1200,
        360,
      ),
    ),
  );
  const within = Math.round(1.5 / heard.secondsPerColumn);
  const broke = following(roar, water('breaking'), within);
  const ran = following(hiss, water('running'), within);
  const late = (steps: number): string =>
    `${fixed(steps * heard.secondsPerColumn, 2)} s late`;
  const all = levelOf(mid(left, right));
  return [
    `## ${name} — ${told}`,
    `- level ${fixed(all.rms)} dBFS rms, peak ${fixed(all.peak)}; left ${fixed(levelOf(left).rms)}, right ${fixed(levelOf(right).rms)}`,
    `- by band, mean dBFS: ${Object.entries(BANDS)
      .map(
        ([band, [low, high]]) =>
          `${band} ${fixed(decibels(mean(bandOver(heard, low, high))))}`,
      )
      .join(', ')}`,
    `- the hum's band with the hum over without it: ${fixed(decibels(humBand) - decibels(maskBand))} dB`,
    `- roar follows the water breaking: fit ${fixed(broke.fit, 2)}, ${late(broke.late)}`,
    `- hiss follows the water running up: fit ${fixed(ran.fit, 2)}, ${late(ran.late)}`,
  ];
}

function main(): void {
  const out = flag('out') ?? 'tmp/cube-sound';
  const only = flag('only');
  mkdirSync(out, { recursive: true });
  const report: string[] = [];

  if (only === undefined || only === 'cues') {
    report.push('# Cues');
    for (const { name, samples, rate } of cueTakes()) {
      writeFileSync(
        path.join(out, `cue-${name}.wav`),
        stereoWavOf(samples, samples, rate),
      );
      writeFileSync(
        path.join(out, `cue-${name}-spectrum.png`),
        pngOf(spectrogramPicture(spectrogramOf(samples, rate), 600, 300, -10)),
      );
      const { rms, peak } = levelOf(samples);
      report.push(
        `- ${name}: ${fixed(samples.length / rate, 2)} s, ${fixed(rms)} dBFS rms, peak ${fixed(peak)}`,
      );
    }
  }

  if (only !== 'cues') {
    const sea = STAND_IN_SEA;
    const scene: Scene = {
      sea,
      shore: shoreOf(sea, [0, 0], 32),
      cube: STAND_IN_PLACES.cube,
    };
    const beds = bedsOf(pathHash('0'));
    for (const layer of LAYERS) for (const loop of beds[layer]) whole(loop);
    report.push('', '# Scenes');
    const scenes = scenesOf(scene, STAND_IN_PLACES);
    for (const [name, told] of Object.entries(scenes)) {
      if (only !== undefined && only !== name) continue;
      report.push('', ...take(out, name, told, beds, scene));
    }
    const again = (from: number) =>
      rendered(
        beds,
        (t) => outsideMix(scene, { at: [0, 20], yaw: 1 }, t),
        from,
        1,
        RATE,
      )[0];
    const [now, hourOn] = [again(100), again(3700)];
    const differs = now.reduce(
      (most, sample, i) => Math.max(most, Math.abs(sample - (hourOn[i] ?? 0))),
      0,
    );
    report.push(
      '',
      `# The hour`,
      `- a second heard at 100 s and at 3700 s differ by at most ${differs.toExponential(1)}`,
    );
  }

  const text = `${report.join('\n')}\n`;
  writeFileSync(path.join(out, 'report.md'), text);
  process.stdout.write(text);
}

main();
