/**
 * Domains a printed page must not carry as text or as a link, because
 * LinkedIn's document upload rejects a PDF that names one: the upload reports
 * "0 pages" and gives no reason. The page still shows them; print paints each
 * mention as an image, under the `print-raster` class, which leaves neither
 * text nor a link annotation in the PDF.
 */
export const PRINT_RASTER_DOMAINS: readonly string[] = [
  'paindirection.pages.dev',
];

const MENTION = new RegExp(
  PRINT_RASTER_DOMAINS.map((domain) =>
    domain.replaceAll('.', String.raw`\.`),
  ).join('|'),
  'gi',
);

export function mentionsPrintRasterDomain(text: string): boolean {
  return text.match(MENTION) !== null;
}

/** A run of text, and whether it is a mention print has to rasterize. */
type TextRun = { text: string; raster: boolean };

/** Cuts text into runs, each mention a run of its own. */
export function splitOnPrintRasterDomains(text: string): TextRun[] {
  const runs: TextRun[] = [];
  let from = 0;

  for (const match of text.matchAll(MENTION)) {
    if (match.index > from) {
      runs.push({ text: text.slice(from, match.index), raster: false });
    }

    runs.push({ text: match[0], raster: true });
    from = match.index + match[0].length;
  }

  if (from < text.length) runs.push({ text: text.slice(from), raster: false });

  return runs;
}
