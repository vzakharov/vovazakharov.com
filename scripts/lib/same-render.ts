/**
 * Whether two renders of a page say the same thing, which is what lets
 * `render-pdf.ts` keep the committed bytes instead of writing a file that
 * differs only in what the renderer never settles.
 *
 * It lives apart from that script so it can be tested without a browser: the
 * script renders on import, and this is a pure function of two buffers.
 */

/**
 * The two fields a re-render moves on a page that did not change. Fixed-width,
 * so stripping them shifts no byte offset and each normalized file's xref table
 * still describes it.
 */
const RENDER_CLOCK = /\/(?:Creation|Mod)Date \(D:[^)]*\)/g;

/**
 * The names Chromium gives the nodes of a tagged PDF's structure tree. They
 * come off a counter that does not settle between runs — one unchanged page
 * prints `node00000140` on one render and `node00000141` on the next — so a
 * document with a structure tree churns on a re-render that changed nothing.
 * Nothing a reader or a link annotation can reach.
 */
const STRUCTURE_NODES = /node\d{8}/g;

/**
 * Renames each node by the order it first appears, which drops the counter and
 * keeps every alias: which cell cites which header still has to match, because
 * two names equal here are equal there.
 */
function renamedNodes(pdf: string): string {
  const seen = new Map<string, number>();

  return pdf.replaceAll(STRUCTURE_NODES, (name) => {
    const index = seen.get(name) ?? seen.size;

    seen.set(name, index);

    return `node${index}`;
  });
}

/**
 * Only the render's own unsettled parts are discounted, so this settles a
 * same-browser re-render and claims nothing about reproducing one elsewhere —
 * which is why `render-manifest.ts` still decides staleness by hashing sources.
 *
 * `latin1` round-trips arbitrary bytes one-to-one, where `utf8` would not.
 */
export function sameRender(before: Buffer, after: Buffer): boolean {
  const spoken = (pdf: Buffer): string =>
    renamedNodes(pdf.toString('latin1').replaceAll(RENDER_CLOCK, ''));

  return spoken(before) === spoken(after);
}
