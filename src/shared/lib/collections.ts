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
