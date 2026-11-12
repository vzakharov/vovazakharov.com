import { clamp01 } from '@/cube/shared/lib/ease';
import type { Vec2 } from '@/cube/shared/lib/vec';

/**
 * The island and its sea as the ear needs them: the ground's height over the
 * still sea in metres, and the sea's slow surface there `seconds` into the
 * hour — the same two functions the picture is drawn from, which is what
 * makes a wave's sound and its sight one event.
 */
export type Sea = {
  islandHeight: (at: Vec2) => number;
  waterLevel: (at: Vec2, seconds: number) => number;
};

/**
 * One stretch of shore: where the still sea meets the sand, and where the
 * waves coming in to it break.
 */
export type Stretch = { shore: Vec2; breaks: Vec2 };

/** Metres between two looks along a line out from the island. */
const STRIDE = 0.5;

/** Metres from the island's middle past which there is no shore to find. */
const FARTHEST = 200;

/** The still depth, in metres, at which a wave of this sea breaks. */
const BREAK_DEPTH = 0.6;

/** Metres past the shore beyond which the break is not looked for. */
const BREAK_WITHIN = 25;

/** The point `metres` from a point along the bearing `turn`. */
const outFrom = ([x, z]: Vec2, turn: number, metres: number): Vec2 => [
  x + metres * Math.cos(turn),
  z + metres * Math.sin(turn),
];

/**
 * The shore of the island around `middle`, as `count` stretches evenly round
 * the compass: each found by walking out from the middle to where the ground
 * goes under the still sea, and on to where it is deep enough to break over.
 * A line that finds no shore gives no stretch.
 */
export function shoreOf(
  { islandHeight }: Sea,
  middle: Vec2,
  count = 16,
): Stretch[] {
  const stretches: Stretch[] = [];
  for (let n = 0; n < count; n += 1) {
    const turn = (2 * Math.PI * n) / count;
    let shore: number | undefined;
    let breaks: number | undefined;
    for (let metres = 0; metres <= FARTHEST; metres += STRIDE) {
      const height = islandHeight(outFrom(middle, turn, metres));
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
      stretches.push({
        shore: outFrom(middle, turn, shore),
        breaks: outFrom(middle, turn, breaks ?? shore),
      });
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

/** Metres a second the sea's surface is rising at `at`, `seconds` into the hour. */
const rising = (sea: Sea, at: Vec2, seconds: number): number =>
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

/**
 * How fast this sea's surface rises at its fastest, in metres a second: at
 * the shore, where that is a sheet running flat out, and over the bar, where
 * it is a wave breaking its hardest.
 */
export type Swing = { atShore: number; overBar: number };

/** The seconds of the hour a sea's swing is taken over, and between two looks. */
const SWING_OVER = 240;
const SWING_EVERY = 0.5;

/**
 * The swing of `sea` along `shore`, so that its biggest wave is the loudest
 * the surf gets whatever size the sea's waves are.
 */
export function swingOf(sea: Sea, shore: readonly Stretch[]): Swing {
  const swing = { atShore: 1e-6, overBar: 1e-6 };
  for (const stretch of shore) {
    for (let seconds = 0; seconds < SWING_OVER; seconds += SWING_EVERY) {
      swing.atShore = Math.max(
        swing.atShore,
        Math.abs(rising(sea, stretch.shore, seconds)),
      );
      swing.overBar = Math.max(
        swing.overBar,
        rising(sea, stretch.breaks, seconds),
      );
    }
  }
  return swing;
}

/** The sea, its shore and its swing: what the surf is read from. */
export type Coast = { sea: Sea; shore: readonly Stretch[]; swing: Swing };

export function coastOf(sea: Sea, middle: Vec2, count?: number): Coast {
  const shore = shoreOf(sea, middle, count);
  return { sea, shore, swing: swingOf(sea, shore) };
}

/** The surf at `stretch` at one instant, with no memory. */
function surfNow(
  { sea, swing }: Coast,
  stretch: Stretch,
  seconds: number,
): Surf {
  const atShore = rising(sea, stretch.shore, seconds) / swing.atShore;
  const overBar = rising(sea, stretch.breaks, seconds) / swing.overBar;
  return {
    breaking: clamp01(overBar) ** 2,
    running: clamp01(atShore),
    draining: clamp01(-atShore),
  };
}

/**
 * The surf at `stretch` of `coast`, `seconds` into the hour, read off the
 * sea's own surface: a wave breaks while the water over the bar climbs, its
 * sheet runs while the water at the shore climbs and drains while it falls.
 * A wave breaks all at once or hardly at all, so `breaking` is the rise
 * squared. Each sound starts with the water and dies away after it, which is
 * a look back over the last seconds of the same sea, so it is still a
 * function of the moment alone.
 */
export function surfAt(coast: Coast, stretch: Stretch, seconds: number): Surf {
  const surf = surfNow(coast, stretch, seconds);
  for (let look = 1; look <= LOOKS; look += 1) {
    const ago = look * LOOK_BACK;
    const then = surfNow(coast, stretch, seconds - ago);
    for (const part of ['breaking', 'running', 'draining'] as const) {
      surf[part] = Math.max(
        surf[part],
        then[part] * Math.exp((-3 * ago) / LINGERS[part]),
      );
    }
  }
  return surf;
}
