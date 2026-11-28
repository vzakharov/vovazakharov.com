import type { Point } from '@/clip/shared/ink';

/**
 * The bunny is drawn in its own units: its head's centre at the origin, the
 * head 170 wide, the feet at `FEET_Y`. At scale 1 it stands about 920 tall —
 * taller than the stage.
 */
export const FEET_Y = 600;

/**
 * What the arms do: hang to the knees, go up, reach out, hold something
 * before the belly, or conduct, one paw beating time and the other hushing.
 */
export const ARMS = ['down', 'up', 'reach', 'hold', 'conduct'] as const;
export type Arms = (typeof ARMS)[number];

/** Sewn-on buttons, or lit from inside. */
export const EYES = ['button', 'glow'] as const;
export type Eyes = (typeof EYES)[number];

/** The right shoulder; the left is its mirror. */
export const SHOULDER: Point = [58, 101];

/** The right elbow and paw for each pose; the left arm is their mirror. */
const ARM_JOINTS: Readonly<
  Record<Exclude<Arms, 'conduct'>, readonly [Point, Point]>
> = {
  down: [
    [88, 250],
    [76, 410],
  ],
  up: [
    [124, 24],
    [150, -96],
  ],
  reach: [
    [156, 140],
    [262, 104],
  ],
  hold: [
    [128, 210],
    [96, 268],
  ],
};

// Where the conducting paw lands on each beat of a bar of four: down, in,
// out, up — the pattern a conductor's baton draws.
const DOWNBEAT: Point = [120, 200];
const BEATS: readonly Point[] = [DOWNBEAT, [20, 130], [240, 120], [150, -50]];

/**
 * The conducting paw `beat` of the way through a bar, `beat` in `[0, 1)`.
 * It eases into each beat and snaps out of it, so every beat lands.
 */
export function conductingPaw(beat: number): Point {
  const along = (beat - Math.floor(beat)) * BEATS.length;
  const n = Math.floor(along);
  const [ax, ay] = BEATS[n] ?? DOWNBEAT;
  const [bx, by] = BEATS[(n + 1) % BEATS.length] ?? DOWNBEAT;
  const ease = (along - n) ** 2;
  // A dip below the line between beats, as a baton bounces off each one.
  const dip = Math.sin((along - n) * Math.PI) * 30;
  return [ax + (bx - ax) * ease, ay + (by - ay) * ease + dip];
}

// The other paw while conducting: raised, palm out, keeping the players quiet.
const HUSHING: readonly [Point, Point] = [
  [-150, 170],
  [-170, 30],
];

/**
 * The elbow and paw of the arm on `side` (-1 left, 1 right) for `arms`, the
 * conducting paw `beat` of the way through its bar.
 */
export function armJoints(
  side: number,
  arms: Arms,
  beat: number,
): readonly [Point, Point] {
  if (arms === 'conduct') {
    if (side < 0) return HUSHING;
    const [px, py] = conductingPaw(beat);
    // The elbow hangs out and below the line from shoulder to paw.
    return [
      [(SHOULDER[0] + px) / 2 + 50, (SHOULDER[1] + py) / 2 + 60],
      [px, py],
    ];
  }
  const [[ex, ey], [px, py]] = ARM_JOINTS[arms];
  return [
    [side * ex, ey],
    [side * px, py],
  ];
}

/** Where a held thing's centre sits, between the paws of the `hold` pose. */
export const HELD_AT: Point = [0, 240];

/** How the bunny shows itself at a given nearness. */
export type BunnyLook = {
  /** Its size against its own units. */
  bunnyScale: number;
  /** How far the grin has opened, 0 to 1. */
  grin: number;
  eyes: Eyes;
  /** How strongly it glows, 0 to 1. */
  aura: number;
};

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

// The nearness past which the eyes light.
const LIT_FROM = 0.72;

/**
 * The bunny at `nearness` in `[0, 1]`: at 0 a polite thumbnail the size of a
 * wallpaper motif, mouth shut; at 1 big enough that its head fills the frame,
 * grin open, eyes lit. Scenes move it along this across the song.
 */
export function lookAt(nearness: number): BunnyLook {
  const near = clamp01(nearness);
  return {
    bunnyScale: 0.12 + 2.5 * near ** 1.8,
    grin: near ** 1.5,
    eyes: near >= LIT_FROM ? 'glow' : 'button',
    aura: clamp01((near - 0.5) / 0.5),
  };
}
