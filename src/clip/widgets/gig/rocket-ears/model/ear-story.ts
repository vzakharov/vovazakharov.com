import type { Zooming } from '@/scene/shared/lib/plane';

import { lerp, mix, type Point } from '@/clip/shared/ink';
import { SECTIONS, SONG_SECONDS } from '@/clip/shared/score';

/**
 * One moment of the rocket ears' story: the audience's own clock reads
 * `flight` (0 is its `liftOff`), and the camera looks at `centre` of the
 * world at `zoom`.
 */
export type Moment = Zooming & { flight: number; centre: Point };

/** A moment the story passes `story` seconds into it. */
type Beat = Moment & { story: number };

/**
 * The story by its beats: the ears twitching in close-up; sparks and smoke at
 * their roots; lift-off over the heads; the climb into the dark, run slow;
 * the fireworks over the studio's roof. The world puts the audience's heads
 * near y 2300 and the bursts near y 200.
 */
const BEATS: readonly Beat[] = [
  { story: 0, flight: -5, centre: [480, 2130], zoom: 1.9 },
  { story: 3, flight: -2, centre: [520, 2110], zoom: 1.7 },
  { story: 5, flight: 0.5, centre: [470, 2060], zoom: 1.3 },
  { story: 7, flight: 1.7, centre: [480, 1900], zoom: 1 },
  { story: 8.5, flight: 2.3, centre: [480, 1380], zoom: 0.46 },
  { story: 10, flight: 3, centre: [480, 760], zoom: 0.5 },
  { story: 12, flight: 4.4, centre: [480, 250], zoom: 0.66 },
  { story: 14, flight: 6.3, centre: [480, 220], zoom: 0.62 },
];

/** The story's length in its own seconds: progress 1 is its end. */
export const STORY_SECONDS = 14;

/** The story at `seconds` into it, held at its first beat before 0 and its last after the end. */
export function momentAt(seconds: number): Moment {
  const story = Math.min(STORY_SECONDS, Math.max(0, seconds));
  const next = BEATS.findIndex((beat) => beat.story > story);
  const after = BEATS[next === -1 ? BEATS.length - 1 : next];
  const before = BEATS[next === -1 ? BEATS.length - 1 : next - 1];
  if (!before || !after) throw new Error('The story has no beats');
  const span = after.story - before.story;
  const k = span > 0 ? (story - before.story) / span : 0;
  return {
    flight: lerp(before.flight, after.flight, k),
    centre: mix(before.centre, after.centre, k),
    zoom: lerp(before.zoom, after.zoom, k),
  };
}

const section = (name: string) => {
  const found = SECTIONS.find((each) => each.name === name);
  if (!found) throw new Error(`No section named ${name}`);
  return found;
};

/**
 * How far along the story is at song time `t`, for a return that does not
 * say: it moves on through each section that cuts to it and holds between
 * them, so every return is further along than the last. Double time takes it
 * to the first ears leaving; the chorus through the lift-off, the bridge
 * through the climb, the breakdown through the bursts.
 */
const ALONG: ReadonlyArray<readonly [number, number]> = [
  [section('double time').from, 0],
  [section('double time').to, 0.44],
  [section('chorus').from, 0.44],
  [section('chorus').to, 0.66],
  [section('melodic bridge').from, 0.66],
  [section('melodic bridge').to, 0.8],
  [section('breakdown').from, 0.8],
  [SONG_SECONDS, 1],
];

export function progressAt(t: number): number {
  const next = ALONG.findIndex(([at]) => at > t);
  if (next === 0) return 0;
  const [from, start] = ALONG[next === -1 ? ALONG.length - 1 : next - 1] ?? [
    0, 0,
  ];
  const [to, end] = ALONG[next === -1 ? ALONG.length - 1 : next] ?? [0, 0];
  return to > from ? lerp(start, end, (t - from) / (to - from)) : start;
}
