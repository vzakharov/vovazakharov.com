import type { RootContent } from 'hast';
import { type Components, toJsxRuntime } from 'hast-util-to-jsx-runtime';
import type { ReactNode } from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';

import type { WithContentTree } from '@/shared/content';

import { ContentVideo } from './content-video';

/** The tags a component renders instead of the browser's own element. */
const CONTENT_COMPONENTS: Partial<Components> = {
  video: ContentVideo,
};

type ProseContentProps = WithContentTree & {
  /** Rendered after the body's first paragraph, or first in a body with none. */
  afterLead?: ReactNode;
};

/**
 * Whatever the markdown pipeline compiled, under the class `prose.scss` styles
 * — an article's body and a song's prose alike.
 */
export function ProseContent({ tree, afterLead }: ProseContentProps) {
  const half = (children: RootContent[]) => ({ ...tree, children });
  const options = { Fragment, jsx, jsxs, components: CONTENT_COMPONENTS };
  const split =
    tree.children.findIndex(
      (node) => node.type === 'element' && node.tagName === 'p',
    ) + 1;

  // `prose-content` sits on the element holding the body, so that
  // `prose-content > h1` keys the part dividers off direct children. Both
  // halves render as fragments, so `afterLead` is a direct child as well.
  return (
    <div className="prose-content">
      {toJsxRuntime(half(tree.children.slice(0, split)), options)}
      {afterLead}
      {toJsxRuntime(half(tree.children.slice(split)), options)}
    </div>
  );
}
