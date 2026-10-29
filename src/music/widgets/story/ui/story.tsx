import { Stack, Text } from '@mantine/core';

import { renderProse } from '@/blog/shared/content';
import { ProseContent } from '@/blog/shared/ui';

import type { StoryParts } from '@/music/shared/catalogue';
import {
  type StoryHeadings,
  storyOrder,
} from '@/music/shared/catalogue/index.node-safe';

import { ReadMore } from './read-more';

type StoryProps = StoryParts &
  StoryHeadings & {
    /** The «…» control's label; without one the text is shown whole. */
    readMore: string | undefined;
  };

/**
 * A page's prose: its prelude and story in the order the file tells them, the
 * second under a heading saying what it is — a part standing alone takes none.
 * Nothing at all where the page has neither.
 */
export async function Story({
  prelude,
  story,
  readMore,
  ...headings
}: StoryProps) {
  const parts = await Promise.all(
    storyOrder(prelude, story, headings).map(async ({ part, heading }) => ({
      rendered: await renderProse(part),
      heading,
    })),
  );

  if (parts.length === 0) return null;

  const prose = (
    <Stack gap={32}>
      {parts.map(({ rendered, heading }) => (
        <div key={heading ?? ''}>
          {heading !== undefined && (
            <Text
              component="h2"
              size="xs"
              tt="uppercase"
              opacity={0.6}
              mb={16}
              lts="0.06em"
            >
              {heading}
            </Text>
          )}
          <ProseContent {...rendered} />
        </div>
      ))}
    </Stack>
  );

  return readMore === undefined ? (
    prose
  ) : (
    <ReadMore label={readMore}>{prose}</ReadMore>
  );
}
