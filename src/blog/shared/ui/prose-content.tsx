import type { RootContent } from 'hast';
import { type Components, toJsxRuntime } from 'hast-util-to-jsx-runtime';
import type { ComponentProps } from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';

import type {
  WidgetComponents,
  WithAfterLead,
  WithWidgets,
} from '@/blog/shared/article-slots';
import { type WithContentTree, widgetPlaceholder } from '@/blog/shared/content';

import { ContentLink } from './content-link';
import { ContentVideo } from './content-video';

/** The tags a component renders instead of the browser's own element. */
const CONTENT_COMPONENTS: Partial<Components> = {
  a: ContentLink,
  video: ContentVideo,
};

/**
 * `figure` as the pipeline's widget placeholders need it: the owner's
 * component where a figure carries one, the browser's element otherwise. A
 * placeholder no component is given for throws, naming the file — its body
 * would otherwise stand in for the widget unnoticed.
 */
function widgetFigure(widgets: WidgetComponents) {
  return function WidgetFigure(props: ComponentProps<'figure'>) {
    const placeholder = widgetPlaceholder(props);

    if (placeholder === undefined) return <figure {...props} />;

    const Widget = widgets[placeholder.name];

    if (Widget === undefined) {
      throw new Error(
        `${placeholder.source} uses the widget \`${placeholder.name}\`, and its page renders no such widget.`,
      );
    }

    return <Widget {...placeholder} />;
  };
}

type ProseContentProps = WithContentTree & WithAfterLead & WithWidgets;

/**
 * Whatever the markdown pipeline compiled, under the class `prose.scss` styles
 * — an article's body and a song's prose alike.
 */
export function ProseContent({
  tree,
  afterLead,
  widgets = {},
}: ProseContentProps) {
  const half = (children: RootContent[]) => ({ ...tree, children });
  const components = { ...CONTENT_COMPONENTS, figure: widgetFigure(widgets) };
  const options = { Fragment, jsx, jsxs, components };
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
