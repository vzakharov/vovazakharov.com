import { STICKY_COLORS } from '@/board/entities/item';

import { byId } from '../lib/dom.ts';
import type { Board } from '../model/board.ts';
import {
  addImage,
  addSticky,
  addText,
  addZone,
  recolor,
  remove,
  setLineTool,
} from './actions.ts';
import { drawLines, select } from './view.ts';
import { applyCamera, fit, viewCentre, zoomBy } from './viewport.ts';

const onClick = (id: string, handler: () => void): void => {
  byId(id).addEventListener('click', handler);
};

function wireToolbar(board: Board): void {
  onClick('tool-fit', () => {
    fit(board);
  });
  onClick('tool-in', () => {
    zoomBy(board, 1.25);
  });
  onClick('tool-out', () => {
    zoomBy(board, 0.8);
  });
  onClick('tool-sticky', () => {
    addSticky(board, viewCentre(board));
  });
  onClick('tool-text', () => {
    addText(board);
  });
  onClick('tool-zone', () => {
    addZone(board);
  });
  onClick('tool-line', () => {
    setLineTool(board, !board.lineTool);
  });
  onClick('tool-delete', () => {
    if (board.selected !== undefined) remove(board, board.selected);
  });
  onClick('tool-image', () => {
    board.picker.click();
  });
  board.picker.addEventListener('change', () => {
    const file = board.picker.files?.[0];
    board.picker.value = '';
    if (file !== undefined) addImage(board, file).catch(reportError);
  });
  for (const color of STICKY_COLORS) {
    const swatch = document.createElement('button');
    swatch.className = `swatch c-${color}`;
    swatch.title = color;
    swatch.addEventListener('click', () => {
      recolor(board, color);
    });
    board.colors.append(swatch);
  }
}

/** The toolbar and swatches, the keys, pasting an image, and the window's resize. */
export function wireControls(board: Board): void {
  wireToolbar(board);

  document.addEventListener('keydown', (event) => {
    if (board.editing !== undefined) {
      if (event.key === 'Escape') board.editing.blur();
      return;
    }
    if (
      (event.key === 'Delete' || event.key === 'Backspace') &&
      board.selected !== undefined &&
      board.store.write !== undefined
    )
      remove(board, board.selected);
    if (event.key === 'Escape') {
      setLineTool(board, false);
      select(board, undefined);
    }
  });

  document.addEventListener('paste', (event) => {
    if (board.editing !== undefined) return;
    const file = [...(event.clipboardData?.files ?? [])].find((candidate) =>
      candidate.type.startsWith('image/'),
    );
    if (file === undefined) return;
    event.preventDefault();
    addImage(board, file).catch(reportError);
  });

  // A face arriving late resizes the items it sets, so the lines are re-run to their new edges.
  document.fonts.addEventListener('loadingdone', () => {
    drawLines(board);
  });
  window.addEventListener('resize', () => {
    applyCamera(board);
  });
}
