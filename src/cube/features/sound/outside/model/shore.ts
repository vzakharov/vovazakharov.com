import { clamp01 } from '@/cube/shared/lib/ease';

/** A point on the ground in the world's metres: x east, z south. */
export type OnGround = readonly [x: number, z: number];

/**
 * The island and its sea as the ear needs them: the ground's height over the
 * still sea in metres, and the sea's slow surface there `seconds` into the
 * hour — the same two functions the picture is drawn from, which is what
 * makes a wave's sound and its sight one event.
 */
export type Sea = {
  islandHeight: (at: OnGround) => number;
  waterLevel: (at: OnGround, seconds: number) => number;
};

/**
 * One stretch of shore: where the still sea meets the sand, and where the
 * waves coming in to it break.
 */
export type Stretch = { shore: OnGround; breaks: OnGround };

/** Metres between two looks along a line out from the island. */
const STRIDE = 0.5;

/** Metres from the island's middle past which there is no shore to find. */
const FARTHEST = 200;

/** The still depth, in metres, at which a wave of this sea breaks. */
const BREAK_DEPTH = 0.6;

/** Metres past the shore beyond which the break is not looked for. */
const BREAK_WITHIN = 25;

/**
 * The shore of the island around `middle`, as `count` stretches evenly round
 * the compass: each found by walking out from the middle to where the ground
 * goes under the still sea, and on to where it is deep enough to break over.
 * A line that finds no shore gives no stretch.
 */
export function shoreOf(
  { islandHeight }: Sea,
  middle: OnGround,
  count = 16,
): Stretch[] {
  const stretches: Stretch[] = [];
  for (let n = 0; n < count; n += 1) {
    const turn = (2 * Math.PI * n) / count;
    const out = (metres: number): OnGround => [
      middle[0] + metres * Math.cos(turn),
      middle[1] + metres * Math.sin(turn),
    ];
    let shore: number | undefined;
    let breaks: number | undefined;
    for (let metres = 0; metres <= FARTHEST; metres += STRIDE) {
      const height = islandHeight(out(metres));
      if (shore === undefined) {
        if (height <= 0 && metres > 0) shore = metres;
        continue;
      }
      if (height <= -BREAK_DEPTH || metres - shore >= BREAK_WITHIN) {
        breaks = metres;
        break;
      }
    }
    if (shore !== undefined) {
      stretches.push({ shore: out(shore), breaks: out(breaks ?? shore) });
    }
  }
  return stretches;
}

/**
 * What the water is doing at a stretch, each from 0 to 1: `breaking` over the
 * bar, `running` up the sand, `draining` back down it.
 */
export type Surf = { breaking: number; running: number; draining: number };

/** Seconds either side of now the water's rise is measured over. */
const SPAN = 0.12;

/** The rise at the shore, in metres a second, of a sheet running flat out. */
const RUN_RATE = 0.12;

/** The rise over the bar, in metres a second, of a wave breaking its hardest. */
const BREAK_RATE = 0.25;

/** Metres a second the sea's surface is rising at `at`, `seconds` into the hour. */
const rising = (sea: Sea, at: OnGround, seconds: number): number =>
  (sea.waterLevel(at, seconds + SPAN) - sea.waterLevel(at, seconds - SPAN)) /
  (2 * SPAN);

/**
 * How long each of the surf's sounds goes on after the water has stopped
 * doing what made it, in seconds: a broken wave's bore rolls in for a while,
 * a sheet that has stopped still hisses into the sand, and foam outlasts the
 * water that left it.
 */
const LINGERS: Record<keyof Surf, number> = {
  breaking: 1.6,
  running: 0.5,
  draining: 1.8,
};

/** Seconds between two looks back, and how many are taken. */
const LOOK_BACK = 0.2;
const LOOKS = 10;

/** The surf at `stretch` at one instant, with no memory. */
function surfNow(sea: Sea, stretch: Stretch, seconds: number): Surf {
  const atShore = rising(sea, stretch.shore, seconds) / RUN_RATE;
  const overBar = rising(sea, stretch.breaks, seconds) / BREAK_RATE;
  return {
    breaking: clamp01(overBar) ** 2,
    running: clamp01(atShore),
    draining: clamp01(-atShore),
  };
}

/**
 * The surf at `stretch`, `seconds` into the hour, read off the sea's own
 * surface: a wave breaks while the water over the bar climbs, its sheet runs
 * while the water at the shore climbs and drains while it falls. A wave
 * breaks all at once or hardly at all, so `breaking` is the rise squared.
 * Each sound starts with the water and dies away after it, which is a look
 * back over the last seconds of the same sea, so it is still a function of
 * the moment alone.
 */
export function surfAt(sea: Sea, stretch: Stretch, seconds: number): Surf {
  const surf = surfNow(sea, stretch, seconds);
  for (let look = 1; look <= LOOKS; look += 1) {
    const ago = look * LOOK_BACK;
    const then = surfNow(sea, stretch, seconds - ago);
    for (const part of ['breaking', 'running', 'draining'] as const) {
      surf[part] = Math.max(
        surf[part],
        then[part] * Math.exp((-3 * ago) / LINGERS[part]),
      );
    }
  }
  return surf;
}
