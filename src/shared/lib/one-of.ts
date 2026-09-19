/**
 * Whether a value is one of the listed literals. The list is widened to
 * `readonly string[]` before `.includes()` because a literal tuple's own
 * `includes` accepts only a member, which is the one thing a caller cannot
 * promise.
 */
export const isOneOf =
  <const T extends readonly string[]>(values: T) =>
  (value: unknown): value is T[number] =>
    typeof value === 'string' && (values as readonly string[]).includes(value);

/**
 * The same check as a parse: the value, or a throw naming what was being read.
 * The subject is the caller's word for it — an environment variable, a route
 * segment — because the reader is whoever supplied the bad value.
 */
export function oneOf<const T extends readonly string[]>(
  values: T,
  value: unknown,
  subject: string,
): T[number] {
  if (!isOneOf(values)(value)) {
    throw new Error(
      `${subject} must be one of ${values.join(', ')}, not ${String(value)}`,
    );
  }

  return value;
}
