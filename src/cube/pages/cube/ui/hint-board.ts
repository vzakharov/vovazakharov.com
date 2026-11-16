import {
  type Facet,
  hintFacets,
  hintsSeen,
  placed,
  type Pose,
  type RolledMaze,
  type View,
} from '@/cube/entities/world';

import type { Scenery } from '../lib/mesh';
import { signOf } from '../lib/palette';
import { letteredBoard } from './board-canvas';
import type { Boards } from './board-textures';

/** What a hint board says of the doors of its floor, a line to each entry. */
const SAYS = ['SOME DOORS ARE', 'MORE EQUAL', 'THAN OTHERS'] as const;

/** The texture's height in pixels: a sheet of A4 on its side, 512 wide. */
const SHEET_TALL = 362;

/**
 * A hint board on floor `n` as a canvas to upload: `SAYS` in a sale sign's
 * colours turned over, light on dark, so the two never read as one.
 */
function drawHint(n: number): OffscreenCanvas {
  const { board: light, price: dark } = signOf(n, false);
  const { canvas, write } = letteredBoard(n, dark, light, SHEET_TALL);
  for (const [row, line] of SAYS.entries()) {
    write(line, 33, light, 0.26 + 0.24 * row);
  }
  return canvas;
}

/**
 * The hint boards `view` shows in the eye's frame at `pose`, their facets
 * packed by `paper` under one texture: they hang on one floor.
 */
export function hintBoards(
  rolled: RolledMaze,
  pose: Pose,
  view: View,
  paper: (facets: readonly Facet[]) => Scenery,
): Boards[] {
  const hints = hintsSeen(rolled, view);
  const [first] = hints;
  if (first === undefined) return [];
  const { n } = first.room;
  return [
    {
      id: `hint/${String(n)}`,
      image: () => drawHint(n),
      scenery: paper(
        hints.flatMap((hint) => hintFacets(hint, placed(pose, hint.room))),
      ),
    },
  ];
}
