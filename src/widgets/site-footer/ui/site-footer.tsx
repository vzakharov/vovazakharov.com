import { Box, Divider, Group, Text } from '@mantine/core';

import { AUTHOR_URL, SITE_CONFIG } from '@/shared/config';
import { BUILD_YEAR } from '@/shared/config/index.server-only';
import {
  DEFAULT_LOCALE,
  loadMessages,
  type WithOptionalLocale,
} from '@/shared/i18n';
import type { WithOptionalChildren } from '@/shared/typings';
import { cssColor, TextLink } from '@/shared/ui';

type SiteFooterProps = WithOptionalChildren &
  WithOptionalLocale & {
    /** The route of the feed the page's listing mirrors, linked beside the byline. */
    feed?: string;
    /** On its site's root page, no note means no note rather than the way home. */
    onHomePage?: boolean;
  };

/**
 * Every page's foot: whatever the page has to say on its way out opposite the
 * byline — the way back home, said in the page's `locale`, unless the page
 * hands over a note of its own. Screen-only, a printed document carrying a
 * footer of its own on every sheet.
 */
export function SiteFooter({
  children,
  feed,
  onHomePage = false,
  locale = DEFAULT_LOCALE,
}: SiteFooterProps) {
  const { author, url } = SITE_CONFIG;

  return (
    <Box component="footer" className="print-hidden">
      <Divider mb={32} color={cssColor('border-hairline')} />
      <Group justify="space-between" align="flex-start" gap={32}>
        <Text size="sm" opacity={0.6} flex={1} miw="min(360px, 100%)">
          {children ??
            (!onHomePage && (
              <TextLink href="/">{loadMessages(locale).ui.backToHome}</TextLink>
            ))}
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
