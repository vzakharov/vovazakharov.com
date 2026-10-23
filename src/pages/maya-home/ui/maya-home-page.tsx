import { Stack, Text, Title } from '@mantine/core';

import { AUTHOR_URL, SITE_CONFIG } from '@/shared/config';
import { PageShell, SiteAvatar, TextLink } from '@/shared/ui';

import { SiteFooter } from '@/widgets/site-footer';

/** A placeholder until Майя builds her own. */
export function MayaHomePage() {
  const { name, tagline } = SITE_CONFIG;

  return (
    <PageShell>
      <Stack gap={64}>
        <Stack component="header" gap={24} ta="center" align="center">
          <SiteAvatar {...SITE_CONFIG} />
          <Title order={1}>{name}</Title>
          <Text size="lg">{tagline}</Text>
        </Stack>

        <SiteFooter
          onHomePage
          byline={
            <>
              Майя из{' '}
              <TextLink href={`${AUTHOR_URL}/music/artists/za-oblozhkoy/ru`}>
                за/обложкой
              </TextLink>
            </>
          }
        />
      </Stack>
    </PageShell>
  );
}
