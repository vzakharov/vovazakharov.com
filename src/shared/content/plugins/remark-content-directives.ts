import 'server-only';

import type { Root } from 'mdast';
// Also what registers the directive nodes on mdast's own union, which is how
// `visit` below narrows them at all.
import type { ContainerDirective } from 'mdast-util-directive';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

/**
 * The block components a document may author, as `remark-directive` fences. A
 * pull quote repeats a sentence the reader is about to meet or has just met,
 * so it is `aria-hidden` and `render.ts` keeps its words out of the reading
 * estimate.
 */
const BLOCK_DIRECTIVES = {
  'pull-quote': 'content-pull-quote',
} as const;

type BlockDirective = keyof typeof BLOCK_DIRECTIVES;

function isKnown(name: string): name is BlockDirective {
  return name in BLOCK_DIRECTIVES;
}

/** Where the directive turns into the element `prose.scss` styles. */
function convert(node: ContainerDirective, name: BlockDirective) {
  node.data = {
    ...node.data,
    hName: 'aside',
    hProperties: {
      className: [BLOCK_DIRECTIVES[name]],
      'aria-hidden': 'true',
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
          `${fileName} uses an unknown directive \`${node.name}\`. The block directives are: ${Object.keys(BLOCK_DIRECTIVES).join(', ')}.`,
        );
      }
    });
  };
}

export const remarkContentDirectives: Plugin<[string], Root> =
  convertDirectives;
