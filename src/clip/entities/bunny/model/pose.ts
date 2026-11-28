import type { Point } from '@/clip/shared/ink';

/**
 * The bunny is drawn in its own units: its head's centre at the origin, the
 * head 170 wide, the feet at `FEET_Y`. At scale 1 it stands about 920 tall —
 * taller than the stage.
 */
export const FEET_Y = 600;

/** What the arms do: hang to the knees, go up, reach out, or hold something before the belly. */
export const ARMS = ['down', 'up', 'reach', 'hold'] as const;
export type Arms = (typeof ARMS)[number];

/** Sewn-on buttons, or lit from inside. */
export const EYES = ['button', 'glow'] as const;
export type Eyes = (typeof EYES)[number];

/** The right shoulder; the left is its mirror. */
export const SHOULDER: Point = [58, 101];

/** The right elbow and paw for each pose; the left arm is their mirror. */
export const ARM_JOINTS: Readonly<Record<Arms, readonly [Point, Point]>> = {
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
