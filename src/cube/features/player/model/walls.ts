import { maze, mazeDoored, planted } from '@/cube/entities/world';

/** The planted world's maze. */
export const plantedMaze = maze(planted.seed);

/** The planted world's walls, and which of them are doors. */
export const plantedWalls = mazeDoored(plantedMaze);
