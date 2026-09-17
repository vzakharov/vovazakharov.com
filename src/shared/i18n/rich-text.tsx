import type { ReactNode } from 'react';

const EMPHASIS = /<strong>([\S\s]*?)<\/strong>/g;

const ANY_TAG = /<[^>]+>/;

/**
 * A message with its `<strong>` spans as nodes — the CV's profile paragraphs,
 * where emphasis falls mid-sentence. Bullets carry their bold lead as
 * structured fields instead, so this is the only place inline markup appears,
 * and `<strong>` is the whole of what a message may carry: any other tag throws
 * rather than reaching a reader as literal `<em>`.
 *
 * Not the markdown pipeline `src/shared/content/` already runs, because the
 * closed set is the point. A markdown renderer accepts links, images and
 * headings, so it would widen what a message is allowed to do without anyone
 * deciding to, and it returns blocks where these are fragments inside a `Text`.
 */
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
