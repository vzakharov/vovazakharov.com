import { Box, Divider, Group, Text } from '@mantine/core';

import { AUTHOR_URL, SITE_CONFIG } from '@/shared/config';
import { BUILD_YEAR } from '@/shared/config/index.server-only';
import type { WithOptionalChildren } from '@/shared/typings';
import { cssColor, TextLink } from '@/shared/ui';

type SiteFooterProps = WithOptionalChildren & {
  /** The route of the feed the page's listing mirrors, linked beside the byline. */
  feed?: string;
};

/**
 * Every page's foot: whatever the page has to say on its way out — a note, the
 * way back home — opposite the byline. Screen-only, a printed document carrying
 * a footer of its own on every sheet.
 */
export function SiteFooter({ children, feed }: SiteFooterProps) {
  const { author, url } = SITE_CONFIG;

  return (
    <Box component="footer" className="print-hidden">
      <Divider mb={32} color={cssColor('border-hairline')} />
      <Group justify="space-between" align="flex-start" gap={32}>
        <Text size="sm" opacity={0.6} flex={1} miw="min(360px, 100%)">
          {children}
        </Text>
        <Text size="sm" opacity={0.6}>
          © {BUILD_YEAR} {/* The author's own site does not link to itself. */}
          {url === AUTHOR_URL ? (
            author.name
          ) : (
            <TextLink href={AUTHOR_URL}>{author.name}</TextLink>
          )}
          {feed !== undefined && (
            <>
              {' · '}
              <TextLink href={feed}>RSS</TextLink>
            </>
          )}
        </Text>
      </Group>
    </Box>
  );
}
