import type { Exposed } from '@/cube/entities/theme';

import { firstFloorThrough } from './shader';

/** What the outside's lens is set to for one frame. */
export type OutsideLens = Exposed & {
  /** How far the eyelids are open: 0 shut, 1 wide. */
  eyelids: number;
  /**
   * How far the eye has become floor 1's: absent or 0, the outside's film at
   * `exposure`; 1, floor 1's own lens to the pixel, whatever `exposure` is;
   * between, the two mixed. An eye crossing the doorway runs it from one end
   * to the other, so the frame on either side of the switch is the same.
   */
  indoors?: number;
};

/**
 * The lens of an eye that has been outdoors a while: it puts sunlit sand in
 * the film's upper middle and leaves the sun's disc and its path on the
 * water to burn out.
 */
export const OUTSIDE_LENS: OutsideLens = { exposure: 0.3, eyelids: 1 };

/**
 * The lens an eye outdoors sees through: the scene and a little of its glow,
 * exposed, through the film's curve, mixed with what floor 1's lens makes of
 * the same scene, between eyelids — two soft-edged arcs closing from above
 * and below, the gap between them widest in the middle.
 */
const LENS = /* wgsl */ `
/// How far the film parts red from blue, as \`through\` takes it: a quarter
/// of a pixel at the frame's lower edge, where the outdoors is sparks and
/// grain a pixel wide that a wider parting would colour.
const FRINGE = 0.0005;

/// How much of the pixel at \`uv\` shows between eyelids \`open\` of the way open.
fn betweenLids(uv: vec2f, open: f32) -> f32 {
  let across = uv.x - 0.5;
  let gap = open * (0.76 - 0.9 * across * across);
  let soft = 0.02 + 0.14 * (1.0 - open);
  return 1.0 - smoothstep(gap - soft, gap + soft * 0.25, abs(uv.y - 0.5));
}

@fragment
fn lensFragment(@builtin(position) at: vec4f) -> @location(0) vec4f {
  let l = lensOf(at);
  let film = tonemap(through(l, 0.03, FRINGE) * uniforms.lens.x);
  let seen = mix(film, themeLens(l), uniforms.lens.z);
  return vec4f(seen * betweenLids(l.uv, uniforms.lens.y), 1.0);
}`;

/** The whole shader of the outside's lens. */
export const outsideLensSource = (): string => firstFloorThrough(LENS);
