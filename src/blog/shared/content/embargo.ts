/**
 * No `import 'server-only'`: a pure predicate and an environment read, which
 * the suite runs outside any bundler.
 */

/** `YYYY-MM-DD`, as frontmatter writes a day. */
const DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * The day a build publishes as of: `CONTENT_AS_OF` where set, so a preview can
 * show a post before its date, and the build machine's UTC day otherwise.
 */
export function publishingDay(
  env: Partial<Record<string, string>> = process.env,
): string {
  const asOf = env['CONTENT_AS_OF'];

  if (asOf === undefined || asOf === '') {
    return new Date().toISOString().slice(0, 10);
  }

  if (!DAY.test(asOf)) {
    throw new Error(`CONTENT_AS_OF is ${asOf}, not a YYYY-MM-DD day.`);
  }

  return asOf;
}

/**
 * Whether a document dated `date` is out by `day`. A date-only frontmatter
 * value parses as UTC midnight, so its UTC day is the day the author wrote.
 */
export function isReleased(date: Date, day: string): boolean {
  return date.toISOString().slice(0, 10) <= day;
}
