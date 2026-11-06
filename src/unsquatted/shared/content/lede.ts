/**
 * No `import 'server-only'`: pure functions the render script and the suite
 * read.
 */

/** A run of a lede's words, `_…_` in the source marking one set in italics. */
export type LedeSpan = { text: string; italic: boolean };

/** A lede cut at its `_…_` marks, as markdown reads them. */
export function ledeSpans(lede: string): LedeSpan[] {
  return lede
    .split(/_([^_]+)_/)
    .map((text, index) => ({ text, italic: index % 2 === 1 }))
    .filter(({ text }) => text !== '');
}

/** The lede's words with its marks dropped: what a meta tag or a feed carries. */
export function plainLede(lede: string): string {
  return ledeSpans(lede)
    .map(({ text }) => text)
    .join('');
}
