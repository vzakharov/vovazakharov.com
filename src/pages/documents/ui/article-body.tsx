import { type Components, toJsxRuntime } from 'hast-util-to-jsx-runtime';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';

import { CONTENT_VIDEO, type WithContentTree } from '@/shared/content';

import { ContentVideo } from './content-video';

/** What each of the pipeline's marker tags renders as. */
const CONTENT_COMPONENTS: Partial<Components> = {
  [CONTENT_VIDEO]: ContentVideo,
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
