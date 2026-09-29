/**
 * What each insect sounds like taking wing: heard on its release and when a
 * tap sends it off, and then silent — no drone while it flies.
 */

import type { InsectKind } from '../../model/insect-genes';
import { PENTATONIC, tone, type Voice, type Voiced } from './synth';

/**
 * A butterfly taking wing: a soft trill of quick notes climbing the
 * pentatonic, each fluttering up a little as it sounds.
 */
const trill: Voice = (context, out) => {
  for (const [index, pitch] of PENTATONIC.slice(1).entries()) {
    const high = pitch * 2;
    tone(context, out, 'sine', [high, high * 1.06], 0.09, 0.05, index * 0.05);
    tone(context, out, 'triangle', [pitch, pitch], 0.07, 0.03, index * 0.05);
  }
};

/**
 * How a buzz sounds: its oscillator and pitch in Hz, how far and how fast
 * the pitch wavers, the filter that colours it, its wingbeat's tremolo of
 * loudness, how long it lasts and how loud it gets.
 */
type Buzz = Voiced & {
  pitch: number;
  waver: number;
  waverRate: number;
  filter: BiquadFilterType;
  cutoff: number;
  tremolo: number;
  duration: number;
};

/** A fly's thin rasp, wavering; a bee's lower, warmer hum. */
const BUZZES = {
  fly: {
    shape: 'sawtooth',
    pitch: 230,
    waver: 38,
    waverRate: 7,
    filter: 'highpass',
    cutoff: 900,
    tremolo: 0.5,
    duration: 0.45,
    peak: 0.13,
  },
  bee: {
    shape: 'triangle',
    pitch: 150,
    waver: 10,
    waverRate: 4,
    filter: 'lowpass',
    cutoff: 1100,
    tremolo: 0.25,
    duration: 0.55,
    peak: 0.3,
  },
} as const satisfies Record<Exclude<InsectKind, 'butterfly'>, Buzz>;

/** A buzz that swells in, wavers in pitch and loudness, and dies away. */
function buzz(sound: Buzz): Voice {
  return (context, out) => {
    const now = context.currentTime;
    const end = now + sound.duration;
    const wing = new OscillatorNode(context, {
      type: sound.shape,
      frequency: sound.pitch,
    });
    // A second, slightly sharp, beats against the first: a buzz, not a note.
    const beat = new OscillatorNode(context, {
      type: sound.shape,
      frequency: sound.pitch * 1.013,
    });
    const waver = new OscillatorNode(context, { frequency: sound.waverRate });
    const waverDepth = new GainNode(context, { gain: sound.waver });
    waver.connect(waverDepth);
    waverDepth.connect(wing.frequency);
    waverDepth.connect(beat.frequency);
    // Pitch sags a little as it goes, the way a buzz flies off.
    wing.frequency.setValueAtTime(sound.pitch, now);
    wing.frequency.linearRampToValueAtTime(sound.pitch * 0.9, end);
    const colour = new BiquadFilterNode(context, {
      type: sound.filter,
      frequency: sound.cutoff,
    });
    const envelope = new GainNode(context, { gain: 0 });
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(sound.peak, now + 0.04);
    envelope.gain.setValueAtTime(sound.peak, end - 0.18);
    envelope.gain.exponentialRampToValueAtTime(0.0001, end);
    const tremolo = new GainNode(context, { gain: 1 - sound.tremolo });
    const flap = new OscillatorNode(context, { frequency: 26 });
    const flapDepth = new GainNode(context, { gain: sound.tremolo });
    flap.connect(flapDepth).connect(tremolo.gain);
    wing.connect(colour);
    beat.connect(colour);
    colour.connect(tremolo).connect(envelope).connect(out);
    for (const oscillator of [wing, beat, waver, flap]) {
      oscillator.start(now);
      oscillator.stop(end + 0.05);
    }
  };
}

/** Each kind's voice taking wing. */
export const TAKE_OFF = {
  butterfly: trill,
  fly: buzz(BUZZES.fly),
  bee: buzz(BUZZES.bee),
} as const satisfies Record<InsectKind, Voice>;
