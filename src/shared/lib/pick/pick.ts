/**
 * A subset of an object, named once. `{...pick(printed, 'href')}` is what
 * `vova/no-redundant-property-copy` asks for where `href={printed.href}`
 * spells the key on both sides.
 *
 * The implementation signature is the untyped half of the overload on purpose:
 * no object literal is assignable to a generic `Pick<T, K>`, so the alternative
 * is an assertion that narrows.
 */
export function pick<T extends object, K extends keyof T>(
  source: T,
  ...keys: K[]
): Pick<T, K>;
export function pick(source: Record<string, unknown>, ...keys: string[]) {
  return Object.fromEntries(keys.map((key) => [key, source[key]]));
}
