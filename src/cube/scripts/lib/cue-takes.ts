import type { Named } from '@/kernel/shared/typings';

/** The one-shot cues the sound bench listens to, each as it is mixed for a whole body. */
import { GROUNDS, LADDERS } from '@/cube/shared/lib/acoustics';
import { samplesOf, type SoundCue, voicedOf } from '@/cube/features/sound';
import { lineFor, utter, voiceOf } from '@/cube/features/voice';

const RATE = 48_000;

type Take = Named & { samples: Float32Array; takenAt: number };

const CUES: ReadonlyArray<readonly [string, SoundCue]> = [
  ['pill', { kind: 'pill' }],
  ['swallow', { kind: 'swallow' }],
  ['threshold', { kind: 'threshold' }],
  ...LADDERS.flatMap((ladder) =>
    (['hand', 'foot'] as const).map(
      (limb) =>
        [`rung-${ladder}-${limb}`, { kind: 'rung', limb, ladder }] as const,
    ),
  ),
  ...[0.15, 0.5, 1].map(
    (strength) =>
      [`splash-${String(strength)}`, { kind: 'splash', strength }] as const,
  ),
  ...GROUNDS.flatMap((footing) =>
    [0.4, 1].map(
      (strength) =>
        [
          `step-${footing}-${String(strength)}`,
          { kind: 'step', strength, footing },
        ] as const,
    ),
  ),
];

/** Every new cue at its mix level, three seeds each, and the waking groan. */
export function cueTakes(): Take[] {
  const cues = CUES.flatMap(([name, cue]) =>
    [1, 2, 3].map((seed) => {
      const { loudness } = voicedOf(cue, 1);
      return {
        name: `${name}-${String(seed)}`,
        samples: samplesOf(cue, 'tile', seed, RATE).map(
          (sample) => loudness * sample,
        ),
        takenAt: RATE,
      };
    }),
  );
  const groans = [1, 2, 3].map((grain) => ({
    name: `waking-${String(grain)}`,
    samples: utter(lineFor('waking', 1, grain), voiceOf('visitor', 1), 32_000),
    takenAt: 32_000,
  }));
  return [...cues, ...groans];
}
