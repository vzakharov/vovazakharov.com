import { Group, type GroupProps } from '@mantine/core';
import { Fragment, type ReactNode } from 'react';

export type FactLineProps = GroupProps & {
  /** Keyed facts, or plain strings that key themselves; an empty one drops out. */
  facts: Record<string, ReactNode> | readonly string[];
};

/** `Array.isArray` narrows a readonly array to `any[]`. */
function isList(facts: FactLineProps['facts']): facts is readonly string[] {
  return Array.isArray(facts);
}

/** Facts set apart by a `·` with room on either side, wrapping between them. */
export function FactLine({ facts, ...props }: FactLineProps) {
  const entries = isList(facts)
    ? facts.map((fact) => [fact, fact] as const)
    : Object.entries(facts);

  return (
    <Group component="p" gap={12} wrap="wrap" {...props}>
      {entries
        .filter(([, fact]) => Boolean(fact))
        .map(([key, fact], index) => (
          <Fragment key={key}>
            {index > 0 && <span aria-hidden>·</span>}
            <span>{fact}</span>
          </Fragment>
        ))}
    </Group>
  );
}

/** A catalogue's or a release's size, a lighter gray than the facts about it. */
export function SizeLine({
  size,
  ...props
}: GroupProps & { size: readonly string[] }) {
  return <FactLine facts={size} fz="sm" opacity={0.55} {...props} />;
}
