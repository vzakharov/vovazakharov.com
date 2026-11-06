/**
 * Items to DOM, lines to SVG. Rendering is whole: every call rebuilds the world
 * from the merged items, which at a board's size (dozens of items) costs less
 * than keeping a diff, and leaves no stale node behind a remote edit.
 */
import type { Item, PlacedItem } from '../model.ts';
import { edgePoint, type Rect } from './camera.ts';

export type LineItem = Extract<Item, { kind: 'line' }>;

/** The text field a double-click edits on each kind; lines have none. */
export const EDITABLE_FIELD = {
  sticky: 'text',
  text: 'text',
  zone: 'title',
  image: 'caption',
} as const satisfies Record<PlacedItem['kind'], string>;

/**
 * Selection is drawn by class, not by rebuilding, so a node under a pointer
 * survives the click that selects it — a drag or a double-click needs it to.
 */
export function markSelection(
  root: Element,
  selected: string | undefined,
  lineFrom: string | undefined,
): void {
  for (const node of root.querySelectorAll<HTMLElement | SVGElement>(
    '[data-id]',
  )) {
    const id = node.dataset['id'];
    node.classList.toggle('selected', id === selected);
    node.classList.toggle('line-from', id === lineFrom);
  }
}

export type RenderOptions = {
  editable: boolean;
  /** Display names for `u_…` author ids, resolved by the `user` capability. */
  names: Readonly<Record<string, string>>;
};

/** Who wrote an item, as a reader of the board would name them. */
export function authorLabel(
  author: string,
  names: Readonly<Record<string, string>>,
): string {
  if (author.startsWith('agent:')) return author.slice('agent:'.length);
  const name = names[author] ?? '';
  return name === '' ? 'someone' : name;
}

function element(tag: string, className: string, text?: string): HTMLElement {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function editableText(
  item: PlacedItem,
  className: string,
  text: string,
): HTMLElement {
  const node = element('div', className, text);
  node.dataset['edit'] = EDITABLE_FIELD[item.kind];
  return node;
}

function itemBody(
  item: PlacedItem,
  names: RenderOptions['names'],
): HTMLElement {
  const by = element('span', 'by', authorLabel(item.author, names));
  switch (item.kind) {
    case 'sticky': {
      const node = element('div', `item sticky c-${item.color}`);
      node.style.width = `${item.w}px`;
      node.append(editableText(item, 'body', item.text), by);
      return node;
    }
    case 'text': {
      const node = element('div', `item text size-${item.size}`);
      if (item.w !== undefined) node.style.width = `${item.w}px`;
      node.append(editableText(item, 'body', item.text), by);
      return node;
    }
    case 'zone': {
      const node = element('div', `item zone c-${item.color ?? 'gray'}`);
      node.style.width = `${item.w}px`;
      node.style.height = `${item.h}px`;
      const title = editableText(item, 'title', item.title);
      node.append(title, by);
      return node;
    }
    case 'image': {
      const node = element('figure', 'item image');
      node.style.width = `${item.w}px`;
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.caption ?? '';
      img.draggable = false;
      node.append(img, editableText(item, 'caption', item.caption ?? ''), by);
      return node;
    }
    default: {
      const unknown: never = item;
      throw new Error(`no renderer for ${JSON.stringify(unknown)}`);
    }
  }
}

/** Zones first, so everything else sits on top of the area it belongs to. */
const layer = (item: PlacedItem): number => (item.kind === 'zone' ? 0 : 1);

export function renderItems(
  world: HTMLElement,
  items: readonly PlacedItem[],
  options: RenderOptions,
): void {
  const nodes = items
    .toSorted((a, b) => layer(a) - layer(b))
    .map((item) => {
      const node = itemBody(item, options.names);
      node.dataset['id'] = item.id;
      node.style.left = `${item.x}px`;
      node.style.top = `${item.y}px`;
      if (options.editable && item.kind !== 'text')
        node.append(element('div', 'resize'));
      return node;
    });
  world.replaceChildren(...nodes);
}

const SVG = 'http://www.w3.org/2000/svg';

function svg(tag: string, attributes: Record<string, string>): SVGElement {
  const node = document.createElementNS(SVG, tag);
  for (const [name, value] of Object.entries(attributes))
    node.setAttribute(name, value);
  return node;
}

/** Each line from edge to edge of the items it joins; one whose end is gone is skipped. */
export function renderLines(
  layerNode: SVGSVGElement,
  lines: readonly LineItem[],
  rectOf: (id: string) => Rect | undefined,
): void {
  const defs = svg('defs', {});
  const marker = svg('marker', {
    id: 'arrow',
    viewBox: '0 0 10 10',
    refX: '9',
    refY: '5',
    markerWidth: '8',
    markerHeight: '8',
    orient: 'auto-start-reverse',
  });
  marker.append(svg('path', { d: 'M0,0 L10,5 L0,10 z', class: 'arrowhead' }));
  defs.append(marker);
  const nodes: SVGElement[] = [defs];
  for (const line of lines) {
    const from = rectOf(line.from);
    const to = rectOf(line.to);
    if (from === undefined || to === undefined) continue;
    const toCentre = { x: to.x + to.w / 2, y: to.y + to.h / 2 };
    const fromCentre = { x: from.x + from.w / 2, y: from.y + from.h / 2 };
    const a = edgePoint(from, toCentre);
    const b = edgePoint(to, fromCentre);
    const d = `M${a.x},${a.y} L${b.x},${b.y}`;
    const group = svg('g', { class: 'line', 'data-id': line.id });
    group.append(
      svg('path', { d, class: 'hit' }),
      svg('path', {
        d,
        class: `stroke${line.dashed === true ? ' dashed' : ''}`,
        'marker-end': 'url(#arrow)',
      }),
    );
    if (line.label !== undefined && line.label !== '') {
      const label = svg('text', {
        x: String((a.x + b.x) / 2),
        y: String((a.y + b.y) / 2 - 6),
        class: 'label',
      });
      label.textContent = line.label;
      group.append(label);
    }
    nodes.push(group);
  }
  layerNode.replaceChildren(...nodes);
}
