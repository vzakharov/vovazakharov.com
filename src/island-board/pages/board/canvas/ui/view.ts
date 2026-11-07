import { pick } from '@/kernel/shared/lib/collections';

import type { Item, PlacedItem } from '@/island-board/entities/item';

import type { Rect } from '../../camera/index.ts';
import {
  type LineItem,
  markSelection,
  renderItems,
  renderLines,
} from '../../drawing/index.ts';
import type { Board } from '../model/board.ts';

export const visible = (board: Board): Item[] =>
  board.store.items().filter((item) => item.deleted !== true);

export const placed = (board: Board): PlacedItem[] =>
  visible(board).filter((item): item is PlacedItem => item.kind !== 'line');

export const find = (board: Board, id: string | undefined): Item | undefined =>
  board.store.items().find((item) => item.id === id);

export const nodeOf = (board: Board, id: string): HTMLElement | null =>
  board.world.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`);

export function rectOf(board: Board, id: string): Rect | undefined {
  const node = nodeOf(board, id);
  if (node === null) return undefined;
  return {
    x: node.offsetLeft,
    y: node.offsetTop,
    width: node.offsetWidth,
    height: node.offsetHeight,
  };
}

/** Selection marks and the colour picker, which follow `selected`. */
export function select(board: Board, id: string | undefined): void {
  board.selected = id;
  markSelection(board.stage, id, board.lineFrom);
  const target = find(board, id);
  board.colors.hidden =
    board.store.write === undefined ||
    (target?.kind !== 'sticky' && target?.kind !== 'zone');
}

async function resolveNames(
  board: Board,
  items: readonly Item[],
): Promise<void> {
  if (board.user === null) return;
  const ids = [...new Set(items.map((item) => item.author))].filter(
    (author) => author.startsWith('u_') && !(author in board.names),
  );
  if (ids.length === 0) return;
  const resolved = await board.user.profiles(ids);
  Object.assign(
    board.names,
    Object.fromEntries(ids.map((id) => [id, resolved[id]?.name ?? ''])),
  );
  render(board);
}

/** The whole world, rebuilt; held off while a text is being edited, and run on its blur. */
export function render(board: Board): void {
  if (board.editing !== undefined) return;
  const items = placed(board);
  renderItems(board.world, items, {
    editable: board.store.write !== undefined,
    ...pick(board, 'names'),
  });
  drawLines(board);
  resolveNames(board, items).catch(reportError);
}

/** The lines alone, re-run to the items' edges as they now stand. */
export function drawLines(board: Board): void {
  renderLines(
    board.lines,
    visible(board).filter((item): item is LineItem => item.kind === 'line'),
    (id) => rectOf(board, id),
  );
  select(board, board.selected);
}
