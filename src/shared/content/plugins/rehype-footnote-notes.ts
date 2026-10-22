import type { Element, ElementContent, Root } from 'hast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

type FootnoteNotesOptions = { fileName: string };

/** The prefix `remark-rehype` clobbers a footnote's id with. */
const DEFINITION_ID = 'user-content-fn-';

function addClass(node: Element, className: string): void {
  const current = node.properties.className;
  const classes = Array.isArray(current) ? current : [];

  node.properties.className = [...classes, className];
}

function isElement(node: ElementContent, tagName: string): node is Element {
  return node.type === 'element' && node.tagName === tagName;
}

/** The label a `sup > a[data-footnote-ref]` points at, or nothing for any other node. */
function referencedLabel(node: ElementContent): string | undefined {
  if (!isElement(node, 'sup')) return undefined;

  const [link] = node.children;

  if (link === undefined || !isElement(link, 'a')) return undefined;
  if (link.properties['dataFootnoteRef'] === undefined) return undefined;

  const { href } = link.properties;

  return typeof href === 'string' && href.startsWith(`#${DEFINITION_ID}`)
    ? href.slice(DEFINITION_ID.length + 1)
    : undefined;
}

/** The sibling holding a phrase's opening `[`, and that bracket's offset in it. */
type PhraseStart = { index: number; offset: number };

/**
 * Where the phrase `[…]` before a reference at `at` begins: the sibling whose
 * text holds its `[`, and the offset of that bracket. Brackets inside an
 * element — a link's, an emphasis' — are the element's own, so only text
 * siblings are read.
 */
function phraseStart(
  siblings: ElementContent[],
  at: number,
): PhraseStart | undefined {
  const closing = siblings[at - 1];

  if (closing?.type !== 'text' || !closing.value.endsWith(']'))
    return undefined;

  for (let index = at - 1; index >= 0; index--) {
    const node = siblings[index];

    if (node?.type !== 'text') continue;

    const text = index === at - 1 ? node.value.slice(0, -1) : node.value;
    const offset = text.lastIndexOf('[');

    if (offset !== -1) return { index, offset };
  }

  return undefined;
}

/** The siblings from `start` up to the reference, their brackets cut off. */
function phraseWords(
  siblings: ElementContent[],
  { index, offset }: PhraseStart,
  at: number,
): ElementContent[] {
  const words = structuredClone(siblings.slice(index, at));
  const first = words[0];
  const last = words.at(-1);

  if (first?.type === 'text') first.value = first.value.slice(offset + 1);
  if (last?.type === 'text') last.value = last.value.slice(0, -1);

  return words.filter((node) => node.type !== 'text' || node.value !== '');
}

/**
 * A definition's paragraphs, each a block-set `span`, its backref dropped. A
 * note sits inside the paragraph that carries its phrase, so it holds phrasing
 * content alone — any other block would close that paragraph in the browser's
 * parser and tear the page apart at hydration.
 */
function noteBody(
  definition: Element,
  label: string,
  fileName: string,
): Element[] {
  const paragraphs = definition.children.filter(
    (node) => node.type !== 'text' || node.value.trim() !== '',
  );

  return paragraphs.map((paragraph): Element => {
    if (paragraph.type !== 'element' || paragraph.tagName !== 'p') {
      const what =
        paragraph.type === 'element' ? `a <${paragraph.tagName}>` : 'a block';

      throw new Error(
        `${fileName}: the note [^${label}] holds ${what}; a note on a phrase sits inside a paragraph, so it takes paragraphs only.`,
      );
    }

    const children = structuredClone(paragraph.children).filter(
      (node) =>
        node.type !== 'element' ||
        node.properties['dataFootnoteBackref'] === undefined,
    );
    const last = children.at(-1);

    if (last?.type === 'text') last.value = last.value.trimEnd();

    return {
      type: 'element',
      tagName: 'span',
      properties: { className: ['content-note-paragraph'] },
      children,
    };
  });
}

function definitionsOf(tree: Root): Map<string, Element> {
  const definitions = new Map<string, Element>();

  visit(tree, 'element', (node: Element) => {
    const id = node.properties.id;

    if (
      node.tagName === 'li' &&
      typeof id === 'string' &&
      id.startsWith(DEFINITION_ID)
    ) {
      definitions.set(id.slice(DEFINITION_ID.length), node);
    }
  });

  return definitions;
}

/**
 * `[phrase][^label]` — the lyrics' syntax for a note on a phrase, which GFM
 * reads as the phrase in brackets and a footnote after it — becomes a
 * `span[data-content-note]` holding the phrase and the note, which
 * `ContentSpan` opens as a popover. The footnote stays, screen-hidden: the
 * reference number and the definition are what paper shows in the popover's
 * place. A bare `[^label]` is an ordinary footnote and is left as one.
 */
export const rehypeFootnoteNotes: Plugin<[FootnoteNotesOptions], Root> =
  ({ fileName }) =>
  (tree: Root) => {
    const definitions = definitionsOf(tree);
    const phrased = new Set<string>();
    const bare = new Set<string>();

    visit(tree, 'element', (parent: Element) => {
      const siblings = parent.children;

      for (let at = 0; at < siblings.length; at++) {
        const reference = siblings[at];

        if (reference?.type !== 'element') continue;

        const label = referencedLabel(reference);

        if (label === undefined) continue;

        const start = phraseStart(siblings, at);
        const definition = definitions.get(label);

        if (start === undefined || definition === undefined) {
          bare.add(label);
          continue;
        }

        const note: Element = {
          type: 'element',
          tagName: 'span',
          properties: { dataContentNote: label },
          children: [
            {
              type: 'element',
              tagName: 'span',
              properties: {},
              children: phraseWords(siblings, start, at),
            },
            {
              type: 'element',
              tagName: 'span',
              properties: {},
              children: noteBody(definition, label, fileName),
            },
          ],
        };
        const head = siblings[start.index];
        const before =
          head?.type === 'text' && start.offset > 0
            ? [{ ...head, value: head.value.slice(0, start.offset) }]
            : [];

        addClass(reference, 'content-note-ref');
        siblings.splice(
          start.index,
          at + 1 - start.index,
          ...before,
          note,
          reference,
        );
        at = start.index + before.length + 1;
        phrased.add(label);
      }
    });

    const printedOnly = [...definitions].filter(
      ([label]) => phrased.has(label) && !bare.has(label),
    );

    // Numbered by hand, or the items a screen hides would renumber the ones
    // it still shows.
    for (const [index, definition] of [...definitions.values()].entries()) {
      definition.properties['value'] = String(index + 1);
    }

    for (const [, definition] of printedOnly) {
      addClass(definition, 'content-note-definition');
    }

    if (printedOnly.length === 0 || printedOnly.length < definitions.size) {
      return;
    }

    visit(tree, 'element', (node: Element) => {
      if (node.properties['dataFootnotes'] !== undefined) {
        addClass(node, 'content-notes-printed');
      }
    });
  };
