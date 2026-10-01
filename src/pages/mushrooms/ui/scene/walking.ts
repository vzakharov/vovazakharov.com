/**
 * What the eye's walk does to a frame beyond where it looks from: the feet
 * that land, each a footstep, and the bob, by the distance walked rather than
 * by time, so it keeps in step with the feet.
 */

import type { Bobbed } from '../../model/motion';
import { STEP_LENGTH, STRIDE_CRUISE } from '../../model/stride';
import { type Foot, footfalls } from './footsteps';

/** How far the bob moves the meadow down at most, as a share of the screen's height. */
export const BOB_SHARE = 0.004;

/**
 * How far up the camera scrolls, in CSS px, `walked` in the clump's size into
 * the visit on a screen `height` px tall, at `gait` of a walking pace: never
 * below zero, so the meadow only ever moves down and no strip under the land
 * shows, at its lowest each time a foot lands.
 */
export function bobAt(walked: number, height: number, gait: number): number {
  const swing = Math.abs(Math.sin((Math.PI * walked) / STEP_LENGTH));
  // `+ 0` so a still eye's bob is 0, never -0.
  return -BOB_SHARE * height * gait * swing + 0;
}

/**
 * How much of a walking pace `walked`, in the clump's size, over `seconds`
 * is, 0 to 1: the bob's share of its swing, so it dies away as the walk
 * eases to rest and stays at 0 standing still.
 */
export function gaitOf(walked: number, seconds: number): number {
  if (seconds <= 0) return 0;
  return Math.min(1, Math.abs(walked) / seconds / STRIDE_CRUISE);
}

/** A frame's walk: the feet landed since the last frame, and the camera's bob. */
export type Stepped = Bobbed & { feet: Foot[] };

/** The walk frame by frame (`step`), from the distance walked as of each frame. */
export class Gait {
  private walked: number | undefined;
  private at = 0;

  /** The feet that landed and the bob as the eye has walked `walked` in all by `now`, in seconds, on a screen `height` px tall. */
  step(walked: number, now: number, height: number): Stepped {
    const before = this.walked ?? walked;
    const gait = gaitOf(walked - before, now - this.at);
    this.walked = walked;
    this.at = now;
    return {
      feet: footfalls(before, walked),
      bob: bobAt(walked, height, gait),
    };
  }
}
