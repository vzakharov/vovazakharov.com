/**
 * Kept out of `read-collection.ts`, whose gray-matter and `server-only`
 * imports the test runner cannot load.
 */

const TITLE = /^# (.+)$/m;

/** The body's first `# ` heading, which is the page's title. Throws where there is none. */
export function headingTitle(body: string, file: string): string {
  const title = TITLE.exec(body)?.[1]?.trim();

  if (title === undefined) {
    throw new Error(`A document without a "# " title: ${file}`);
  }

  return title;
}
