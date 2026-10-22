import type { ElementContent, RootContent } from 'hast';
import {
  type Components,
  type Options,
  toJsxRuntime,
} from 'hast-util-to-jsx-runtime';
import type { ReactNode } from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';

import type { WithContentTree } from '@/shared/content';

import { ContentLink } from './content-link';
import { ContentSpan, type SpanElementProps } from './content-span';
import { ContentVideo } from './content-video';

/** The tags a component renders instead of the browser's own element. */
const CONTENT_COMPONENTS: Partial<Components> = {
  a: ContentLink,
  span: (props: SpanElementProps) => <ContentSpan {...props} {...{ render }} />,
  video: ContentVideo,
};

// `passNode`, so a component that reads its element's structure — a note's two
// halves — has it.
const OPTIONS: Options = {
  Fragment,
  jsx,
  jsxs,
  components: CONTENT_COMPONENTS,
  passNode: true,
};

function render(children: RootContent[] | ElementContent[]): ReactNode {
  return <>{toJsxRuntime({ type: 'root', children }, OPTIONS)}</>;
}

type ProseContentProps = WithContentTree & {
  /** Rendered after the body's first paragraph, or first in a body with none. */
  afterLead?: ReactNode;
};

/**
 * Whatever the markdown pipeline compiled, under the class `prose.scss` styles
 * — an article's body and a song's prose alike.
 */
export function ProseContent({ tree, afterLead }: ProseContentProps) {
  const split =
    tree.children.findIndex(
      (node) => node.type === 'element' && node.tagName === 'p',
    ) + 1;

  // `prose-content` sits on the element holding the body, so that
  // `prose-content > h1` keys the part dividers off direct children. Both
  // halves render as fragments, so `afterLead` is a direct child as well.
  return (
    <div className="prose-content">
      {render(tree.children.slice(0, split))}
      {afterLead}
      {render(tree.children.slice(split))}
    </div>
  );
}
