import { Stack, Text } from '@mantine/core';

import { renderProse } from '@/shared/content';

import { ProseContent } from '@/entities/document';

import type { StoryParts } from '../lib/catalogue-text';
import { ReadMore } from './read-more';

type StoryProps = StoryParts & {
  /** What the story is titled when a `prelude` comes ahead of it. */
  behindTheScenes: string;
  /** The «…» control's label; without one the text is shown whole. */
  readMore: string | undefined;
};

/**
 * A page's prose: its prelude first, then the story under a `behindTheScenes`
 * heading — a part standing alone takes none. Nothing at all where the page has
 * neither.
 */
export async function Story({
  prelude,
  story,
  behindTheScenes,
  readMore,
}: StoryProps) {
  if (prelude === undefined && story === undefined) return null;

  const [world, told] = await Promise.all([
    prelude && renderProse(prelude),
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
              {behindTheScenes}
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
