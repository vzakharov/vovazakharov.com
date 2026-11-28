import type { Point } from '@/scene/shared/lib/plane';

import { fitTo, toWorld, union, zoomAt } from '../../camera/index.ts';
import type { Board } from '../model/board.ts';
import { placed, rectOf } from './view.ts';

/** `camera` onto the world; `pan` for a frame that only moves it. */
export function applyCamera(board: Board, pan = false): void {
  const { camera, lens, lift } = board;
  lens.style.transform = `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`;
  if (pan) lift.pan();
  else lift.rest();
}

type ScreenPointEvent = { clientX: number; clientY: number };

export function screenPoint(board: Board, event: ScreenPointEvent): Point {
  const box = board.stage.getBoundingClientRect();
  return { x: event.clientX - box.left, y: event.clientY - box.top };
}

function screenCentre(board: Board): Point {
  const box = board.stage.getBoundingClientRect();
  return { x: box.width / 2, y: box.height / 2 };
}

export const viewCentre = (board: Board): Point =>
  toWorld(board.camera, screenCentre(board));

export function fit(board: Board): void {
  const bounds = union(
    placed(board)
      .map((item) => rectOf(board, item.id))
      .filter((rect) => rect !== undefined),
  );
  const { width, height } = board.stage.getBoundingClientRect();
  board.camera =
    bounds === undefined
      ? { ...screenCentre(board), zoom: 1 }
      : fitTo(bounds, { x: 0, y: 0, width, height });
  applyCamera(board);
}

export function zoomBy(board: Board, factor: number): void {
  board.camera = zoomAt(board.camera, screenCentre(board), factor);
  applyCamera(board);
}
