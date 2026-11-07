/**
 * The board's items: one schema for the files in the repo, the rows in the
 * artifact's `db` and the data baked into the page, and the one merge that
 * reconciles them — the newer `updated` wins per item, a tie going to the
 * overlay, so a row the operator just wrote beats the baked copy it came from.
 * A deletion is a tombstone (`deleted: true`), kept through every merge, so an
 * older copy elsewhere never brings the item back.
 */
import { z } from 'zod';

/** The `db` path grammar's segment alphabet, so an item id is its row's doc id. */
const ID = z.string().regex(/^[\w-]{1,64}$/);

export const STICKY_COLORS = [
  'yellow',
  'pink',
  'blue',
  'green',
  'orange',
  'purple',
  'gray',
] as const;
const Color = z.enum(STICKY_COLORS);

export const TEXT_SIZES = ['h1', 'h2', 'body'] as const;

const Common = z.object({
  id: ID,
  /** ISO 8601, compared as a string — every writer emits `toISOString()`. */
  updated: z.iso.datetime(),
  /** A `user` capability id (`u_…`) for a person, `agent:<role>` for a session. */
  author: z.string().min(1),
  deleted: z.boolean().optional(),
});

const Placed = Common.extend({ x: z.number(), y: z.number() });

const Sticky = Placed.extend({
  kind: z.literal('sticky'),
  text: z.string(),
  color: Color,
  w: z.number().positive(),
});

const Zone = Placed.extend({
  kind: z.literal('zone'),
  title: z.string(),
  w: z.number().positive(),
  h: z.number().positive(),
  color: Color.optional(),
});

const Image = Placed.extend({
  kind: z.literal('image'),
  /** `images/<file>` beside the page, or `/_blob/<asset id>` for an upload. */
  src: z.string().regex(/^(images\/[\w.-]+|\/_blob\/[\da-f]{32})$/),
  w: z.number().positive(),
  caption: z.string().optional(),
});

const Text = Placed.extend({
  kind: z.literal('text'),
  text: z.string(),
  size: z.enum(TEXT_SIZES),
  w: z.number().positive().optional(),
});

const Line = Common.extend({
  kind: z.literal('line'),
  from: ID,
  to: ID,
  label: z.string().optional(),
  dashed: z.boolean().optional(),
});

export const Item = z.discriminatedUnion('kind', [
  Sticky,
  Zone,
  Image,
  Text,
  Line,
]);
export type Item = z.infer<typeof Item>;
export type PlacedItem = Exclude<Item, { kind: 'line' }>;

/** `base` overlaid with `overlay`, item by item; order follows `base`, new ids after. */
export function mergeItems(
  base: readonly Item[],
  overlay: readonly Item[],
): Item[] {
  const merged = new Map(base.map((item) => [item.id, item]));
  for (const item of overlay) {
    const current = merged.get(item.id);
    if (!current || item.updated >= current.updated) merged.set(item.id, item);
  }
  return [...merged.values()];
}

/** The items `overlay` changes in `base`: what a sync writes back to the repo. */
export function newerThan(
  base: readonly Item[],
  overlay: readonly Item[],
): Item[] {
  const byId = new Map(base.map((item) => [item.id, item]));
  return overlay.filter((item) => {
    const current = byId.get(item.id);
    return !current || item.updated > current.updated;
  });
}

/**
 * The item a `db` row holds, its body checked against the schema and its id
 * against the doc id it is stored under. A row that fails is an error, never
 * skipped: a sync that dropped it would lose the operator's edit silently.
 */
export function parseDbRow(docId: string, body: unknown): Item {
  const item = Item.parse(body);
  if (item.id !== docId)
    throw new Error(`db row ${docId} holds item ${item.id}: ids must match`);
  return item;
}
