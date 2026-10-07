/**
 * How many pages a PDF that Chromium printed holds, read without a PDF library.
 *
 * Counts the page tree's leaves — the `/Type /Page` objects — which holds for
 * Chromium's output because it writes every object in the clear, never packed
 * into a compressed object stream. A PDF that does pack them would read as
 * zero pages, so a zero is thrown rather than reported.
 */
export function pdfPageCount(pdf: Buffer, label: string): number {
  const pages = pdf.toString('latin1').match(/\/Type\s*\/Page(?![A-Za-z])/g);

  if (pages === null) {
    throw new Error(`${label} has no readable page objects.`);
  }

  return pages.length;
}
