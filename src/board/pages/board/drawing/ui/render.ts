/**
 * Items to DOM, lines to SVG. Rendering is whole: every call rebuilds the world
 * from the merged items, which at a board's size (dozens of items) costs less
 * than keeping a diff, and leaves no stale node behind a remote edit.
 */
import type { Item, PlacedItem } from '@/board/entities/item';

import { centreOf, edgePoint, type Rect } from '../../camera/index.ts';
import { handStroke, jitter, tiltOf } from '../lib/hand.ts';
import { linkRuns } from '../lib/links.ts';

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
function authorLabel(
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

function link(href: string): HTMLAnchorElement {
  const node = document.createElement('a');
  node.href = href;
  node.target = '_blank';
  node.rel = 'noopener noreferrer';
  node.textContent = href;
  return node;
}

/**
 * The item's text field, its URLs as links. Its `textContent` is the text
 * exactly, which is what an edit of it reads back.
 */
function editableText(
  item: PlacedItem,
  className: string,
  text: string,
): HTMLElement {
  const node = element('div', className);
  node.dataset['edit'] = EDITABLE_FIELD[item.kind];
  node.append(
    ...linkRuns(text).map((run) =>
      run.kind === 'link' ? link(run.href) : run.text,
    ),
  );
  return node;
}

function itemBody(
  item: PlacedItem,
  names: RenderOptions['names'],
): HTMLElement {
  const by = element('span', 'by', authorLabel(item.author, names));
  switch (item.kind) {
    case 'sticky': {
      const node = element(
        'div',
        `item sticky c-${item.color}${item.done === true ? ' done' : ''}`,
      );
      node.style.width = `${item.w}px`;
      if (item.done === true) node.append(element('span', 'tick', '✓'));
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
      node.style.setProperty('--tilt', `${tiltOf(item.id, item.kind)}deg`);
      if (jitter(item.id, 'tape') > 0) node.classList.add('taped');
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

/** An open, hand-drawn chevron, sized in stroke widths so it follows the line's weight. */
function arrowMarker(): SVGElement {
  const marker = svg('marker', {
    id: 'arrow',
    viewBox: '0 0 12 12',
    refX: '10',
    refY: '6',
    markerWidth: '4.5',
    markerHeight: '4.5',
    orient: 'auto-start-reverse',
  });
  marker.append(svg('path', { d: 'M1.5,1 L10.5,6 L2,11', class: 'arrowhead' }));
  return marker;
}

/**
 * Each line from edge to edge of the items it joins, drawn as `handStroke`
 * curves; one whose end is gone is skipped.
 */
export function renderLines(
  layerNode: SVGSVGElement,
  lines: readonly LineItem[],
  rectOf: (id: string) => Rect | undefined,
): void {
  const defs = svg('defs', {});
  defs.append(arrowMarker());
  const nodes: SVGElement[] = [defs];
  for (const line of lines) {
    const from = rectOf(line.from);
    const to = rectOf(line.to);
    if (from === undefined || to === undefined) continue;
    const a = edgePoint(from, centreOf(to));
    const b = edgePoint(to, centreOf(from));
    const { d, mid } = handStroke(a, b, line);
    const { d: echo } = handStroke(a, b, line, 1);
    const dashed = line.dashed === true ? ' dashed' : '';
    const group = svg('g', { class: 'line', 'data-id': line.id });
    group.append(
      svg('path', { d, class: 'hit' }),
      svg('path', {
        d: echo,
        class: `stroke echo${dashed}`,
      }),
      svg('path', {
        d,
        class: `stroke${dashed}`,
        'marker-end': 'url(#arrow)',
      }),
    );
    if (line.label !== undefined && line.label !== '') {
      const label = svg('text', {
        x: String(mid.x),
        y: String(mid.y - 12),
        class: 'label',
        transform: `rotate(${tiltOf(line.id, 'sticky')} ${mid.x} ${mid.y})`,
      });
      label.textContent = line.label;
      group.append(label);
    }
    nodes.push(group);
  }
  layerNode.replaceChildren(...nodes);
}
