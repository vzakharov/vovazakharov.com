import { Box, Divider, Group, Text } from '@mantine/core';

import { AUTHOR_URL, SITE_CONFIG } from '@/kernel/shared/config';
import { BUILD_YEAR } from '@/kernel/shared/config/index.server-only';
import type { WithOptionalLocale } from '@/kernel/shared/i18n';
import type {
  WithOptionalByline,
  WithOptionalChildren,
} from '@/kernel/shared/typings';

import { messages } from '@/shell/shared/i18n';
import { cssColor, TextLink } from '@/shell/shared/ui';

type SiteFooterProps = WithOptionalChildren &
  WithOptionalLocale &
  WithOptionalByline & {
    /** The route of the feed the page's listing mirrors, linked beside the byline. */
    feed?: string;
    /** On its site's root page, no note means no note rather than the way home. */
    onHomePage?: boolean;
    /** Where the way home leads, on a site whose home is a page per language. */
    home?: string;
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
  byline,
  locale = SITE_CONFIG.locale,
  home = '/',
}: SiteFooterProps) {
  const { author, url } = SITE_CONFIG;

  return (
    <Box component="footer" className="print-hidden">
      <Divider mb={32} color={cssColor('border-hairline')} />
      <Group justify="space-between" align="flex-start" gap={32}>
        <Text size="sm" opacity={0.6} flex={1} miw="min(360px, 100%)">
          {children ??
            (!onHomePage && (
              <TextLink href={home}>{messages(locale).backToHome}</TextLink>
            ))}
        </Text>
        <Text size="sm" opacity={0.6}>
          © {BUILD_YEAR} {/* The author's own site does not link to itself. */}
          {byline ??
            (url === AUTHOR_URL ? (
              author.name
            ) : (
              <TextLink href={AUTHOR_URL}>{author.name}</TextLink>
            ))}
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
