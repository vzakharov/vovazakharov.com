import { Fragment, type ReactNode } from 'react';

/**
 * A message with markup in it, `{name}` marking where each of `slots` goes —
 * a link, say, whose text is a message of its own. A catalogue holds no tags,
 * so this is how a sentence with a link in it stays one translatable string.
 * A placeholder with no slot, or a slot with no placeholder, throws.
 */
export function fillSlots(
  message: string,
  slots: Record<string, ReactNode>,
): ReactNode[] {
  const parts = message.split(/{(\w+)}/);
  const used = new Set<string>();

  const nodes = parts.map((part, index) => {
    // `split` with a capturing group puts each placeholder's name at an odd index.
    if (index % 2 === 0) return part;

    if (!(part in slots)) {
      throw new Error(`“${message}” has a {${part}} no slot fills.`);
    }

    used.add(part);

    return <Fragment key={index}>{slots[part]}</Fragment>;
  });

  const unused = Object.keys(slots).filter((name) => !used.has(name));

  if (unused.length > 0) {
    throw new Error(`“${message}” has no place for {${unused.join('}, {')}}.`);
  }

  return nodes;
}
