/**
 * A drawing in one language: the template, `assets/<name>.svg`, drawn once with
 * a `{{key}}` placeholder wherever it says something in words — in a `<text>`
 * or in its `aria-label` alike — and each language's post naming the wording
 * for every key. Whatever is not a placeholder is part of the picture, and
 * reads the same in every language: a Latin name, a letter on a typeball.
 */

/** Key → wording, as one language's post states it under `captions`. */
export type Captions = Record<string, string>;

const PLACEHOLDER = /{{([\w-]+)}}/g;

const XML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

function escapeXml(text: string): string {
  return text.replaceAll(/["&<>]/g, (char) => XML_ESCAPES[char] ?? char);
}

const VIEW_BOX = /<svg\b[^>]*\bviewBox="(?:[\d.]+ ){2}([\d.]+) ([\d.]+)"/;

/** How far the mark sits from the drawing's bottom-right corner, in its units. */
const MARK_INSET = 10;

/**
 * `svg` with `mark` — the site's domain — set small and grey in its
 * bottom-right corner, so no template draws its own and a move of the site
 * re-signs every drawing. Throws on a drawing with no `viewBox` to place it by.
 */
export function signDrawing(svg: string, mark: string): string {
  const size = VIEW_BOX.exec(svg);

  if (size === null) throw new Error('no viewBox to place the mark by');

  const x = Number(size[1]) - MARK_INSET;
  const y = Number(size[2]) - MARK_INSET;
  const text = `<text x="${x}" y="${y}" text-anchor="end" font-family="Georgia, 'Times New Roman', serif" font-size="13" fill="#2b2622" opacity="0.55">${escapeXml(mark)}</text>`;
  const signed = svg.replace(/<\/svg>\s*$/, `${text}\n</svg>\n`);

  if (signed === svg) throw new Error('no closing </svg> to sign before');

  return signed;
}

/** Whether `svg` is a template, with a placeholder to fill. */
export function isDrawingTemplate(svg: string): boolean {
  // `search`, not `test`: it ignores the global flag's `lastIndex`.
  return svg.search(PLACEHOLDER) !== -1;
}

/**
 * `template` with every placeholder filled. Throws on a key the captions lack
 * and on an entry no placeholder uses, so the two languages cannot drift onto
 * different sets of words.
 */
export function fillDrawing(template: string, captions: Captions): string {
  const missing = new Set<string>();
  const used = new Set<string>();

  const filled = template.replaceAll(PLACEHOLDER, (whole, key: string) => {
    const wording = captions[key];

    if (wording === undefined) {
      missing.add(key);

      return whole;
    }

    used.add(key);

    return escapeXml(wording);
  });

  const unused = Object.keys(captions).filter((key) => !used.has(key));
  const problems = [
    ...[...missing].map((key) => `no wording for {{${key}}}`),
    ...unused.map((key) => `{{${key}}} is not in the drawing`),
  ];

  if (problems.length > 0) throw new Error(problems.join('; '));

  return filled;
}
