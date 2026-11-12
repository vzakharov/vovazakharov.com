import type { Vec2 } from '../lib/vec';
import { f32, wgsl } from '../lib/wgsl';

/** The crest's height over the still sea, in metres. */
const CREST = 1.6;
/** How far the shore lies from the crest: east, west, and north or south. */
const EAST = 20;
const WEST = 70;
const ACROSS = 25;
/** The sea bed's floor, so the open sea has a depth and not an abyss. */
const DEEPEST = -40;

/**
 * The island's sand at `xz` in the world frame, in metres over the still sea,
 * negative under water. The crest stands at the frame's origin.
 */
export function islandHeight([x, z]: Vec2): number {
  const along = x / (x > 0 ? EAST : WEST);
  const across = z / ACROSS;
  return Math.max(CREST * (1 - along * along - across * across), DEEPEST);
}

/** `islandHeight(xz: vec2f) -> f32`, the twin of the function above. */
export const ISLAND_HEIGHT = wgsl(
  'outside/island-height',
  /* wgsl */ `
fn islandHeight(xz: vec2f) -> f32 {
  let along = xz.x / select(${f32(WEST)}, ${f32(EAST)}, xz.x > 0.0);
  let across = xz.y / ${f32(ACROSS)};
  return max(${f32(CREST)} * (1.0 - along * along - across * across), ${f32(DEEPEST)});
}
`,
);
