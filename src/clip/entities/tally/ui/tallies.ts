import { at, noise, type Pen, type Place, reseed } from '@/clip/shared/ink';
import type { HandDrawn } from '@/clip/shared/lettering';

import {
  scratchedUpTo,
  tallyGrid,
  type TallyMark,
  type TallyWall,
} from '../model/grid';
import { TALLY_PALETTE } from './palette-tallies';

/** `progress` runs across the wall in reading order. */
export type Tallies = TallyWall & Place & HandDrawn;

// The last walls laid out, keyed on what shapes them: a scene asks for the
// same wall every frame, and laying one out is a pure function of its key.
const walls = new Map<string, readonly TallyMark[]>();
const WALLS_KEPT = 16;

function wallFor(wall: TallyWall): readonly TallyMark[] {
  const { width, height, seed, markHeight, bloodEvery, skipRate } = wall;
  const key = [width, height, seed, markHeight, bloodEvery, skipRate].join('|');
  const cached = walls.get(key);
  if (cached) return cached;
  if (walls.size >= WALLS_KEPT) walls.clear();
  const marks = tallyGrid(wall);
  walls.set(key, marks);
  return marks;
}

// Against a mark's height: the scratch's width and its gouge's.
const SCRATCH = 0.085;
const GOUGE = 0.022;
// How far a group shifts as the line boils, in stage units.
const BOIL = 0.8;

/**
 * A wall of tally marks scratched in by hand, groups of four struck through,
 * rows running past every edge; about one group in eight in dried blood.
 * Each colour is one path, so a full wall is three strokes.
 */
export function tallies(pen: Pen, wall: Tallies): void {
  const { ctx, boil } = pen;
  const { progress = 1, markHeight = 40, seed = 0 } = wall;
  const marks = wallFor(wall);
  const { whole, partial } = scratchedUpTo(marks.length, progress);
  const key = reseed(seed, boil);
  const scratch = new Path2D();
  const blood = new Path2D();
  for (const [n, { ends, group, blood: bloody }] of marks.entries()) {
    if (n > whole || (n === whole && partial === 0)) break;
    const share = n === whole ? partial : 1;
    const dx = noise(key, group * 2) * BOIL;
    const dy = noise(key, group * 2 + 1) * BOIL;
    const [[ax, ay], [bx, by]] = ends;
    const into = bloody ? blood : scratch;
    into.moveTo(ax + dx, ay + dy);
    into.lineTo(ax + (bx - ax) * share + dx, ay + (by - ay) * share + dy);
  }
  at(pen, wall, () => {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineWidth = markHeight * SCRATCH;
    ctx.strokeStyle = TALLY_PALETTE.scratch;
    ctx.stroke(scratch);
    ctx.strokeStyle = TALLY_PALETTE.blood;
    ctx.stroke(blood);
    ctx.lineWidth = markHeight * GOUGE;
    ctx.strokeStyle = TALLY_PALETTE.gouge;
    ctx.globalAlpha *= 0.3;
    ctx.stroke(scratch);
    ctx.restore();
  });
}
