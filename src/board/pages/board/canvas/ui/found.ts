import type { PlacedItem } from '@/board/entities/item';

import { byId } from '../lib/dom.ts';
import { matching } from '../lib/find.ts';
import type { Board } from '../model/board.ts';

export const freshIds = (items: readonly PlacedItem[]): string[] =>
  items.filter((item) => item.fresh === true).map((item) => item.id);

/**
 * The find box's matches marked on the world, the one it stands on apart, and
 * the toolbar's counts: run on every render, which rebuilds every node.
 * Returns the id of the match it stands on.
 */
export function markFound(
  board: Board,
  items: readonly PlacedItem[],
): string | undefined {
  const searching = board.finding.query.trim() !== '';
  const found = matching(items, board.finding.query);
  const at = Math.min(board.finding.match, found.length - 1);
  const marked = new Set(found);
  for (const node of board.world.querySelectorAll<HTMLElement>('[data-id]')) {
    const id = node.dataset['id'] ?? '';
    node.classList.toggle('found', marked.has(id));
    node.classList.toggle('current', id === found[at]);
  }
  document.body.classList.toggle('finding', searching);
  const count = byId('find-count');
  count.hidden = !searching;
  count.textContent =
    found.length === 0 ? 'none' : `${String(at + 1)}/${String(found.length)}`;
  const fresh = freshIds(items).length;
  const button = byId('tool-fresh');
  button.hidden = fresh === 0;
  button.textContent = `New ${String(fresh)}`;
  return found[at];
}
