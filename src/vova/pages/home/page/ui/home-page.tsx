import { Box, Stack, Text, Title } from '@mantine/core';

import { SITE_CONFIG } from '@/kernel/shared/config';

import { PageShell, SiteAvatar, TextLink } from '@/shell/shared/ui';
import { SiteFooter } from '@/shell/widgets/site-footer';

import { MUSIC_ROUTE } from '@/blog/shared/content';

import { WorkSection } from '../../work';
import { ContactSection } from './contact-section';
import { OfferSection } from './offer-section';

/** The nouns the hero claims that live on pages of their own. */
const SEE_ALSO = [MUSIC_ROUTE];

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

        <SiteFooter onHomePage>
          {SEE_ALSO.map((href, index) => (
            <span key={href}>
              {index > 0 && ' · '}
              <TextLink {...{ href }}>{href}</TextLink>
            </span>
          ))}
        </SiteFooter>
      </Stack>
    </PageShell>
  );
}
