import { type Components, toJsxRuntime } from 'hast-util-to-jsx-runtime';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';

import type { WithContentTree } from '@/shared/content';

import { ContentVideo } from './content-video';

/** The tags a component renders instead of the browser's own element. */
const CONTENT_COMPONENTS: Partial<Components> = {
  video: ContentVideo,
};

/**
 * Whatever the markdown pipeline compiled, under the class `prose.scss` styles
 * — an article's body and a song's prose alike.
 */
export function ProseContent({ tree }: WithContentTree) {
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
