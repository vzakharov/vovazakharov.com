import type { Element, ElementContent } from 'hast';
import type { ExtraProps } from 'hast-util-to-jsx-runtime';
import type { ComponentProps, ReactNode } from 'react';

import { NotedSpan } from '@/shared/ui';

/** What the hast renderer hands a `span` component. */
export type SpanElementProps = ComponentProps<'span'> & ExtraProps;

type ContentSpanProps = SpanElementProps & {
  /** Renders hast the way the rest of the document is rendered. */
  render: (children: ElementContent[]) => ReactNode;
};

function childrenOf(node: ElementContent | undefined): ElementContent[] {
  return node?.type === 'element' ? node.children : [];
}

function isNote({ properties }: Element): boolean {
  return properties['dataContentNote'] !== undefined;
}

/**
 * Every `<span>` a document holds: the one `rehypeFootnoteNotes` makes out of a
 * phrase and its note — its two children, in that order — opens as a popover;
 * any other renders as itself.
 */
export function ContentSpan({
  node,
  render,
  children,
  ...props
}: ContentSpanProps) {
  if (node === undefined || !isNote(node)) {
    return <span {...props}>{children}</span>;
  }

  const [words, note] = node.children;

  return (
    <NotedSpan words={render(childrenOf(words))}>
      {render(childrenOf(note))}
    </NotedSpan>
  );
}
