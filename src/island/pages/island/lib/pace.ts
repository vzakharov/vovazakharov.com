/** How long a change in a reading takes to show two-thirds of itself, ms. */
const SETTLE_MS = 500;

/**
 * `last` moved toward `value` by a frame `ms` long, smoothing over about
 * `SETTLE_MS`: each frame weighs by its own length, so the smoothing holds its
 * time span at any frame rate. None before the first frame takes `value` whole.
 */
function settled(last: number | undefined, value: number, ms: number): number {
  if (last === undefined) return value;
  return last + (value - last) * (1 - Math.exp(-ms / SETTLE_MS));
}

/** The frames the frame time is the mean of: one second at 60 fps. */
export const FRAME_WINDOW = 60;

/** What the diagnostics panel shows of the pace. */
type PaceShown = {
  /** Ms between drawn frames, the mean over the last `FRAME_WINDOW` of them. */
  readonly frameMs: number;
  /** Metres per second the eye's point in space moves, in a straight line, smoothed. */
  readonly speed: number;
};

/** The drawn frames' pace: how long a frame takes and how fast the eye goes. */
export type Pace = PaceShown & {
  /** Ms between each of the last `FRAME_WINDOW` frames, oldest first. */
  readonly recent: readonly number[];
  /** Frames drawn since the first. */
  readonly drawn: number;
};

/** What one drawn frame did: how long it took, and how far the eye moved in how much of its own time. */
type Frame = {
  /** Ms since the frame before. */
  readonly ms: number;
  /** Metres between the eye's point in space before the frame and after. */
  readonly metres: number;
  /** Seconds the eye stepped by, which a slow frame caps below `ms`. */
  readonly seconds: number;
};

/**
 * The pace after `frame`, given the last (none before the first frame). The
 * speed is the frame's displacement over the time the eye stepped, so a slow
 * frame does not read as a slow eye; a frame that stepped no time keeps it.
 */
export function paced(last: Pace | undefined, frame: Frame): Pace {
  const { ms, metres, seconds } = frame;
  const speed =
    seconds > 0
      ? settled(last?.speed, metres / seconds, ms)
      : (last?.speed ?? 0);
  const recent = [...(last?.recent ?? []), ms].slice(-FRAME_WINDOW);
  return {
    frameMs: recent.reduce((total, each) => total + each, 0) / recent.length,
    recent,
    drawn: (last?.drawn ?? 0) + 1,
    speed,
  };
}

const KMH_PER_MPS = 3.6;

/** A speed in m/s for a person: m/s with km/h beside it, or km/s from one km/s up. */
export function speedText(speed: number): string {
  if (speed >= 1000) return `${(speed / 1000).toFixed(1)} km/s`;
  return `${speed.toFixed(1)} m/s (${(speed * KMH_PER_MPS).toFixed(0)} km/h)`;
}

/** The pace's rows in the diagnostics panel. */
export const paceFields = ({ frameMs, speed }: PaceShown) => [
  `speed ${speedText(speed)}`,
  `frame ${frameMs.toFixed(1)} ms, ${(1000 / frameMs).toFixed(0)} fps (mean of ${String(FRAME_WINDOW)})`,
];
