import { Box, Divider, Group, Stack, Text, Title } from '@mantine/core';

import { BUILD_YEAR, PAGE_ROUTES, SITE_CONFIG } from '@/shared/config';
import { collectionRoute } from '@/shared/content';
import { cssColor, InternalLink, PageShell, SiteAvatar } from '@/shared/ui';

import { ContactSection } from './contact-section';
import { OfferSection } from './offer-section';
import { WorkSection } from './work-section';

/** The nouns the hero claims that live on pages of their own. */
const SEE_ALSO = [PAGE_ROUTES.writing, collectionRoute('music')];

export function HomePage() {
  const { name, author } = SITE_CONFIG;

  return (
    <PageShell>
      <Stack gap={64}>
        <Stack component="header" gap={24} ta="center">
          <SiteAvatar />
          <Box>
            <Title order={1} mb={12}>
              {name}
            </Title>
            <Text opacity={0.7}>
              Helping our future overlords walk since 2020
            </Text>
          </Box>
        </Stack>

        <OfferSection />
        <WorkSection />
        <ContactSection />

        <Box component="footer">
          <Divider mb={32} color={cssColor('border-hairline')} />
          <Group justify="space-between" gap={8}>
            <Text size="sm" opacity={0.6}>
              {SEE_ALSO.map((href, index) => (
                <span key={href}>
                  {index > 0 && ' · '}
                  <InternalLink {...{ href }} inherit>
                    {href}
                  </InternalLink>
                </span>
              ))}
            </Text>
            <Text size="sm" opacity={0.6}>
              © {BUILD_YEAR} {author.name}
            </Text>
          </Group>
        </Box>
      </Stack>
    </PageShell>
  );
}
