import { maze, mazeWalls, planted, type Walls } from '@/cube/entities/world';

/** The planted world's walls. */
export const plantedWalls: Walls = mazeWalls(maze(planted.seed));
