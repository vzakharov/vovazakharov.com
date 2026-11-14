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

import { pick } from '@/kernel/shared/lib/collections';

import { pathHash } from '@/dice/shared/roll';

import { DOORWAY_BOX, WAKE_AT } from '@/cube/entities/island';
import {
  type Beds,
  bedsOf,
  gustAt,
  type Layer,
  type OutsideMix,
  outsideMix,
  perLayer,
  rendered,
  type Scene,
  SOUND_LAYERS,
  SOUNDING_ISLAND,
  surfAt,
  whole,
} from '@/cube/features/sound';

import { cueTakes } from './lib/cue-takes';
import { plotPicture, pngOf, spectrogramPicture } from './lib/picture';
import { type Scenes, scenesOf } from './lib/sound-scenes';
import {
  bandOver,
  decibels,
  following,
  levelOf,
  mean,
  type Spectrogram,
  spectrogramOf,
  standingOut,
} from './lib/spectrum';
import { stereoWavOf } from './lib/stereo-wav';

import { flag } from '@/kernel/scripts/lib/argv';

const RATE = 32_000;

/** Where the bench stands: under the cube, where the player wakes, at the ladder. */
const PLACES = {
  ...pick(SOUNDING_ISLAND, 'cube'),
  waking: [WAKE_AT[0], WAKE_AT[2]],
  ladder: [
    DOORWAY_BOX.min[0] + 0.8,
    (DOORWAY_BOX.min[2] + DOORWAY_BOX.max[2]) / 2,
  ],
} as const;

/** The mixer's own level, which everything heard goes through. */
const MASTER = 0.8;

/** The parts of the spectrum a scene is measured in, in hertz. */
const BANDS = {
  hum: [30, 320],
  roar: [60, 700],
  hiss: [2000, 9000],
  wind: [100, 4000],
  all: [25, 15_000],
} as const;

const fixed = (value: number, digits = 1): string => value.toFixed(digits);

const mid = (left: Float32Array, right: Float32Array): Float32Array =>
  left.map((sample, i) => (sample + (right[i] ?? 0)) / 2);

const amplified = (samples: Float32Array, by: number): Float32Array =>
  samples.map((sample) => by * sample);

const HUM_LAYERS: ReadonlySet<Layer> = new Set(['hum', 'under']);

/** `mix` with only the layers `keep` says, the rest silent. */
const kept = (
  mix: OutsideMix,
  keep: (layer: Layer) => boolean,
): OutsideMix => ({
  ...mix,
  layers: perLayer((layer) =>
    keep(layer) ? mix.layers[layer] : { leftEar: 0, rightEar: 0 },
  ),
});

/** One scene rendered, drawn and measured; returns its lines of the report. */
function take(
  out: string,
  name: string,
  { begins: from, seconds, mixAt, earAt, told }: Scenes[string],
  beds: Beds,
  scene: Scene,
): string[] {
  const [left, right] = rendered(beds, mixAt, from, seconds, RATE).map((ear) =>
    amplified(ear, MASTER),
  );
  if (left === undefined || right === undefined) return [];
  writeFileSync(path.join(out, `${name}.wav`), stereoWavOf(left, right, RATE));
  const heard = spectrogramOf(mid(left, right), RATE);
  writeFileSync(
    path.join(out, `${name}-spectrum.png`),
    pngOf(spectrogramPicture(heard, 1200, 420)),
  );

  // The hum by itself and everything else by itself: the mix is their sum.
  const alone = (keep: (layer: Layer) => boolean): Spectrogram =>
    spectrogramOf(
      amplified(
        rendered(beds, (t) => kept(mixAt(t), keep), from, seconds, RATE)[0],
        MASTER,
      ),
      RATE,
    );
  const clear = standingOut(
    alone((layer) => HUM_LAYERS.has(layer)),
    alone((layer) => !HUM_LAYERS.has(layer)),
    ...BANDS.hum,
  ).toSorted((a, b) => a - b);
  const lulls = clear.slice(Math.floor(0.75 * clear.length));

  const windLayers: ReadonlySet<Layer> = new Set(['wind', 'buffet']);
  const windOnly = bandOver(
    alone((layer) => windLayers.has(layer)),
    ...BANDS.wind,
  );
  const restOnly = bandOver(
    alone((layer) => !windLayers.has(layer)),
    ...BANDS.wind,
  );
  const windOver = decibels(mean(windOnly)) - decibels(mean(restOnly));

  const moments = heard.columns.map(
    (_, column) => from + column * heard.secondsPerColumn,
  );
  // The water where the ear is: the stretch of shore nearest it.
  const water = (part: 'breaking' | 'running' | 'draining'): number[] =>
    moments.map((t) => {
      const [x, z] = earAt(t);
      const [nearest] = scene.coast.shore.toSorted(
        (a, b) =>
          Math.hypot(a.shore[0] - x, a.shore[1] - z) -
          Math.hypot(b.shore[0] - x, b.shore[1] - z),
      );
      return nearest === undefined ? 0 : surfAt(scene.coast, nearest, t)[part];
    });
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
    `- the wind alone ${fixed(decibels(mean(windOnly)))} dBFS in its band, ${fixed(windOver)} dB against the rest of the mix`,
    `- the hum's clearest partial over its masker: ${fixed(mean(clear))} dB on average, ${fixed(mean(lulls))} dB in the quarter of the time it is clearest`,
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
    for (const { name, samples, takenAt: rate } of cueTakes()) {
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
    const scene = SOUNDING_ISLAND;
    const beds = bedsOf(pathHash('0'));
    for (const layer of SOUND_LAYERS)
      for (const loop of beds[layer]) whole(loop);
    report.push('', '# Scenes');
    const scenes = scenesOf(scene, PLACES);
    for (const [name, told] of Object.entries(scenes)) {
      if (only !== undefined && !only.split(',').includes(name)) continue;
      report.push('', ...take(out, name, told, beds, scene));
    }
    const again = (from: number) =>
      rendered(
        beds,
        (t) => outsideMix(scene, { at: [0, 20], gaze: 1 }, t),
        from,
        1,
        RATE,
      )[0];
    const [now, hourOn] = [again(100), again(3700)];
    let differs = 0;
    for (const [i, sample] of now.entries()) {
      differs = Math.max(differs, Math.abs(sample - (hourOn[i] ?? 0)));
    }
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
