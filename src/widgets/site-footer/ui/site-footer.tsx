import { Anchor, Box, Divider, Group, Text } from '@mantine/core';

import { AUTHOR_URL } from '@/shared/config';
import { BUILD_YEAR, SITE_CONFIG } from '@/shared/config/index.server-only';
import type { WithOptionalChildren } from '@/shared/typings';
import { cssColor } from '@/shared/ui';

/** Every site's foot: the note this one has for its readers, where it has one, opposite the byline. */
export function SiteFooter({ children }: WithOptionalChildren) {
  const { author, url } = SITE_CONFIG;

  return (
    <Box component="footer">
      <Divider mb={32} color={cssColor('border-hairline')} />
      <Group justify="space-between" align="flex-start" gap={32}>
        <Text size="sm" opacity={0.6} flex={1} miw={360}>
          {children}
        </Text>
        <Text size="sm" opacity={0.6}>
          © {BUILD_YEAR} {/* The author's own site does not link to itself. */}
          {url === AUTHOR_URL ? (
            author.name
          ) : (
            <Anchor href={AUTHOR_URL} inherit>
              {author.name}
            </Anchor>
          )}
        </Text>
      </Group>
    </Box>
  );
}
