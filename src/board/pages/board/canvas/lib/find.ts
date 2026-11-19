import type { PlacedItem } from '@/board/entities/item';

/** The words a reader sees on an item. */
export function textOf(item: PlacedItem): string {
  switch (item.kind) {
    case 'sticky':
    case 'text': {
      return item.text;
    }
    case 'zone': {
      return item.title;
    }
    case 'image': {
      return item.caption ?? '';
    }
    default: {
      const unknown: never = item;
      throw new Error(`no text for ${JSON.stringify(unknown)}`);
    }
  }
}

/** Case, accents and curly quotes folded away, so a typed query meets the board's typography. */
const fold = (text: string): string =>
  text
    .normalize('NFKD')
    .replaceAll(/\p{M}/gu, '')
    .replaceAll(/[‘’]/g, "'")
    .replaceAll(/[“”]/g, '"')
    .toLowerCase();

/** The ids of the items whose text holds every word of `query`, in the items' order; none for a blank query. */
export function matching(
  items: readonly PlacedItem[],
  query: string,
): string[] {
  const words = fold(query)
    .split(/\s+/)
    .filter((word) => word !== '');
  if (words.length === 0) return [];
  return items
    .filter((item) => {
      const text = fold(textOf(item));
      return words.every((word) => text.includes(word));
    })
    .map((item) => item.id);
}

/** `at` moved by `delta` through `count` places, wrapping at both ends. */
export const stepped = (at: number, delta: number, count: number): number =>
  count === 0 ? 0 : (((at + delta) % count) + count) % count;
