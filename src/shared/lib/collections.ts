/**
 * A subset of an object, named once. `{...pick(printed, 'href')}` is what
 * `vova/no-redundant-property-copy` asks for where `href={printed.href}`
 * spells the key on both sides.
 *
 * Taken verbatim from the Playgram app's `shared/collections`, which is the
 * home of this family — so a fix to it is made there and copied here, not the
 * other way round, and its siblings (`omit`, `mapValues`, `getKeys`) land in
 * this file under that name rather than each opening one of its own.
 */
export function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  // @ts-expect-error - we know the end result is a Pick<T, K>
  const result: Pick<T, K> = {};
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}

/**
 * The list is widened to `readonly string[]` before `.includes()`: a literal
 * tuple types its own `includes` as accepting a member, which is the one thing
 * an unchecked value cannot promise.
 */
export const isOneOf =
  <const T extends readonly string[]>(values: T) =>
  (value: unknown): value is T[number] =>
    typeof value === 'string' && (values as readonly string[]).includes(value);

/** The same check as a parse: the value, or a throw listing what was allowed. */
export function oneOf<const T extends readonly string[]>(
  values: T,
  value: unknown,
): T[number] {
  if (!isOneOf(values)(value)) {
    throw new Error(
      `Expected one of ${values.join(', ')}, not ${String(value)}`,
    );
  }

  return value;
}

/** Every prefix of a tuple, the empty one included. */
type Prefixes<T extends readonly unknown[]> = T extends readonly [
  infer Head,
  ...infer Tail,
]
  ? [] | [Head, ...Prefixes<Tail>]
  : [];

/**
 * The same parse along a sequence — each value against the list at its
 * position — for a sequence that may stop anywhere but not run long, which is
 * what an optional-catch-all route hands over. The length comes back in the
 * type, so a caller reads the result positionally without re-checking it.
 */
export function oneOfEach<const T extends ReadonlyArray<readonly string[]>>(
  lists: T,
  values: readonly unknown[],
): Prefixes<{ [K in keyof T]: T[K][number] }>;

// The body knows only that it returns members of the lists it was handed; which
// list each one came from is positional, and no signature over a mapped array
// says that. So the narrow type is the overload's and the wide one is here,
// where a reader of the loop can check it against the loop.
export function oneOfEach(
  lists: ReadonlyArray<readonly string[]>,
  values: readonly unknown[],
): string[] {
  if (values.length > lists.length) {
    throw new Error(
      `Expected at most ${lists.length} values, not ${values.length}: ${values.map(String).join(', ')}`,
    );
  }

  return lists
    .slice(0, values.length)
    .map((list, index) => oneOf(list, values[index]));
}
