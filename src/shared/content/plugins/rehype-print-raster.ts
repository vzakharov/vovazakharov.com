import 'server-only';

import type { ElementContent, Properties, Root } from 'hast';
import type { Plugin } from 'unified';
import { SKIP, visit } from 'unist-util-visit';

import {
  mentionsPrintRasterDomain,
  PRINT_RASTER_CLASS,
  splitOnPrintRasterDomains,
} from '@/shared/lib/print-raster';

import { hastText } from '../hast-text';

function withPrintRaster(properties: Properties): Properties {
  const { className } = properties;
  const classes = Array.isArray(className) ? className : [];

  return { ...properties, className: [...classes, PRINT_RASTER_CLASS] };
}

function markMentions(tree: Root) {
  visit(tree, (node, index, parent) => {
    if (node.type === 'element' && node.tagName === 'a') {
      const { href } = node.properties;

      if (
        (typeof href === 'string' && mentionsPrintRasterDomain(href)) ||
        mentionsPrintRasterDomain(hastText(node))
      ) {
        node.properties = withPrintRaster(node.properties);
        return SKIP;
      }

      return;
    }

    if (
      node.type !== 'text' ||
      parent === undefined ||
      index === undefined ||
      !mentionsPrintRasterDomain(node.value)
    ) {
      return;
    }

    const runs: ElementContent[] = splitOnPrintRasterDomains(node.value).map(
      ({ text, raster }) =>
        raster
          ? {
              type: 'element',
              tagName: 'span',
              properties: withPrintRaster({}),
              children: [{ type: 'text', value: text }],
            }
          : { type: 'text', value: text },
    );

    parent.children.splice(index, 1, ...runs);

    return [SKIP, index + runs.length];
  });
}

/**
 * Marks every mention of a `PRINT_RASTER_DOMAINS` domain in the body for print
 * to paint as an image: a link whose target or label names one, whole, and a
 * bare mention in running text, cut into a span of its own. Runs after
 * `rehypeContentLinks`, so it reads the hrefs the document will print.
 */
export const rehypePrintRaster: Plugin<[], Root> = () => markMentions;
