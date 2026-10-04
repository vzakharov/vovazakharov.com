import 'server-only';

import type { Nodes, Root } from 'mdast';
// Also what registers the directive nodes on mdast's own union, which is how
// `visit` below narrows them at all.
import type { ContainerDirective } from 'mdast-util-directive';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

import { isOneOf } from '@/shared/lib/collections';

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

/**
 * A directive the list above does not name is a silent authoring mistake:
 * `remark-directive` parses `:::pull-quotes` happily and nothing converts it,
 * so it reaches the page as its own text. The file name is what makes the
 * throw actionable — the tree has no idea where it came from.
 */
function convertDirectives(fileName: string) {
  return (tree: Root) => {
    visit(tree, (node) => {
      if (node.type === 'containerDirective' && isKnown(node.name)) {
        convert(node, node.name);
        return;
      }

      if (
        node.type === 'containerDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'textDirective'
      ) {
        throw new Error(
          `${fileName} uses an unknown directive \`${node.name}\`. The block directives are: ${BLOCK_DIRECTIVES.join(', ')}.`,
        );
      }
    });
  };
}

export const remarkContentDirectives: Plugin<[string], Root> =
  convertDirectives;
