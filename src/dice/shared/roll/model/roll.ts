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
type Lookup<K> = { values: Float64Array; at: (key: K) => number };

/**
 * A table of one leaf per key. `K` appears only where a key is taken, so a
 * table over any key type is a `Table<never>`, which is how `Roll` holds one.
 */
export type Table<K> = Slotted & {
  kind: 'table';
  leaf: Leaf;
  lookup: (values: Float64Array) => Lookup<K>;
};

/** A key spelled as path segments, `/`-joined when it has several parts. */
export type Key<K> = { segments: (key: K) => string };

/** One part of a record key, spelled as one segment. */
type Part<V> = (value: V) => string;

/**
 * One `of` per value of `key`, decoded by `.at` when asked and never
 * enumerated, so the keys may outnumber anything a table could lay out.
 */
export type Over<K, O extends Roll> = { kind: 'over'; key: Key<K>; of: O };

/** Two words at `…/0` and `…/1`, read as one `bigint` in `[0, 2^64)`. */
type Wide = { kind: 'wide' };

export type Roll =
  | Leaf
  | Wide
  | Table<never>
  | { kind: 'over'; key: Key<never>; of: Roll }
  | { kind: 'struct'; fields: Record<string, Roll> };

export type Struct<F extends Record<string, Roll>> = {
  kind: 'struct';
  fields: F;
};

/** The decoded type of a schema. */
export type Rolled<S> = S extends Leaf
  ? number
  : S extends Wide
    ? bigint
    : S extends Table<infer K>
      ? Lookup<K>
      : S extends Over<infer K, infer O>
        ? { at: (key: K) => Rolled<O> }
        : S extends Struct<infer F>
          ? { [Name in keyof F]: Rolled<F[Name]> }
          : never;

/** Where a leaf's word comes from, by its path: `H(N, ·)`, or a pinned row. */
export type WordSource = (path: string) => number;

const leaf = (decode: (word: number) => number): Leaf => ({
  kind: 'leaf',
  decode,
});

/** How many integers `pick` spreads a word over at most, so `word · k` stays exact. */
const MAX_PICK = 2 ** 21;

/** The key type a record of parts spells. */
type Parted<P> = {
  [Name in keyof P]: P[Name] extends Part<infer V> ? V : never;
};

function key<const Names extends readonly string[]>(
  names: Names,
): Key<Names[number]>;
function key<P extends Record<string, Part<never>>>(parts: P): Key<Parted<P>>;

// A closed list spells a key as itself; a record spells each part in turn.
function key(
  spec: readonly string[] | Record<string, Part<never>>,
): Key<never> {
  if (Array.isArray(spec)) {
    const names: readonly string[] = spec;
    return {
      segments: (name: string) => {
        if (!names.includes(name)) {
          throw new Error(`Not a key of [${names.join(', ')}]: ${name}`);
        }
        return name;
      },
    };
  }
  const parts = Object.entries(spec);
  return {
    segments: (value: Record<string, never>) =>
      parts.map(([name, part]) => part(value[name])).join('/'),
  };
}

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
  /** An integer uniform on `[0, k)`, for `k` up to `2^21`. */
  pick: (k: number): Leaf => {
    if (!Number.isInteger(k) || k < 1 || k > MAX_PICK) {
      throw new Error(`Cannot pick among ${k}`);
    }
    return leaf((word) => Math.floor((word * k) / 2 ** 32));
  },
  /** An integer uniform on `[0, 2^64)`. */
  wide: (): Wide => ({ kind: 'wide' }),
  /** One `of` per value of `key`, decoded on demand. */
  over: <K, O extends Roll>(keyed: Key<K>, of: O): Over<K, O> => ({
    kind: 'over',
    key: keyed,
    of,
  }),
  key,
  /** A key part that is a safe integer. */
  int: (value: number): string => {
    if (!Number.isSafeInteger(value)) {
      throw new Error(`Not a safe integer: ${value}`);
    }
    return String(value);
  },
  /** A key part that is a `bigint`. */
  big: (value: bigint): string => value.toString(),
};

const WORD_BITS = BigInt(32);

const childPath = (path: string, name: string) =>
  path === '' ? name : `${path}/${name}`;

function rollAt(schema: Roll, path: string, source: WordSource): unknown {
  if (schema.kind === 'leaf') return schema.decode(source(path));
  if (schema.kind === 'wide') {
    const high = BigInt(source(childPath(path, '0')));
    return (high << WORD_BITS) | BigInt(source(childPath(path, '1')));
  }
  if (schema.kind === 'over') {
    const { key: keyed, of } = schema;
    return {
      at: (value: never) =>
        rollAt(of, childPath(path, keyed.segments(value)), source),
    };
  }
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
