import { type Components, toJsxRuntime } from 'hast-util-to-jsx-runtime';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';

import type { WithContentTree } from '@/shared/content';

import { ContentVideo } from './content-video';

/** The tags a component renders instead of the browser's own element. */
const CONTENT_COMPONENTS: Partial<Components> = {
  video: ContentVideo,
};

export function ArticleBody({ tree }: WithContentTree) {
  // `prose-content` sits on the element holding the body, so that
  // `prose-content > h1` keys the part dividers off direct children.
  return (
    <div className="prose-content">
      {toJsxRuntime(tree, {
        Fragment,
        jsx,
        jsxs,
        components: CONTENT_COMPONENTS,
      })}
    </div>
  );
}
