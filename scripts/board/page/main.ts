/**
 * The board page: an infinite canvas of the items baked into it, overlaid live
 * with the artifact's `db` rows. Pan by dragging the background or scrolling,
 * zoom with ctrl/pinch, double-click to add or edit, drag to move.
 */
import * as z from 'zod';

import { Item, type PlacedItem, STICKY_COLORS } from '../model.ts';
import {
  fitTo,
  type Point,
  type Rect,
  toWorld,
  union,
  zoomAt,
  type Zoomed,
} from './camera.ts';
import { byId, itemIdAt, newId, required } from './dom.ts';
import { createLift } from './lift.ts';
import {
  EDITABLE_FIELD,
  type LineItem,
  markSelection,
  renderItems,
  renderLines,
} from './render.ts';
import { type Assets, connect, errorCode, type User } from './runtime.ts';
import { createStore, type Status, type Store } from './store.ts';

type StickyColor = (typeof STICKY_COLORS)[number];

const stage = byId('stage');
const lens = byId('camera');
const world = byId('world');
const lines = required(
  document.querySelector<SVGSVGElement>('#lines'),
  '#lines',
);
const status = byId('status');
const colors = byId('colors');
const picker = required(
  document.querySelector<HTMLInputElement>('#image-file'),
  '#image-file',
);

const baked = z.array(Item).parse(JSON.parse(byId('board-data').textContent));

let camera: Zoomed = { x: 0, y: 0, zoom: 1 };
let selected: string | undefined;
let lineTool = false;
let lineFrom: string | undefined;
let editing: HTMLElement | undefined;
let names: Record<string, string> = {};
let user: User | null = null;
let assets: Assets | null = null;
let store: Store = createStore(
  baked,
  undefined,
  () => {
    render();
  },
  showStatus,
);

const visible = (): Item[] =>
  store.items().filter((item) => item.deleted !== true);
const placed = (): PlacedItem[] =>
  visible().filter((item): item is PlacedItem => item.kind !== 'line');
const find = (id: string | undefined): Item | undefined =>
  store.items().find((item) => item.id === id);
