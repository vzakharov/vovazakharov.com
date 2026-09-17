import type { ReactNode } from 'react';

/**
 * The emphasis a catalogue string may carry, as the nodes that render it.
 *
 * `<strong>` is the whole of the markup the catalogues are allowed — bullets
 * carry their bold lead as structured fields instead, so this covers the running
 * prose where emphasis falls mid-sentence. Any other tag throws: a catalogue is
 * rendered, never sanitized, and silently printing `<em>` as text would put
 * markup in front of a reader.
 */
const EMPHASIS = /<strong>([\S\s]*?)<\/strong>/g;

const ANY_TAG = /<[^>]+>/;

export function richText(copy: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const plain: string[] = [];
  let cursor = 0;

  for (const { 0: whole, 1: emphasized, index } of copy.matchAll(EMPHASIS)) {
    plain.push(copy.slice(cursor, index));
    nodes.push(
      copy.slice(cursor, index),
      <strong key={index}>{emphasized}</strong>,
    );
    cursor = index + whole.length;
  }

  plain.push(copy.slice(cursor));
  nodes.push(copy.slice(cursor));

  const stray = ANY_TAG.exec(plain.join(''));

  if (stray !== null) {
    throw new Error(
      `Unsupported markup ${stray[0]} in a message: \`richText\` renders ` +
        `<strong> only. Message was: ${copy}`,
    );
  }

  return nodes.filter((node) => node !== '');
}
