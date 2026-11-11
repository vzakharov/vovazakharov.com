import { maze, mazeWalls, planted, type Walls } from '@/cube/entities/world';

/** The planted world's maze. */
export const plantedMaze = maze(planted.seed);

/** The planted world's walls. */
export const plantedWalls: Walls = mazeWalls(plantedMaze);
