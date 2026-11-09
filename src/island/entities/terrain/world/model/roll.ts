import { decodeNormal, decodeUniform } from './decode';

// A world's parameters are one typed tree. Each leaf reads one 32-bit word,
// addressed by its path — its place in the tree joined by `/` — so adding a
// leaf anywhere moves no other leaf's word.

/** A leaf: one word, decoded to a number. */
export type Leaf = { kind: 'leaf'; decode: (word: number) => number };

/**
 * A table's flat slots, `[0, slots)`, the key at each spelled as path segments
 * (`(l, m)` → `l/m`).
 */
type Slotted = {
  slots: number;
  segmentsAt: (slot: number) => string;
};

/** A table's keys, key `k` at slot `slotOf(k)`. */
export type TableIndex<K> = Slotted & { slotOf: (key: K) => number };

/** A table decoded: its values in slot order, and a lookup by key. */
export type Lookup<K> = { values: Float64Array; at: (key: K) => number };

/**
 * A table of one leaf per key. `K` appears only where a key is taken, so a
 * table over any key type is a `Table<never>`, which is how `Roll` holds one.
 */
export type Table<K> = Slotted & {
  kind: 'table';
  leaf: Leaf;
  lookup: (values: Float64Array) => Lookup<K>;
};

export type Roll =
  | Leaf
  | Table<never>
  | { kind: 'struct'; fields: Record<string, Roll> };

export type Struct<F extends Record<string, Roll>> = {
  kind: 'struct';
  fields: F;
};

/** The decoded type of a schema. */
export type Rolled<S> =
  S extends Leaf
    ? number
    : S extends Table<infer K>
      ? Lookup<K>
      : S extends Struct<infer F>
        ? { [Name in keyof F]: Rolled<F[Name]> }
        : never;

/** Where a leaf's word comes from, by its path: `H(N, ·)`, or a pinned row. */
export type WordSource = (path: string) => number;

const leaf = (decode: (word: number) => number): Leaf => ({
  kind: 'leaf',
  decode,
});

export const roll = {
  struct: <F extends Record<string, Roll>>(fields: F): Struct<F> => ({
    kind: 'struct',
    fields,
  }),
  /** A value uniform on `[lo, hi)`. */
  uniform: (lo: number, hi: number): Leaf =>
    leaf((word) => decodeUniform(word, lo, hi)),
  /** A unit normal value. */
  normal: (): Leaf => leaf(decodeNormal),
  /** The raw word, an integer in `[0, 2^32)`. */
  word: (): Leaf => leaf((word) => word),
  /** One `of` per key of `index`, decoded into a flat array. */
  table: <K>(
    { slots, slotOf, segmentsAt }: TableIndex<K>,
    of: Leaf,
  ): Table<K> => ({
    kind: 'table',
    leaf: of,
    slots,
    segmentsAt,
    lookup: (values) => ({
      values,
      at: (key) => values[slotOf(key)] ?? Number.NaN,
    }),
  }),
};

const childPath = (path: string, name: string) =>
  path === '' ? name : `${path}/${name}`;

function rollAt(schema: Roll, path: string, source: WordSource): unknown {
  if (schema.kind === 'leaf') return schema.decode(source(path));
  if (schema.kind === 'table') {
    const { slots, segmentsAt, leaf: of, lookup } = schema;
    const values = new Float64Array(slots);
    for (let slot = 0; slot < slots; slot += 1) {
      values[slot] = of.decode(source(childPath(path, segmentsAt(slot))));
    }
    return lookup(values);
  }
  return Object.fromEntries(
    Object.entries(schema.fields).map(([name, field]) => [
      name,
      rollAt(field, childPath(path, name), source),
    ]),
  );
}

/** Decodes every leaf of `schema` from the word `source` gives its path. */
export function rollWith<S extends Roll>(
  schema: S,
  source: WordSource,
): Rolled<S>;

// `rollAt` walks the very tree `Rolled<S>` is derived from, which no signature
// over a recursive mapped type can say, so the narrow return is the overload's.
export function rollWith(schema: Roll, source: WordSource): unknown {
  return rollAt(schema, '', source);
}
