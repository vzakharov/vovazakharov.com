import { byId, required } from '../lib/dom.ts';
import { matching, stepped } from '../lib/find.ts';
import type { Board } from '../model/board.ts';
import { freshIds, markFound } from './found.ts';
import { placed } from './view.ts';
import { focus } from './viewport.ts';

/** The find box's matches redrawn, and the camera on the one it stands on. */
function showMatch(board: Board): void {
  const id = markFound(board, placed(board));
  if (id !== undefined) focus(board, id);
}

function search(board: Board, query: string): void {
  board.finding.query = query;
  board.finding.match = 0;
  showMatch(board);
}

function step(board: Board, delta: number): void {
  const { query, match } = board.finding;
  const count = matching(placed(board), query).length;
  board.finding.match = stepped(match, delta, count);
  showMatch(board);
}

/** The next fresh item, round and round. */
function nextFresh(board: Board): void {
  const fresh = freshIds(placed(board));
  const at = stepped(board.finding.nextFresh, 0, fresh.length);
  const id = fresh[at];
  if (id !== undefined) focus(board, id);
  board.finding.nextFresh = stepped(at, 1, fresh.length);
}

/** The find box (Ctrl/⌘+F, Enter and Shift+Enter, Escape) and the New button. */
export function wireFind(board: Board): void {
  const input = required(
    document.querySelector<HTMLInputElement>('#find-text'),
    '#find-text',
  );
  input.addEventListener('input', () => {
    search(board, input.value);
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      step(board, event.shiftKey ? -1 : 1);
    }
    if (event.key === 'Escape') {
      input.value = '';
      search(board, '');
      input.blur();
    }
  });
  byId('find-next').addEventListener('click', () => {
    step(board, 1);
  });
  byId('find-prev').addEventListener('click', () => {
    step(board, -1);
  });
  byId('tool-fresh').addEventListener('click', () => {
    nextFresh(board);
  });
  // The browser's own find matches text but cannot move the camera to it.
  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
      event.preventDefault();
      input.focus();
      input.select();
    }
  });
}
