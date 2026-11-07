/** A node the page's own markup guarantees; its absence is a build bug. */
export function required<T>(node: T | null, what: string): T {
  if (node === null) throw new Error(`board page is missing ${what}`);
  return node;
}

export const byId = (id: string): HTMLElement =>
  required(document.querySelector<HTMLElement>(`#${id}`), `#${id}`);

/** A fresh item id, `<prefix>-<random>`, inside the db path grammar. */
export const newId = (prefix: string): string =>
  `${prefix}-${crypto.randomUUID().replaceAll('-', '').slice(0, 12)}`;

/** The item id on `target` or the nearest element above it that carries one. */
export function itemIdAt(target: EventTarget | null): string | undefined {
  if (!(target instanceof Element)) return undefined;
  return target.closest<HTMLElement | SVGElement>('[data-id]')?.dataset['id'];
}

/**
 * Whether `target` sits in a link an item's text renders, which a press
 * follows rather than dragging, selecting or editing the item it is on.
 */
export const onLink = (target: EventTarget | null): boolean =>
  target instanceof Element && target.closest('a[href]') !== null;
