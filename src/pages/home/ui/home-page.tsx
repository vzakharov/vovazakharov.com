import { Box, Stack, Text, Title } from '@mantine/core';

import { PAGE_ROUTES, SITE_CONFIG } from '@/shared/config';
import { InternalLink, PageShell, SiteAvatar } from '@/shared/ui';

import { SiteFooter } from '@/widgets/site-footer';

import { ContactSection } from './contact-section';
import { OfferSection } from './offer-section';
import { WorkSection } from './work-section';

/** The nouns the hero claims that live on pages of their own. */
const SEE_ALSO = [PAGE_ROUTES.writing, PAGE_ROUTES.music];

export function HomePage() {
  const { name } = SITE_CONFIG;

  return (
    <PageShell>
      <Stack gap={64}>
        <Stack component="header" gap={24} ta="center">
          <SiteAvatar {...SITE_CONFIG} />
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

        <SiteFooter>
          {SEE_ALSO.map((href, index) => (
            <span key={href}>
              {index > 0 && ' · '}
              <InternalLink {...{ href }} inherit>
                {href}
              </InternalLink>
            </span>
          ))}
        </SiteFooter>
      </Stack>
    </PageShell>
  );
}
