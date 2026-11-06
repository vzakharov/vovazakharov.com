import 'server-only';

import type { Nodes, Root } from 'mdast';
// Also what registers the directive nodes on mdast's own union, which is how
// `visit` below narrows them at all.
import type { ContainerDirective, LeafDirective } from 'mdast-util-directive';
import type { Plugin } from 'unified';
import { CONTINUE, SKIP, visit } from 'unist-util-visit';

import { isOneOf } from '@/kernel/shared/lib/collections';
import type { WithFileName } from '@/kernel/shared/typings';

import { WIDGET_CLASS, WIDGET_PROPERTIES } from '../widget-element';

/** The block components a document may author, as `remark-directive` fences. */
const BLOCK_DIRECTIVES = ['pull-quote', 'callout'] as const;

type BlockDirective = (typeof BLOCK_DIRECTIVES)[number];

const isKnown = isOneOf(BLOCK_DIRECTIVES);

/**
 * `repeats` marks a block whose words the reader meets elsewhere in the body —
 * a pull quote — so it is `aria-hidden` and kept out of the reading estimate.
 */
const DIRECTIVES = {
  'pull-quote': { className: 'content-pull-quote', repeats: true },
  callout: { className: 'content-callout', repeats: false },
} satisfies Record<BlockDirective, { className: string; repeats: boolean }>;

/** Whether a node is a block the reading estimate skips, being read twice otherwise. */
export function isRepeatedBlock(node: Nodes): boolean {
  return (
    node.type === 'containerDirective' &&
    isKnown(node.name) &&
    DIRECTIVES[node.name].repeats
  );
}

/** Where the directive turns into the element `prose.scss` styles. */
function convert(node: ContainerDirective, name: BlockDirective) {
  const { className, repeats } = DIRECTIVES[name];

  node.data = {
    ...node.data,
    hName: 'aside',
    hProperties: {
      className: [className],
      ...(repeats && { 'aria-hidden': 'true' }),
    },
  };
}

function textOf(node: Nodes): string {
  const words: string[] = [];

  visit(node, 'text', (text) => {
    words.push(text.value);
  });

  return words.join('').trim();
}

/**
 * A widget's placeholder: a `figure` carrying the directive's name, its
 * attributes, the text of each item its body lists, and the file it was
 * authored in, for the owner's component to parse and name in a throw. The
 * body stays inside as what a reader with no component gets — a feed's.
 */
function convertWidget(
  node: ContainerDirective | LeafDirective,
  fileName: string,
) {
  const items: string[] = [];

  visit(node, 'listItem', (item) => {
    items.push(textOf(item));
  });

  node.data = {
    ...node.data,
    hName: 'figure',
    hProperties: {
      className: [WIDGET_CLASS],
      [WIDGET_PROPERTIES.name]: node.name,
      [WIDGET_PROPERTIES.attributes]: JSON.stringify(node.attributes ?? {}),
      [WIDGET_PROPERTIES.items]: JSON.stringify(items),
      [WIDGET_PROPERTIES.fileName]: fileName,
    },
  };
}

type DirectiveOptions = WithFileName & {
  /** The collection's widget names, `collectionWidgets`'s. */
  widgets: readonly string[];
};

/**
 * A directive neither list names is a silent authoring mistake:
 * `remark-directive` parses `:::pull-quotes` happily and nothing converts it,
 * so it reaches the page as its own text. The file name is what makes the
 * throw actionable — the tree has no idea where it came from.
 */
function convertDirectives({ fileName, widgets }: DirectiveOptions) {
  return (tree: Root) => {
    visit(tree, (node) => {
      if (node.type === 'containerDirective' && isKnown(node.name)) {
        convert(node, node.name);
        return;
      }

      if (
        (node.type === 'containerDirective' || node.type === 'leafDirective') &&
        widgets.includes(node.name)
      ) {
        convertWidget(node, fileName);
        return SKIP;
      }

      if (
        node.type === 'containerDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'textDirective'
      ) {
        throw new Error(
          `${fileName} uses an unknown directive \`${node.name}\`. The directives are: ${[...BLOCK_DIRECTIVES, ...widgets].join(', ')}.`,
        );
      }

      return CONTINUE;
    });
  };
}

export const remarkContentDirectives: Plugin<[DirectiveOptions], Root> =
  convertDirectives;
