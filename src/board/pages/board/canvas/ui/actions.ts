import type { Point } from '@/scene/shared/lib/plane';

import type { Item, STICKY_COLORS } from '@/board/entities/item';

import { EDITABLE_FIELD } from '../../drawing/index.ts';
import { errorCode } from '../api/runtime.ts';
import { byId, newId } from '../lib/dom.ts';
import type { Board } from '../model/board.ts';
import { showStatus } from './status.ts';
import { find, nodeOf, render, select, visible } from './view.ts';
import { viewCentre } from './viewport.ts';

type StickyColor = (typeof STICKY_COLORS)[number];

export function startEditing(board: Board, id: string): void {
  const node = nodeOf(board, id)?.querySelector<HTMLElement>('[data-edit]');
  const item = find(board, id);
  if (
    node === null ||
    node === undefined ||
    item === undefined ||
    item.kind === 'line' ||
    board.store.write === undefined
  )
    return;
  const field = EDITABLE_FIELD[item.kind];
  board.editing = node;
  node.contentEditable = 'plaintext-only';
  node.focus();
  const range = document.createRange();
  range.selectNodeContents(node);
  document.getSelection()?.removeAllRanges();
  document.getSelection()?.addRange(range);
  node.addEventListener(
    'blur',
    () => {
      board.editing = undefined;
      const text = node.textContent.replace(/\n$/, '');
      const current = find(board, id);
      if (current?.kind === item.kind && Reflect.get(current, field) !== text)
        board.store.write?.({ ...current, [field]: text });
      render(board);
    },
    { once: true },
  );
}

/** A new item's own stamp, which `write` replaces with the viewer's. */
const draft = { updated: new Date(0).toISOString(), author: 'agent:draft' };

function add(board: Board, item: Item, edit: boolean): void {
  board.store.write?.(item);
  select(board, item.id);
  if (edit) startEditing(board, item.id);
}

export function addSticky(board: Board, at: Point): void {
  add(
    board,
    {
      ...draft,
      kind: 'sticky',
      id: newId('s'),
      x: at.x - 100,
      y: at.y - 40,
      text: '',
      color: 'yellow',
      w: 200,
    },
    true,
  );
}

export function addText(board: Board): void {
  const at = viewCentre(board);
  add(
    board,
    {
      ...draft,
      kind: 'text',
      id: newId('t'),
      x: at.x - 150,
      y: at.y - 20,
      text: 'Heading',
      size: 'h2',
      w: 300,
    },
    true,
  );
}

export function addZone(board: Board): void {
  const at = viewCentre(board);
  add(
    board,
    {
      ...draft,
      kind: 'zone',
      id: newId('z'),
      x: at.x - 400,
      y: at.y - 250,
      title: 'Zone',
      w: 800,
      h: 500,
    },
    true,
  );
}

export async function addImage(board: Board, file: Blob): Promise<void> {
  const { assets } = board;
  if (assets === null) return;
  const centre = viewCentre(board);
  try {
    const { id } = await assets.upload(file);
    add(
      board,
      {
        ...draft,
        kind: 'image',
        id: newId('i'),
        x: centre.x - 180,
        y: centre.y - 120,
        src: `/_blob/${id}`,
        w: 360,
      },
      false,
    );
  } catch (error) {
    showStatus(board.status, {
      kind: 'error',
      message: `Upload failed: ${errorCode(error)}`,
    });
  }
}

export function remove(board: Board, id: string): void {
  const item = find(board, id);
  if (item === undefined) return;
  board.store.write?.({ ...item, deleted: true });
  for (const line of visible(board))
    if (line.kind === 'line' && (line.from === id || line.to === id))
      board.store.write?.({ ...line, deleted: true });
  select(board, undefined);
}

export function recolor(board: Board, color: StickyColor): void {
  const item = find(board, board.selected);
  if (item?.kind === 'sticky' || item?.kind === 'zone')
    board.store.write?.({ ...item, color });
}

export function setLineTool(board: Board, on: boolean): void {
  board.lineTool = on;
  board.lineFrom = undefined;
  byId('tool-line').classList.toggle('active', on);
  document.body.classList.toggle('line-tool', on);
}

/** One end of a line picked; the second end creates it. */
export function pickLineEnd(board: Board, id: string): void {
  if (board.lineFrom === undefined) board.lineFrom = id;
  else if (board.lineFrom !== id) {
    add(
      board,
      { ...draft, kind: 'line', id: newId('l'), from: board.lineFrom, to: id },
      false,
    );
    setLineTool(board, false);
  }
  select(board, board.selected);
}
