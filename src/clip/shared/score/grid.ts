/**
 * The song's beat grid, measured from the master the page plays: a fixed
 * tempo, the first beat's time, and which beat opens the first bar. The grid
 * runs on before the first beat and past the last, so every time has a beat.
 */
export const GRID = {
  bpm: 117,
  /** When beat 0 lands, in seconds. */
  firstBeat: 0.232,
  /** The beat each bar opens on, counted from beat 0: the band enters on one. */
  downbeat: 2,
  beatsPerBar: 4,
} as const;

/** One beat, in seconds. */
export const BEAT = 60 / GRID.bpm;

/** One bar, in seconds. */
export const BAR = BEAT * GRID.beatsPerBar;

/** The beat number at `t`, with its fraction: 3.5 is half-way from beat 3 to beat 4. */
export const beatAt = (t: number): number => (t - GRID.firstBeat) / BEAT;

export const beatTime = (n: number): number => GRID.firstBeat + n * BEAT;

/** The bar number at `t`, with its fraction; bar 0 opens on `GRID.downbeat`. */
export const barAt = (t: number): number =>
  (beatAt(t) - GRID.downbeat) / GRID.beatsPerBar;

export const barTime = (n: number): number =>
  beatTime(GRID.downbeat + n * GRID.beatsPerBar);

// How near a beat, in beats, counts as on it.
const ON_BEAT = 1e-9;

/** Seconds since the last beat at or before `t`. */
export const sinceBeat = (t: number): number => {
  const beat = beatAt(t);
  // A time computed as a beat's own lands a rounding error short of it.
  const last = Math.floor(beat + ON_BEAT);
  return Math.max(0, beat - last) * BEAT;
};

/**
 * A flash on every beat: 1 on the beat, falling to `1/e` after `decay`
 * seconds, so a scene multiplies it into whatever should hit.
 */
export const pulse = (t: number, decay = 0.12): number =>
  Math.exp(-sinceBeat(t) / decay);
