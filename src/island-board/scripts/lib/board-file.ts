/**
 * A board's source file: one YAML document, `title`, `artifact` and `items`,
 * each item read the way a person writes it rather than as the page's row —
 *
 *   - id: call-5
 *     type: sticky
 *     updated: [2026-11-06T22:30:00.000Z, agent:lead]
 *     box: [1512, -573, 244, blue]
 *     text: Two tiers…
 *
 * `box` holds an item's geometry positionally — `x, y, w` for a sticky or an
 * image, `x, y, w, h` for a zone, `x, y[, w]` for a text — then its colour, or a
 * text's size; a line has `ends: [from, to]`, `dashed` appended when it is, and
 * `spiral: cw` when it spirals; a sticky ticked off has `done: true`. `text` is
 * each type's one text field: a zone's title, an image's caption, a line's
 * label. The file is the codec only: decoded, every item is the page's `Item`,
 * which the db rows and the baked page keep using.
 */
import { isDeepStrictEqual } from 'node:util';
import {
  type Document,
  isMap,
  isSeq,
  parseDocument,
  type YAMLMap,
  type YAMLSeq,
} from 'yaml';
import { z } from 'zod';

import {
  Item,
  SPIRALS,
  STICKY_COLORS,
  TEXT_SIZES,
} from '@/island-board/entities/item';

const Color = z.enum(STICKY_COLORS);
const Size = z.enum(TEXT_SIZES);
const N = z.number();

/** What an item's type reads its fields from. */
const Shape = z.object({
  box: z.array(z.union([N, z.string()])).optional(),
  ends: z.array(z.string()).optional(),
  src: z.string().optional(),
  text: z.string().optional(),
  spiral: z.enum(SPIRALS).optional(),
  done: z.literal(true).optional(),
});
type Shape = z.infer<typeof Shape>;

// The parsed object's keys follow the schema's, and a written item's follow
// those: so `id`, `type` and `updated` are declared first.
const FileItem = z
  .object({
    id: z.string(),
    type: z.enum(['sticky', 'zone', 'image', 'text', 'line']),
    updated: z.tuple([z.string(), z.string()]),
  })
  .extend(Shape.shape)
  .extend({ deleted: z.literal(true).optional() });
type FileItem = z.infer<typeof FileItem>;

const BoardFile = z.object({
  title: z.string(),
  artifact: z.url(),
  items: z.array(FileItem),
});
const ZoneFile = BoardFile.pick({ items: true });

/** A board's own file states its title and artifact; a zone's file, its items alone. */
export type FileKind = 'board' | 'zone';

/** Each type's `box`, the numbers and the trailing word read off it in place. */
const BOX = {
  sticky: z.tuple([N, N, N, Color]),
  zone: z.union([z.tuple([N, N, N, N, Color]), z.tuple([N, N, N, N])]),
  image: z.tuple([N, N, N]),
  text: z.union([z.tuple([N, N, N, Size]), z.tuple([N, N, Size])]),
} as const;

const ENDS = z.union([
  z.tuple([z.string(), z.string(), z.literal('dashed')]),
  z.tuple([z.string(), z.string()]),
]);

function fields({
  type,
  box,
  ends,
  src,
  text,
  spiral,
  done,
}: FileItem): Record<string, unknown> {
  switch (type) {
    case 'sticky': {
      const [x, y, w, color] = BOX.sticky.parse(box);
      return { x, y, w, color, text, done };
    }
    case 'zone': {
      const [x, y, w, h, color] = BOX.zone.parse(box);
      return { x, y, w, h, color, title: text };
    }
    case 'image': {
      const [x, y, w] = BOX.image.parse(box);
      return { x, y, w, src, caption: text };
    }
    case 'text': {
      const parsed = BOX.text.parse(box);
      const [x, y] = parsed;
      return parsed.length === 4
        ? { x, y, w: parsed[2], size: parsed[3], text }
        : { x, y, size: parsed[2], text };
    }
    case 'line': {
      const [from, to, dashed] = ENDS.parse(ends);
      return {
        from,
        to,
        label: text,
        dashed: dashed === undefined ? undefined : true,
        spiral,
      };
    }
    default: {
      const unknown: never = type;
      throw new Error(`unknown type ${String(unknown)}`);
    }
  }
}

const defined = (record: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined),
  );

