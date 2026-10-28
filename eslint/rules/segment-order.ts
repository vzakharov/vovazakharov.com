import type { Rule } from 'eslint';
import path from 'node:path';

import { LAYERS, placeOf, segmentOrder } from '../masd-graph';
import { onRelativeImports } from './relative-imports';

// A segment reaches only the segments below it in its place's order, so a
// place's segments run from what knows the most of it down to what knows none.
// Test code included: a test knows what the code it tests knows.

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow an import between two segments of one place unless the target is lower in its segment order',
    },
    schema: [],
    messages: {
      upward:
        'Segment `{{from}}` may not import `{{to}}`, which sits above it: {{order}}.',
    },
  },

  create(context) {
    const src = path.join(context.cwd, 'src');
    const fromSrc = path.relative(src, context.filename);
    const placed = fromSrc.startsWith('..') ? undefined : placeOf(fromSrc);
    const layer = fromSrc.split(path.sep)[1];
    if (
      placed?.segment === undefined ||
      layer === undefined ||
      !LAYERS.includes(layer)
    ) {
      return {};
    }
    const { place, segment: from } = placed;
    const order = segmentOrder(path.join(src, place));

    return onRelativeImports(context, (source, resolved) => {
      const target = placeOf(path.relative(src, resolved));
      const to = target?.segment;
      if (target?.place !== place || to === undefined || to === from) return;
      if (order.indexOf(to) > order.indexOf(from)) return;
      context.report({
        node: source,
        messageId: 'upward',
        data: { from, to, order: order.join(' → ') },
      });
    });
  },
};

export default rule;
