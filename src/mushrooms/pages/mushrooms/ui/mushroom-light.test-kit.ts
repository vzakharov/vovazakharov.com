import type { Point } from '@/scene/shared/lib/plane';

export const middleOf = (points: readonly Point[]) => ({
  x: points.reduce((sum, { x }) => sum + x, 0) / points.length,
  y: points.reduce((sum, { y }) => sum + y, 0) / points.length,
});
