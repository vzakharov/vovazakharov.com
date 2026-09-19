import 'server-only';

/**
 * Tag names the pipeline emits for a component to render, rather than markup
 * the browser understands. The plugin that emits one and the component map
 * that renders it agree by importing this constant, not by spelling the same
 * string twice.
 *
 * They make the tree invalid HTML, which is safe only because nothing
 * stringifies it — an unmapped marker reaching a page would render as an empty
 * custom element instead of the content it stands for.
 */
export const CONTENT_VIDEO = 'content-video-embed';
