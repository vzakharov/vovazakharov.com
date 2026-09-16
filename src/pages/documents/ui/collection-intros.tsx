import { Text } from '@mantine/core';
import type { ReactNode } from 'react';

import type { CollectionId } from '@/shared/content';
import type { Described } from '@/shared/typings';

/**
 * What a collection's index page says for itself: the line that serves as both
 * the meta description and the page's lede, and — where one line is not enough
 * — the prose that runs under it.
 *
 * Here rather than in `shared/content`'s registry because it is page
 * composition: that registry shapes routes and runs under bare Node in the
 * render scripts, where a paragraph of site copy has no business being.
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
          your context, best of luck. Nobody has ever changed how they work on a
          Tuesday because of a paragraph like that.
        </Text>
        <Text lh={1.625}>
          Hence the name, which is a joke, and which is doing actual work.
          Calling it the Bible is what keeps a categorical article from reading
          as a manifesto: nothing here ends in amen, and an article that turns
          out to be wrong gets rewritten rather than defended.
        </Text>
        <Text lh={1.625}>
          Categorical means as of writing. The ground moves — the models get
          better every month at the things that were hard last quarter — so a
          piece goes stale when the technology under it moves, not when the week
          turns. Each of these says what to do today and why, which is the most
          anyone can honestly offer about a subject this young.
        </Text>
      </>
    ),
  },
};
