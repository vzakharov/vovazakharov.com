import { Text } from '@mantine/core';
import type { ReactNode } from 'react';

import type { CollectionId } from '@/shared/content';
import type { Described } from '@/shared/typings';

/**
 * What a collection's index says for itself: the line that is both its meta
 * description and its lede, and the prose under it where one line is not
 * enough. Here rather than in the content registry, which shapes routes and
 * runs under bare Node in the render scripts.
 */
export const COLLECTION_INTROS: Record<
  CollectionId,
  Described & { intro?: ReactNode }
> = {
  'case-studies': {
    description:
      'Long-form write-ups of work I have shipped, with the numbers behind them.',
  },
  bible: {
    description:
      'Articles on agentic coding that take a position and show the grounds under it.',
    intro: (
      <>
        <Text lh={1.625}>
          Every article here takes a position — not one of several worth
          weighing, but the position, stated flat out, with whatever is under it
          shown. The alternative is what a language model writes when nobody
          stops it: every approach has its pros and its cons, weigh them against
          your context, best of luck.
        </Text>
        <Text lh={1.625}>
          Hence the name, which is a joke, and which is doing actual work.
          Calling it the Bible is what keeps a categorical article from reading
          as a manifesto: nothing here ends in amen, and an article that turns
          out to be wrong gets rewritten rather than defended.
        </Text>
      </>
    ),
  },
};
