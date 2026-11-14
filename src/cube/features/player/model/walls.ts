import {
  eastKind,
  isRoom,
  maze,
  mazeWalls,
  planted,
  southKind,
} from '@/cube/entities/world';

import type { Ways } from './door';

/** The planted world's maze. */
export const plantedMaze = maze(planted.seed);

/** The planted world's walls, and which of them are doors. */
export const plantedWalls: Ways = {
  ...mazeWalls(plantedMaze),
  isDoor: ({ n, x, y, isEast }) =>
    isRoom(n, x, y) &&
    (isEast ? isRoom(n, x + 1n, y) : isRoom(n, x, y + 1n)) &&
    (isEast ? eastKind : southKind)(plantedMaze, n, x, y) === 'door',
};
