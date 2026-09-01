import 'server-only';

import fs from 'node:fs';
import path from 'node:path';
import type { Element, Root } from 'hast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

import { PUBLIC_DIR } from '../collections';
import { MERMAID_DIR, mermaidFileName, mermaidHash } from '../mermaid-hash.mjs';

const THEMES = ['light', 'dark'] as const;

function fenceSource(pre: Element): string | undefined {
  const code = pre.children.find(
    (child): child is Element =>
      child.type === 'element' && child.tagName === 'code'
  );

  const classes = code?.properties.className;
  const isMermaid =
    Array.isArray(classes) && classes.includes('language-mermaid');

  if (!isMermaid) return undefined;

  return code!.children
    .map((child) => (child.type === 'text' ? child.value : ''))
    .join('');
}

/**
 * Mermaid's own accessibility directives, which the fence carries and the
 * renderer puts inside the SVG. An `<img>` hides the SVG's internals from
 * assistive technology, so they are lifted onto `alt` here instead.
 */
function accessibleDescription(source: string): string | undefined {
  const braced = source.match(/^\s*accDescr\s*\{([\s\S]*?)\}/m);
  if (braced) return braced[1].trim().replace(/\s+/g, ' ');

  const inline = source.match(/^\s*acc(?:Descr|Title)\s*:\s*(.+)$/m);
  return inline?.[1].trim();
}

function renderUrl(hash: string, theme: (typeof THEMES)[number]): string {
  const fileName = mermaidFileName(hash, theme);
  const filePath = path.join(PUBLIC_DIR, MERMAID_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    throw new Error(
      `No ${theme} Mermaid render for fence ${hash}. Run \`pnpm content:mermaid\` ` +
        `and commit the SVGs under public/${MERMAID_DIR}/.`
    );
  }

  return `/${MERMAID_DIR}/${fileName}`;
}

function diagramElement(hash: string, source: string): Element {
  const alt = accessibleDescription(source);

  if (!alt) {
    throw new Error(
      `Mermaid fence ${hash} has no accessible description. Add an ` +
        `\`accDescr: …\` line to the fence — Mermaid renders it into the SVG, ` +
        `and it becomes the diagram's alt text on the site.`
    );
  }

  return {
    type: 'element',
    tagName: 'figure',
    properties: { className: ['content-mermaid'] },
    children: THEMES.map((theme) => ({
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
export const rehypeMermaid: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName !== 'pre' || index === undefined || !parent) return;

      const source = fenceSource(node);
      if (source === undefined) return;

      parent.children[index] = diagramElement(mermaidHash(source), source);
    });
  };
};
