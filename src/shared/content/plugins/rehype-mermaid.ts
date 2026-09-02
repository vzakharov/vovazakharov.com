import 'server-only';

import type { Element, Root } from 'hast';
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

import { PUBLIC_DIR } from '../collections';
import { contentHash } from '../content-hash.ts';
import {
  COLOR_SCHEMES,
  type ColorScheme,
  MERMAID_DIR,
  mermaidFileName,
} from '../mermaid-renders.ts';

export type RehypeMermaidOptions = {
  /** Absolute URL of the authored markdown, appended to every diagram's `alt`. */
  sourceUrl: string;
};

function fenceSource(pre: Element): string | undefined {
  const code = pre.children.find(
    (child): child is Element =>
      child.type === 'element' && child.tagName === 'code',
  );

  if (!code) return undefined;

  const classes = code.properties.className;

  if (!Array.isArray(classes) || !classes.includes('language-mermaid'))
    return undefined;

  return code.children
    .map((child) => (child.type === 'text' ? child.value : ''))
    .join('');
}

/**
 * Mermaid's own accessibility directives, which the fence carries and the
 * renderer puts inside the SVG. An `<img>` hides the SVG's internals from
 * assistive technology, so they are lifted onto `alt` here instead.
 */
function accessibleDescription(source: string): string | undefined {
  const braced = /^\s*accDescr\s*{([\S\s]*?)}/m.exec(source);
  if (braced?.[1] !== undefined)
    return braced[1].trim().replaceAll(/\s+/g, ' ');

  const inline = /^\s*acc(?:Descr|Title)\s*:\s*(.+)$/m.exec(source);
  return inline?.[1]?.trim();
}

function renderUrl(hash: string, theme: ColorScheme): string {
  const fileName = mermaidFileName(hash, theme);
  const filePath = path.join(PUBLIC_DIR, MERMAID_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    throw new Error(
      `No ${theme} Mermaid render for fence ${hash}. Run \`pnpm content:mermaid\` ` +
        `and commit the SVGs under public/${MERMAID_DIR}/.`,
    );
  }

  return `/${MERMAID_DIR}/${fileName}`;
}

function diagramElement(
  hash: string,
  source: string,
  sourceUrl: string,
): Element {
  const description = accessibleDescription(source);

  if (description === undefined || description.length === 0) {
    throw new Error(
      `Mermaid fence ${hash} has no accessible description. Add an ` +
        `\`accDescr: …\` line to the fence — Mermaid renders it into the SVG, ` +
        `and it becomes the diagram's alt text on the site.`,
    );
  }

  // The Mermaid source stays in the markdown and never reaches the page, so
  // the alt points at the file — a reader that cannot see the image, human or
  // machine, can still get to the fence the diagram was drawn from.
  const alt = `${description} Mermaid source: ${sourceUrl}`;

  return {
    type: 'element',
    tagName: 'figure',
    properties: { className: ['content-mermaid'] },
    children: COLOR_SCHEMES.map((theme) => ({
      type: 'element' as const,
      tagName: 'img',
      properties: {
        src: renderUrl(hash, theme),
        alt,
        className: [`content-mermaid-${theme}`],
        loading: 'lazy',
        decoding: 'async',
      },
      children: [],
    })),
  };
}

/**
 * Swaps each `mermaid` fence for its two committed renders, one per theme, and
 * fails the build when a fence has no render — the diagrams cannot silently
 * drift from their source. The markdown keeps the fence, so GitHub still draws
 * the diagram itself, and the page ships no diagram JavaScript.
 */
export const rehypeMermaid: Plugin<[RehypeMermaidOptions], Root> = ({
  sourceUrl,
}) => {
  return (tree) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName !== 'pre' || index === undefined || !parent) return;

      const source = fenceSource(node);
      if (source === undefined) return;

      parent.children[index] = diagramElement(
        contentHash(source),
        source,
        sourceUrl,
      );
    });
  };
};
