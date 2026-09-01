/**
 * `Object.fromEntries` that keeps the key union literal instead of widening it
 * to `string`, so `withSeverity('error', ['a', 'b'])` types as
 * `Record<'a' | 'b', 'error'>` and a typo in a rule name is a type error rather
 * than a silently-inert config entry.
 *
 * Lives here rather than `lib/`: jiti gives `eslint/` no `@/` alias.
 */
export function fromEntries<const K extends PropertyKey, const V>(
  entries: ReadonlyArray<readonly [K, V]>,
): Record<K, V> {
  return Object.fromEntries(entries) as Record<K, V>;
}
