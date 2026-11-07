/**
 * Pointer gestures on the stage: pan by dragging the background or scrolling,
 * zoom with ctrl or a pinch, drag an item to move it or its corner to resize
 * it, double-click to add a sticky or edit a text.
 */
import { pick } from '@/kernel/shared/lib/collections';
import type { Distant } from '@/kernel/shared/typings';

import type { Centred, Point, Zoomed } from '@/scene/shared/lib/plane';

import { toWorld, zoomAt } from '../../camera/index.ts';
import { itemIdAt } from '../lib/dom.ts';
import type { Board, WithCamera } from '../model/board.ts';
import { addSticky, pickLineEnd, startEditing } from './actions.ts';
import { find, nodeOf, select } from './view.ts';
import { applyCamera, screenPoint } from './viewport.ts';

type Drag =
  | { kind: 'pan'; start: Point; camera: Zoomed }
  | {
      kind: 'move';
      id: string;
      start: Point;
      origin: Point;
      node: HTMLElement;
      moved: boolean;
    }
  | {
      kind: 'resize';
      id: string;
      start: Point;
      w: number;
      h: number;
      node: HTMLElement;
    };

type Pinch = Distant & WithCamera & Centred;

const distance = (a: Point, b: Point): number =>
  Math.hypot(a.x - b.x, a.y - b.y);

function dragged(board: Board, drag: Drag, point: Point): void {
  const dx = point.x - drag.start.x;
  const dy = point.y - drag.start.y;
  const { zoom } = board.camera;
  if (drag.kind === 'pan') {
    board.camera = {
      ...drag.camera,
      x: drag.camera.x + dx,
      y: drag.camera.y + dy,
    };
    applyCamera(board, true);
  } else if (drag.kind === 'move') {
    if (Math.hypot(dx, dy) > 3) drag.moved = true;
    drag.node.style.left = `${drag.origin.x + dx / zoom}px`;
    drag.node.style.top = `${drag.origin.y + dy / zoom}px`;
  } else {
    drag.node.style.width = `${Math.max(80, drag.w + dx / zoom)}px`;
    if (drag.node.classList.contains('zone'))
      drag.node.style.height = `${Math.max(80, drag.h + dy / zoom)}px`;
  }
}

/** The item a finished move or resize leaves, written back. */
function dropped(board: Board, drag: Drag): void {
  if (drag.kind === 'pan') return;
  const item = find(board, drag.id);
  if (item === undefined || item.kind === 'line') return;
  if (drag.kind === 'move') {
    if (drag.moved)
      board.store.write?.({
        ...item,
        x: drag.node.offsetLeft,
        y: drag.node.offsetTop,
      });
    return;
  }
  board.store.write?.(
    item.kind === 'zone'
      ? { ...item, w: drag.node.offsetWidth, h: drag.node.offsetHeight }
      : { ...item, w: drag.node.offsetWidth },
  );
}

export function wireGestures(board: Board): void {
  let drag: Drag | undefined;
  const pointers = new Map<number, Point>();
  let pinch: Pinch | undefined;

  function startPinch(): void {
    const [a, b] = [...pointers.values()];
    if (a === undefined || b === undefined) return;
    pinch = {
      distance: distance(a, b),
      ...pick(board, 'camera'),
      centre: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
    };
    drag = undefined;
  }

  function startItemDrag(event: PointerEvent, id: string, point: Point): void {
    select(board, id);
    const item = find(board, id);
    const node = nodeOf(board, id);
    if (
      board.store.write === undefined ||
      item === undefined ||
      item.kind === 'line' ||
      node === null
    )
      return;
    board.stage.setPointerCapture(event.pointerId);
    drag =
      event.target instanceof Element &&
      event.target.classList.contains('resize')
        ? {
            kind: 'resize',
            id,
            start: point,
            w: node.offsetWidth,
            h: node.offsetHeight,
            node,
          }
        : { kind: 'move', id, start: point, origin: item, node, moved: false };
  }

  board.stage.addEventListener('pointerdown', (event) => {
    if (
      event.target instanceof Node &&
      board.editing?.contains(event.target) === true
    )
      return;
    const point = screenPoint(board, event);
    pointers.set(event.pointerId, point);
    if (pointers.size === 2) {
      startPinch();
      return;
    }
    const id = itemIdAt(event.target);
    if (id !== undefined && board.lineTool) pickLineEnd(board, id);
    else if (id === undefined) {
      if (board.selected !== undefined) select(board, undefined);
      board.stage.setPointerCapture(event.pointerId);
      drag = { kind: 'pan', start: point, ...pick(board, 'camera') };
    } else startItemDrag(event, id, point);
  });

  board.stage.addEventListener('pointermove', (event) => {
    if (!pointers.has(event.pointerId)) return;
    const point = screenPoint(board, event);
    pointers.set(event.pointerId, point);
    const [a, b] = [...pointers.values()];
    if (pinch !== undefined && a !== undefined && b !== undefined) {
      board.camera = zoomAt(
        pinch.camera,
        pinch.centre,
        distance(a, b) / pinch.distance,
      );
      applyCamera(board);
      return;
    }
    if (drag !== undefined) dragged(board, drag, point);
  });

  function endPointer(event: PointerEvent): void {
    pointers.delete(event.pointerId);
    if (pointers.size < 2) pinch = undefined;
    const ended = drag;
    drag = undefined;
    if (ended !== undefined) dropped(board, ended);
  }
  board.stage.addEventListener('pointerup', endPointer);
  board.stage.addEventListener('pointercancel', endPointer);

  board.stage.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      const { camera } = board;
      board.camera = event.ctrlKey
        ? zoomAt(
            camera,
            screenPoint(board, event),
            Math.exp(-event.deltaY / 200),
          )
        : { ...camera, x: camera.x - event.deltaX, y: camera.y - event.deltaY };
      applyCamera(board, !event.ctrlKey);
    },
    { passive: false },
  );

  board.stage.addEventListener('dblclick', (event) => {
    if (board.store.write === undefined) return;
    const id = itemIdAt(event.target);
    if (id === undefined)
      addSticky(board, toWorld(board.camera, screenPoint(board, event)));
    else startEditing(board, id);
  });
}
