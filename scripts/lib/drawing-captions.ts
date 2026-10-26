/**
 * A drawing's words in another language, swapped in over the original's. The
 * drawing is authored once, in its original's language; what a translation
 * changes is its `<text>` elements and its `aria-label`, each looked up whole in
 * a dictionary from the original's wording to the translation's. A `<text>`
 * carrying `translate="no"` is part of the picture — a letter on a typeball —
 * and stays as drawn.
 *
 * Bare Node runs this file.
 */

/** Original wording → translated wording, as a translation's frontmatter states it. */
export type Captions = Record<string, string>;

const TEXT = /(<text\b([^>]*)>)([^<]*)(<\/text>)/g;

const LABEL = /(<svg\b[^>]*\baria-label=")([^"]*)(")/;

/**
 * `svg` with every caption translated. Throws on a caption the dictionary
 * lacks, which is how an edit to the original's wording surfaces, and on an
 * entry nothing in the drawing says any more.
 */
export function translateDrawing(svg: string, captions: Captions): string {
  const missing: string[] = [];
  const used = new Set<string>();

  const lookUp = (wording: string): string => {
    const translated = captions[wording];

    if (translated === undefined) {
      missing.push(wording);

      return wording;
    }

    used.add(wording);

    return translated;
  };

  const translated = svg
    .replaceAll(
      TEXT,
      (
        whole,
        open: string,
        attributes: string,
        wording: string,
        close: string,
      ) =>
        /\btranslate="no"/.test(attributes)
          ? whole
          : `${open}${lookUp(wording)}${close}`,
    )
    .replace(
      LABEL,
      (_whole, before: string, label: string, after: string) =>
        `${before}${lookUp(label)}${after}`,
    );

  const unused = Object.keys(captions).filter((wording) => !used.has(wording));
  const problems = [
    ...missing.map((wording) => `no translation for “${wording}”`),
    ...unused.map((wording) => `“${wording}” is not in the drawing`),
  ];

  if (problems.length > 0) throw new Error(problems.join('; '));

  return translated;
}
