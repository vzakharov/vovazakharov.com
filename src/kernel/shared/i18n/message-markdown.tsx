import type { Root } from 'hast';
import type { Components, Options } from 'react-markdown';
import { visit } from 'unist-util-visit';

/**
 * The whole of what a message may carry: emphasis, and the paragraph the parser
 * wraps every message in.
 */
const ALLOWED_TAGS = new Set(['p', 'strong']);

/**
 * Fails the render on anything else a markdown parser would accept — a link, a
 * heading, an image. Without it the allowlist react-markdown offers drops the
 * element and keeps its text, so a message would lose markup silently.
 */
function assertClosedSet(tree: Root) {
  visit(tree, 'element', (node) => {
    if (ALLOWED_TAGS.has(node.tagName)) return;

    throw new Error(
      `Unsupported markup <${node.tagName}> in a message: a message may ` +
        'carry `**emphasis**` and nothing else.',
    );
  });

  // A run the parser could not pair leaves its `**` in the text, where the
  // reader would see the asterisks. Markdown has no unclosed-run error of its
  // own, so the surviving delimiter is the only signal there is.
  visit(tree, 'text', (node) => {
    if (!node.value.includes('**')) return;

    throw new Error(
      `Unpaired \`**\` in a message: ${node.value.trim()}. Emphasis needs ` +
        'both delimiters, and a literal `**` is not supported.',
    );
  });
}

function rehypeClosedSet() {
  return assertClosedSet;
}

/**
 * A message is a fragment inside a `Text`, which renders a `<p>` of its own, so
 * the parser's block wrapper is dropped rather than nested inside it.
 */
const INLINE: Components = { p: ({ children }) => <>{children}</> };

/**
 * How a message with `**emphasis**` in it renders — the CV's profile
 * paragraphs, the one place a message carries inline markup at all.
 *
 * Markdown rather than tags because a catalogue is data, and three renderers
 * read it where only this one interprets markup: the sheet, the `<meta>`
 * description and the Open Graph card. A `<strong>` written into the wrong key
 * reaches a reader as letters, while `**` cannot be mistaken for something the
 * other two would honour.
 */
export const MESSAGE_MARKDOWN = {
  rehypePlugins: [rehypeClosedSet],
  components: INLINE,
} satisfies Partial<Options>;
