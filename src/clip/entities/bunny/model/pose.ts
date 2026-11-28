import { clamp, mix, noise, type Point } from '@/clip/shared/ink';

/**
 * The bunny is drawn in its own units: its head's centre at the origin, the
 * head 170 wide, the feet at `FEET_Y`. At scale 1 it stands about 920 tall —
 * taller than the stage.
 */
export const FEET_Y = 600;

/**
 * What the arms do: hang to the knees, go up, reach out, hold something
 * before the belly, conduct, one paw beating time and the other hushing, or
 * hop, flung up at the top of each hop and down again on landing.
 */
export const ARMS = ['down', 'up', 'reach', 'hold', 'conduct', 'hop'] as const;
export type Arms = (typeof ARMS)[number];

/** Sewn-on buttons, or lit from inside. */
export const EYES = ['button', 'glow'] as const;
export type Eyes = (typeof EYES)[number];

/** The right shoulder; the left is its mirror. */
export const SHOULDER: Point = [58, 101];

/** The right elbow and paw for each pose; the left arm is their mirror. */
const ARM_JOINTS: Readonly<
  Record<Exclude<Arms, 'conduct' | 'hop'>, readonly [Point, Point]>
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
 * The elbow and paw of the arm on `side` (-1 left, 1 right) for `arms`.
 * `cue` is how far through its motion the pose is: the bar's beat when
 * conducting, how far the arms are flung up, 0 to 1, when hopping.
 */
export function armJoints(
  side: number,
  arms: Arms,
  cue: number,
): readonly [Point, Point] {
  if (arms === 'hop') {
    const [downElbow, downPaw] = ARM_JOINTS.down;
    const [upElbow, upPaw] = ARM_JOINTS.up;
    const [ex, ey] = mix(downElbow, upElbow, cue);
    const [px, py] = mix(downPaw, upPaw, cue);
    return [
      [side * ex, ey],
      [side * px, py],
    ];
  }
  if (arms === 'conduct') {
    if (side < 0) return HUSHING;
    const [px, py] = conductingPaw(cue);
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

/** A hopping bunny at one moment of its hop, in its own units. */
export type HopPose = {
  /** How high its feet are off the ground. */
  hopHeight: number;
  /** Its height against its own, squashed below 1 and stretched above. */
  stretch: number;
  /** How far its ears are swept out by the air, trailing the body's motion. */
  earSweep: number;
  /** How far its arms are flung up, 0 to 1. */
  armsUp: number;
};

// The share of a hop spent on the ground, landing then crouching to spring.
const GROUNDED = 0.2;
// A hop's height in the bunny's units, and how much the seed varies it.
const HOP_HEIGHT = 170;
const HOP_VARIES = 0.25;

/**
 * The hop `phase` of the way through, `phase` in `[0, 1)`: it lands at 0,
 * squashed flat, gathers itself, springs at `GROUNDED` stretched tall, and
 * comes down to land again at 1. Its ears trail the motion, swept out going
 * up and slammed down on landing; its arms fly up at the top. `seed` varies
 * the height and the give, so a row of hoppers never moves as one.
 */
export function hopAt(phase: number, seed = 0): HopPose {
  const p = phase - Math.floor(phase);
  const vary = 1 + noise(seed, 3) * HOP_VARIES;
  if (p < GROUNDED) {
    const g = p / GROUNDED;
    return {
      hopHeight: 0,
      stretch: 1 - 0.18 * vary * (1 - g) ** 2 + 0.12 * g ** 3,
      earSweep: 2 * vary * (1 - g) ** 2,
      armsUp: 0.2 * g,
    };
  }
  const u = (p - GROUNDED) / (1 - GROUNDED);
  const arc = 4 * u * (1 - u);
  return {
    hopHeight: HOP_HEIGHT * vary * arc,
    stretch:
      1 + 0.12 * Math.max(0, 1 - u / 0.3) + 0.08 * Math.max(0, (u - 0.8) / 0.2),
    earSweep: 1.6 * (1 - 2 * u),
    armsUp: 0.2 + 0.8 * arc ** 0.6,
  };
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

// The nearness past which the eyes light.
const LIT_FROM = 0.72;

/**
 * The bunny at `nearness` in `[0, 1]`: at 0 a polite thumbnail the size of a
 * wallpaper motif, mouth shut; at 1 big enough that its head fills the frame,
 * grin open, eyes lit. Scenes move it along this across the song.
 */
export function lookAt(nearness: number): BunnyLook {
  const near = clamp(nearness, 0, 1);
  return {
    bunnyScale: 0.12 + 2.5 * near ** 1.8,
    grin: near ** 1.5,
    eyes: near >= LIT_FROM ? 'glow' : 'button',
    aura: clamp((near - 0.5) / 0.5, 0, 1),
  };
}
