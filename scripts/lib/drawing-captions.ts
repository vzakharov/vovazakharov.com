/**
 * A drawing in one language: the template, `assets/<name>.svg`, drawn once with
 * a `{{key}}` placeholder wherever it says something in words — in a `<text>`
 * or in its `aria-label` alike — and each language's post naming the wording
 * for every key. Whatever is not a placeholder is part of the picture, and
 * reads the same in every language: a Latin name, a letter on a typeball.
 *
 * Bare Node runs this file.
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

/** Whether `svg` is a template, with a placeholder to fill. */
export function isDrawingTemplate(svg: string): boolean {
  return /{{[\w-]+}}/.test(svg);
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

    return wording.replaceAll(/["&<>]/g, (char) => XML_ESCAPES[char] ?? char);
  });

  const unused = Object.keys(captions).filter((key) => !used.has(key));
  const problems = [
    ...[...missing].map((key) => `no wording for {{${key}}}`),
    ...unused.map((key) => `{{${key}}} is not in the drawing`),
  ];

  if (problems.length > 0) throw new Error(problems.join('; '));

  return filled;
}
