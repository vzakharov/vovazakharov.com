import { Stack, Text } from '@mantine/core';

import { renderProse } from '@/kernel/shared/content';

import { ProseContent } from '@/blog/entities/document';

import type { StoryParts } from '../lib/catalogue-text';
import { ReadMore } from './read-more';

type StoryProps = StoryParts & {
  /** What the story is titled when a `universe` comes ahead of it. */
  makingOf: string;
  /** The «…» control's label; without one the text is shown whole. */
  readMore: string | undefined;
};

/**
 * A page's prose: the world it is set in first, then the story under a
 * `makingOf` heading — a part standing alone takes none. Nothing at all where
 * the page has neither.
 */
export async function Story({
  universe,
  story,
  makingOf,
  readMore,
}: StoryProps) {
  if (universe === undefined && story === undefined) return null;

  const [world, told] = await Promise.all([
    universe && renderProse(universe),
    story && renderProse(story),
  ]);
  const prose = (
    <Stack gap={32}>
      {world && <ProseContent {...world} />}
      {told && (
        <div>
          {world && (
            <Text
              component="h2"
              size="xs"
              tt="uppercase"
              opacity={0.6}
              mb={16}
              lts="0.06em"
            >
              {makingOf}
            </Text>
          )}
          <ProseContent {...told} />
        </div>
      )}
    </Stack>
  );

  return readMore === undefined ? (
    prose
  ) : (
    <ReadMore label={readMore}>{prose}</ReadMore>
  );
}
