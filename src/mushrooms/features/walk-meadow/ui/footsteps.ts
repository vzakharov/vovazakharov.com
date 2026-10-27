import {
  brownNoise,
  envelopeAt,
  type Voice,
} from '@/mushrooms/shared/ui/index.node-safe';
import type { Foot } from '@/mushrooms/shared/world';

/** How far to each side a foot's step sounds. */
export const FOOT_PAN: Readonly<Record<Foot, number>> = {
  left: -0.3,
  right: 0.3,
};

/** A footstep's loudness, which a render sets well under a note's. */
const STEP_PEAK = 1.5;
/** How long a footstep sounds, in seconds. */
const STEP_LASTS = 0.06;

/**
 * A soft footfall in the grass: a breath of the breeze's brown noise through
 * a low filter, quick in and dying away.
 */
export const footstep: Voice = (context, out) => {
  const at = context.currentTime;
  const noise = new AudioBufferSourceNode(context, {
    buffer: brownNoise(context, STEP_LASTS + 0.02),
  });
  noise
    .connect(new BiquadFilterNode(context, { type: 'lowpass', frequency: 600 }))
    .connect(
      envelopeAt(context, at, {
        peak: STEP_PEAK,
        attack: 0.006,
        lasts: STEP_LASTS,
      }),
    )
    .connect(out);
  noise.start(at);
  noise.stop(at + STEP_LASTS + 0.02);
};
