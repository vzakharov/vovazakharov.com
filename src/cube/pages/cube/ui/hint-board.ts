import type { Polyline } from '@/cube/shared/lettering';
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

/** What a hint board says of the door beside it, a line to each entry. */
const SAYS = ['THIS DOOR', 'IS SPECIAL'] as const;

/** The arrow's length, in em, about a line's; its head is a capital tall. */
const ARROW_LONG = 7;

/** An arrow along a line of lettering, in em from its left end, pointing right or left. */
function arrow(pointsRight: boolean): Polyline[] {
  const [tail, tip, barb] = pointsRight
    ? [0, ARROW_LONG, ARROW_LONG - 0.6]
    : [ARROW_LONG, 0, 0.6];
  return [
    [
      [tail, 0.5],
      [tip, 0.5],
    ],
    [
      [barb, 1],
      [tip, 0.5],
      [barb, 0],
    ],
  ];
}

/**
 * A hint board on floor `n` as a canvas to upload: `SAYS` over an arrow at
 * the door, which is to its reader's right or left, in a sale sign's colours
 * turned over, light on dark, so the two never read as one.
 */
function drawHint(n: number, doorOnRight: boolean): OffscreenCanvas {
  const { board: light, price: dark } = signOf(n, false);
  const { canvas, ink, write } = letteredBoard(n, dark, light);
  for (const [row, line] of SAYS.entries()) {
    write(line, 50, light, 0.24 + 0.26 * row);
  }
  ink(arrow(doorOnRight), ARROW_LONG, 34, light, 0.8);
  return canvas;
}

/**
 * The hint boards `view` shows in the eye's frame at `pose`, their facets
 * packed by `paper`, one texture per floor and way the arrow points.
 */
export const hintBoards = (
  rolled: RolledMaze,
  pose: Pose,
  view: View,
  paper: (facets: readonly Facet[]) => Scenery,
): Boards[] =>
  [
    ...Map.groupBy(
      hintsSeen(rolled, view),
      ({ room, doorOnRight }) =>
        `hint/${String(room.n)}/${doorOnRight ? 'right' : 'left'}`,
    ),
  ].flatMap(([id, hints]) => {
    const [first] = hints;
    if (first === undefined) return [];
    const { room, doorOnRight } = first;
    return [
      {
        id,
        image: () => drawHint(room.n, doorOnRight),
        scenery: paper(
          hints.flatMap((hint) => hintFacets(hint, placed(pose, hint.room))),
        ),
      },
    ];
  });
