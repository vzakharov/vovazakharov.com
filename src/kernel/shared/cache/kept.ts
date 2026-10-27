/** What `keptIn` reads and writes: a `Map` or a `WeakMap`. */
type Keeping<K, V> = {
  get: (key: K) => V | undefined;
  set: (key: K, value: V) => unknown;
};

/**
 * The value `cache` keeps for `key`, made by `make` and kept there the first
 * time it is asked for. A kept `undefined` is no value, so it is made again.
 */
export function keptIn<K, V>(
  cache: Keeping<K, V>,
  key: K,
  make: (key: K) => V,
): V {
  const kept = cache.get(key);
  if (kept !== undefined) return kept;
  const made = make(key);
  cache.set(key, made);
  return made;
}
