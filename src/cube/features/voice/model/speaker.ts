/** The hertz a loudspeaker in a ceiling lets through. */
const LOW = 380;
const HIGH = 3200;

/** How hard the speaker is driven: past 1 its cone flattens the peaks. */
const DRIVE = 2.2;

/** The room's answers to the speaker: seconds after, and how loud. */
const ECHOES = [
  [0.083, 0.34],
  [0.147, 0.22],
  [0.231, 0.13],
] as const;

/** Seconds the room goes on answering after the speaker stops. */
const RING = 0.45;

/** A one-pole filter's share of the way to its input each sample. */
const share = (hertz: number, sampleRate: number) =>
  1 - Math.exp((-2 * Math.PI * hertz) / sampleRate);

/**
 * `samples` as a ceiling loudspeaker gives them to a room: only the middle of
 * the band, twice over at each end, the peaks flattened, and the room's echoes
 * running `RING` seconds past the end.
 */
export function piped(samples: Float32Array, sampleRate: number): Float32Array {
  const out = new Float32Array(samples.length + Math.round(RING * sampleRate));
  const low = share(LOW, sampleRate);
  const high = share(HIGH, sampleRate);
  const lows = [0, 0];
  const highs = [0, 0];
  const narrowed = samples.map((sample) => {
    let kept = sample;
    for (const n of [0, 1]) {
      lows[n] = (lows[n] ?? 0) + low * (kept - (lows[n] ?? 0));
      kept -= lows[n] ?? 0;
      highs[n] = (highs[n] ?? 0) + high * (kept - (highs[n] ?? 0));
      kept = highs[n] ?? 0;
    }
    return kept;
  });
  let peak = 0;
  for (const sample of narrowed) peak = Math.max(peak, Math.abs(sample));
  if (peak === 0) return out;
  for (const [n, sample] of narrowed.entries()) {
    const driven = Math.tanh((DRIVE * sample) / peak);
    out[n] = (out[n] ?? 0) + driven;
    for (const [seconds, loud] of ECHOES) {
      const at = n + Math.round(seconds * sampleRate);
      out[at] = (out[at] ?? 0) + loud * driven;
    }
  }
  return out;
}

/** The two notes of the chime, in hertz at a voice pitched at `CHIME_AT`. */
const NOTES = [659.3, 523.3] as const;
const CHIME_AT = 150;

/** Seconds wholeBetween the chime's notes, each note's ring, and the hush after. */
const APART = 0.42;
const DECAY = 0.38;
const HUSH = 0.35;

/**
 * The two falling notes before an announcement, each a struck bar dying
 * away, tuned to the announcer: a low voice gets a low chime.
 */
export function chime(pitch: number, sampleRate: number): Float32Array {
  const seconds = APART * NOTES.length + DECAY + HUSH;
  const out = new Float32Array(Math.round(seconds * sampleRate));
  for (const [n, note] of NOTES.entries()) {
    const hertz = (note * pitch) / CHIME_AT;
    const from = Math.round(n * APART * sampleRate);
    for (let at = from; at < out.length; at += 1) {
      const since = (at - from) / sampleRate;
      const turn = 2 * Math.PI * hertz * since;
      const struck = Math.sin(turn) + 0.3 * Math.sin(2.76 * turn);
      out[at] = (out[at] ?? 0) + 0.5 * struck * Math.exp(-since / (DECAY / 3));
    }
  }
  return out;
}