const nodeOf = (id: string): HTMLElement | null =>
  world.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`);

function statusText(next: Status): string {
  switch (next.kind) {
    case 'read-only': {
      return next.reason;
    }
    case 'connecting': {
      return 'Connecting…';
    }
    case 'live': {
      return next.rejected.length > 0
        ? `Live — unreadable rows: ${next.rejected.join(', ')}`
        : 'Live';
    }
    case 'stale': {
      return 'Live edits can’t be reached yet; this may be out of date.';
    }
    case 'error': {
      return next.message;
    }
    default: {
      const unknown: never = next;
      throw new Error(`unknown status ${JSON.stringify(unknown)}`);
    }
  }
}

function showStatus(next: Status): void {
  status.textContent = statusText(next);
  status.dataset['kind'] = next.kind;
  // From the status alone: the first one arrives while `store` is still being made.
  document.body.classList.toggle('read-only', next.kind === 'read-only');
}

const lift = createLift(stage, () => camera.zoom);

/** `camera` onto the world; `gesture` for a frame of a pan, pinch or wheel. */
function applyCamera(gesture = false): void {
  lens.style.transform = `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`;
  if (gesture) lift.moving();
  else lift.rest();
}

function rectOf(id: string): Rect | undefined {
  const node = nodeOf(id);
  if (node === null) return undefined;
  return {
    x: node.offsetLeft,
    y: node.offsetTop,
    width: node.offsetWidth,
    height: node.offsetHeight,
  };
}

/** Selection marks and the colour picker, which follow `selected`. */
function select(id: string | undefined): void {
  selected = id;
  markSelection(stage, selected, lineFrom);
  const target = find(selected);
  colors.hidden =
    store.write === undefined ||
    (target?.kind !== 'sticky' && target?.kind !== 'zone');
}

async function resolveNames(items: readonly Item[]): Promise<void> {
  if (user === null) return;
  const ids = [...new Set(items.map((item) => item.author))].filter(
    (author) => author.startsWith('u_') && !(author in names),
  );
  if (ids.length === 0) return;
  const resolved = await user.profiles(ids);
  names = {
    ...names,
    ...Object.fromEntries(ids.map((id) => [id, resolved[id]?.name ?? ''])),
  };
  render();
}

/** The whole world, rebuilt; held off while a text is being edited, and run on its blur. */
function render(): void {
  if (editing !== undefined) return;
  const items = placed();
  renderItems(world, items, { editable: store.write !== undefined, names });
  drawLines();
  resolveNames(items).catch(reportError);
}

/** The lines alone, re-run to the items' edges as they now stand. */
function drawLines(): void {
  renderLines(
    lines,
    visible().filter((item): item is LineItem => item.kind === 'line'),
    rectOf,
  );
  select(selected);
}

function fit(): void {
  const bounds = union(
    placed()
      .map((item) => rectOf(item.id))
      .filter((rect) => rect !== undefined),
  );
  const { width, height } = stage.getBoundingClientRect();
  camera =
    bounds === undefined
      ? { ...screenCentre(), zoom: 1 }
      : fitTo(bounds, { x: 0, y: 0, width, height });
  applyCamera();
}

type ScreenPointEvent = { clientX: number; clientY: number };

function screenPoint(event: ScreenPointEvent): Point {
  const box = stage.getBoundingClientRect();
  return { x: event.clientX - box.left, y: event.clientY - box.top };
}

function screenCentre(): Point {
  const box = stage.getBoundingClientRect();
  return { x: box.width / 2, y: box.height / 2 };
}

const viewCentre = (): Point => toWorld(camera, screenCentre());

function startEditing(id: string): void {
  const node = nodeOf(id)?.querySelector<HTMLElement>('[data-edit]');
  const item = find(id);
  if (
    node === null ||
    node === undefined ||
    item === undefined ||
    item.kind === 'line' ||
    store.write === undefined
  )
    return;
  const field = EDITABLE_FIELD[item.kind];
  editing = node;
  node.contentEditable = 'plaintext-only';
  node.focus();
  const range = document.createRange();
  range.selectNodeContents(node);
  document.getSelection()?.removeAllRanges();
  document.getSelection()?.addRange(range);
  node.addEventListener(
    'blur',
    () => {
      editing = undefined;
      const text = node.textContent.replace(/\n$/, '');
      const current = find(id);
      if (current?.kind === item.kind && Reflect.get(current, field) !== text)
        store.write?.({ ...current, [field]: text });
      render();
    },
    { once: true },
  );
}

/** A new item's own stamp, which `write` replaces with the viewer's. */
const draft = { updated: new Date(0).toISOString(), author: 'agent:draft' };

function add(item: Item, edit: boolean): void {
  store.write?.(item);
  select(item.id);
  if (edit) startEditing(item.id);
}

function addSticky(at: Point): void {
  add(
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

function remove(id: string): void {
  const item = find(id);
  if (item === undefined) return;
  store.write?.({ ...item, deleted: true });
  for (const line of visible())
    if (line.kind === 'line' && (line.from === id || line.to === id))
      store.write?.({ ...line, deleted: true });
  select(undefined);
}

function recolor(color: StickyColor): void {
  const item = find(selected);
  if (item?.kind === 'sticky' || item?.kind === 'zone')
    store.write?.({ ...item, color });
}

function setLineTool(on: boolean): void {
  lineTool = on;
  lineFrom = undefined;
  byId('tool-line').classList.toggle('active', on);
  document.body.classList.toggle('line-tool', on);
}

/** One end of a line picked; the second end creates it. */
function pickLineEnd(id: string): void {
  if (lineFrom === undefined) lineFrom = id;
  else if (lineFrom !== id) {
    add(
      { ...draft, kind: 'line', id: newId('l'), from: lineFrom, to: id },
      false,
    );
    setLineTool(false);
  }
  select(selected);
}

async function addImage(file: Blob): Promise<void> {
  if (assets === null) return;
  const centre = viewCentre();
  try {
    const { id } = await assets.upload(file);
    add(
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
    showStatus({
      kind: 'error',
      message: `Upload failed: ${errorCode(error)}`,
    });
  }
}

function zoomBy(factor: number): void {
  camera = zoomAt(camera, screenCentre(), factor);
  applyCamera();
}

// --- pointer gestures -------------------------------------------------------

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

let drag: Drag | undefined;
const pointers = new Map<number, Point>();
let pinch: { distance: number; camera: Zoomed; centre: Point } | undefined;

const distance = (a: Point, b: Point): number =>
  Math.hypot(a.x - b.x, a.y - b.y);

function startPinch(): void {
  const [a, b] = [...pointers.values()];
  if (a === undefined || b === undefined) return;
  pinch = {
    distance: distance(a, b),
    camera,
    centre: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
  };
  drag = undefined;
}

function startItemDrag(event: PointerEvent, id: string, point: Point): void {
  select(id);
  const item = find(id);
  const node = nodeOf(id);
  if (
    store.write === undefined ||
    item === undefined ||
    item.kind === 'line' ||
    node === null
  )
    return;
  stage.setPointerCapture(event.pointerId);
  drag =
    event.target instanceof Element && event.target.classList.contains('resize')
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

stage.addEventListener('pointerdown', (event) => {
  if (event.target instanceof Node && editing?.contains(event.target) === true)
    return;
  const point = screenPoint(event);
  pointers.set(event.pointerId, point);
  if (pointers.size === 2) {
    startPinch();
    return;
  }
  const id = itemIdAt(event.target);
  if (id !== undefined && lineTool) pickLineEnd(id);
  else if (id === undefined) {
    if (selected !== undefined) select(undefined);
    stage.setPointerCapture(event.pointerId);
    drag = { kind: 'pan', start: point, camera };
  } else startItemDrag(event, id, point);
});

stage.addEventListener('pointermove', (event) => {
  if (!pointers.has(event.pointerId)) return;
  const point = screenPoint(event);
  pointers.set(event.pointerId, point);
  const [a, b] = [...pointers.values()];
  if (pinch !== undefined && a !== undefined && b !== undefined) {
    camera = zoomAt(
      pinch.camera,
      pinch.centre,
      distance(a, b) / pinch.distance,
    );
    applyCamera(true);
    return;
  }
  if (drag === undefined) return;
  const dx = point.x - drag.start.x;
  const dy = point.y - drag.start.y;
  if (drag.kind === 'pan') {
    camera = { ...drag.camera, x: drag.camera.x + dx, y: drag.camera.y + dy };
    applyCamera(true);
  } else if (drag.kind === 'move') {
    if (Math.hypot(dx, dy) > 3) drag.moved = true;
    drag.node.style.left = `${drag.origin.x + dx / camera.zoom}px`;
    drag.node.style.top = `${drag.origin.y + dy / camera.zoom}px`;
  } else {
    drag.node.style.width = `${Math.max(80, drag.w + dx / camera.zoom)}px`;
    if (drag.node.classList.contains('zone'))
      drag.node.style.height = `${Math.max(80, drag.h + dy / camera.zoom)}px`;
  }
});

function endPointer(event: PointerEvent): void {
  pointers.delete(event.pointerId);
  if (pointers.size < 2) pinch = undefined;
  const ended = drag;
  drag = undefined;
  if (ended === undefined || ended.kind === 'pan') return;
  const item = find(ended.id);
  if (item === undefined || item.kind === 'line') return;
  if (ended.kind === 'move') {
    const { node, moved } = ended;
    if (moved)
      store.write?.({ ...item, x: node.offsetLeft, y: node.offsetTop });
    return;
  }
  const { node } = ended;
  store.write?.(
    item.kind === 'zone'
      ? { ...item, w: node.offsetWidth, h: node.offsetHeight }
      : { ...item, w: node.offsetWidth },
  );
}
stage.addEventListener('pointerup', endPointer);
stage.addEventListener('pointercancel', endPointer);

stage.addEventListener(
  'wheel',
  (event) => {
    event.preventDefault();
    camera = event.ctrlKey
      ? zoomAt(camera, screenPoint(event), Math.exp(-event.deltaY / 200))
      : { ...camera, x: camera.x - event.deltaX, y: camera.y - event.deltaY };
    applyCamera(true);
  },
  { passive: false },
);

stage.addEventListener('dblclick', (event) => {
  if (store.write === undefined) return;
  const id = itemIdAt(event.target);
  if (id === undefined) addSticky(toWorld(camera, screenPoint(event)));
  else startEditing(id);
});

// --- toolbar, keys, paste --------------------------------------------------

const onClick = (id: string, handler: () => void): void => {
  byId(id).addEventListener('click', handler);
};

onClick('tool-fit', fit);
onClick('tool-in', () => {
  zoomBy(1.25);
});
onClick('tool-out', () => {
  zoomBy(0.8);
});
onClick('tool-sticky', () => {
  addSticky(viewCentre());
});
onClick('tool-text', () => {
  const at = viewCentre();
  add(
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
});
onClick('tool-zone', () => {
  const at = viewCentre();
  add(
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
});
onClick('tool-line', () => {
  setLineTool(!lineTool);
});
onClick('tool-delete', () => {
  if (selected !== undefined) remove(selected);
});
onClick('tool-image', () => {
  picker.click();
});
picker.addEventListener('change', () => {
  const file = picker.files?.[0];
  picker.value = '';
  if (file !== undefined) addImage(file).catch(reportError);
});

for (const color of STICKY_COLORS) {
  const swatch = document.createElement('button');
  swatch.className = `swatch c-${color}`;
  swatch.title = color;
  swatch.addEventListener('click', () => {
    recolor(color);
  });
  colors.append(swatch);
}

document.addEventListener('keydown', (event) => {
  if (editing !== undefined) {
    if (event.key === 'Escape') editing.blur();
    return;
  }
  if (
    (event.key === 'Delete' || event.key === 'Backspace') &&
    selected !== undefined &&
    store.write !== undefined
  )
    remove(selected);
  if (event.key === 'Escape') {
    setLineTool(false);
    select(undefined);
  }
});

document.addEventListener('paste', (event) => {
  if (editing !== undefined) return;
  const file = [...(event.clipboardData?.files ?? [])].find((candidate) =>
    candidate.type.startsWith('image/'),
  );
  if (file === undefined) return;
  event.preventDefault();
  addImage(file).catch(reportError);
});

// A face arriving late resizes the items it sets, so the lines are re-run to their new edges.
document.fonts.addEventListener('loadingdone', drawLines);
window.addEventListener('resize', () => {
  applyCamera();
});

// --- start -----------------------------------------------------------------

document.body.classList.toggle('snapshot', location.hash === '#snapshot');
render();
fit();
showStatus({ kind: 'read-only', reason: 'Read-only copy.' });
// A broken image shows as one; readiness waits on every image settling either
// way, and on the fonts, whose metrics size the items the lines run between.
await Promise.allSettled([
  ...[...document.images].map(async (img) => img.decode()),
  document.fonts.ready,
]);
render();
fit();
document.body.dataset['ready'] = 'true';

const { db, ...runtime } = await connect();
({ user, assets } = runtime);
const author = (await user?.id()) ?? null;
const allowed = (await user?.can('data.write')) ?? null;
document.body.classList.toggle('can-upload', assets !== null);
store = createStore(
  baked,
  db !== null && author !== null && allowed !== false
    ? { db, author }
    : undefined,
  () => {
    render();
  },
  showStatus,
);
render();