export function decodeItem(file: FileItem): Item {
  const {
    id,
    type,
    updated: [updated, author],
    deleted,
  } = file;
  return Item.parse(
    defined({ id, kind: type, updated, author, ...fields(file), deleted }),
  );
}

function shape(item: Item): Shape {
  switch (item.kind) {
    case 'sticky': {
      const { x, y, w, color, text, done } = item;
      return { box: [x, y, w, color], text, done: done === true || undefined };
    }
    case 'zone': {
      const { x, y, w, h, color, title } = item;
      return {
        box: color === undefined ? [x, y, w, h] : [x, y, w, h, color],
        text: title,
      };
    }
    case 'image': {
      const { x, y, w, src, caption } = item;
      return { box: [x, y, w], src, text: caption };
    }
    case 'text': {
      const { x, y, w, size, text } = item;
      return { box: w === undefined ? [x, y, size] : [x, y, w, size], text };
    }
    case 'line': {
      const { from, to, dashed, label, spiral } = item;
      return {
        ends: dashed === true ? [from, to, 'dashed'] : [from, to],
        text: label,
        spiral,
      };
    }
    default: {
      const unknown: never = item;
      throw new Error(`unknown item ${JSON.stringify(unknown)}`);
    }
  }
}

/** The item as the file spells it, keys in the file's order and none left undefined. */
export function encodeItem(item: Item): FileItem {
  const { id, kind, updated, author, deleted } = item;
  return FileItem.parse(
    defined({
      id,
      type: kind,
      updated: [updated, author],
      ...shape(item),
      deleted: deleted === true ? true : undefined,
    }),
  );
}

/** Throws on an id seen twice, since an id is its row's doc id. */
export function assertUnique(items: readonly Item[]): void {
  const seen = new Set<string>();
  for (const { id } of items) {
    if (seen.has(id)) throw new Error(`item ${id} appears twice`);
    seen.add(id);
  }
}

/** Every item in a board file, checked. */
export function decodeBoard(text: string, kind: FileKind = 'board'): Item[] {
  const file = (kind === 'board' ? BoardFile : ZoneFile).parse(
    parseDocument(text).toJS(),
  );
  const items = file.items.map((item) => decodeItem(item));
  assertUnique(items);
  return items;
}

/** Keys whose value is a short tuple, written inline (`[x, y, w, blue]`). */
const FLOW_KEYS = new Set(['updated', 'box', 'ends']);

function setKey(
  doc: Document,
  node: YAMLMap,
  key: string,
  value: unknown,
): void {
  const created = doc.createNode(value);
  if (FLOW_KEYS.has(key) && isSeq(created)) created.flow = true;
  node.set(key, created);
}

/** The items, as a block sequence: a fresh file's `items: []` would make every item flow. */
function itemsOf(doc: Document): YAMLSeq {
  const items = doc.get('items');
  if (!isSeq(items)) throw new Error('board file has no items sequence');
  items.flow = false;
  return items;
}

const print = (doc: Document): string =>
  doc.toString({ lineWidth: 0, flowCollectionPadding: false });

/** The file's text without the items `ids` names, the rest untouched. */
export function removeItems(text: string, ids: ReadonlySet<string>): string {
  const doc = parseDocument(text);
  const seq = itemsOf(doc);
  seq.items = seq.items.filter(
    (node) => !(isMap(node) && ids.has(String(node.get('id')))),
  );
  return print(doc);
}

/**
 * `changed` written into the board file's text: on an item already there only
 * the keys that differ, new items appended, so every comment, key order and
 * untouched item stays as it was.
 */
export function writeItems(text: string, changed: readonly Item[]): string {
  const doc = parseDocument(text);
  const seq = itemsOf(doc);
  for (const item of changed) {
    const encoded = encodeItem(item);
    const node = seq.items.find(
      (candidate) => isMap(candidate) && candidate.get('id') === item.id,
    );
    if (!isMap(node)) {
      const created = doc.createNode({});
      for (const [key, value] of Object.entries(encoded))
        setKey(doc, created, key, value);
      seq.add(created);
      continue;
    }
    const current: unknown = node.toJSON();
    const before = z.record(z.string(), z.unknown()).parse(current);
    for (const [key, value] of Object.entries(encoded))
      if (!isDeepStrictEqual(before[key], value)) setKey(doc, node, key, value);
    for (const key of Object.keys(before))
      if (!(key in encoded)) node.delete(key);
  }
  return print(doc);
}
