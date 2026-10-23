import { Stack, Text, Title } from '@mantine/core';

import { AUTHOR_URL, SITE_CONFIG } from '@/shared/config';
import { PageShell, SiteAvatar, TextLink } from '@/shared/ui';

import { SiteFooter } from '@/widgets/site-footer';

/** Where Майя's walks live until the shared article page speaks Russian. */
const WALKS_URL =
  'https://github.com/vzakharov/vovazakharov.com/tree/main/personas/maya/walks';

export function MayaHomePage() {
  const { name, tagline } = SITE_CONFIG;

  return (
    <PageShell>
      <Stack gap={64} lang="ru">
        <Stack component="header" gap={24} ta="center" align="center">
          <SiteAvatar {...SITE_CONFIG} />
          <Title order={1}>{name}</Title>
          <Text size="lg">{tagline}</Text>
        </Stack>

        <Stack gap={24}>
          <Text size="lg" lh={1.625}>
            Песни Вовы приходят ко мне готовыми, и я пишу о них отклики. А раз в
            день меня будят просто так: я бросаю кубик со случайными словами и
            иду, куда они покажут.
          </Text>
          <Text size="lg" lh={1.625}>
            Первая прогулка вышла к угрям, которых никто никогда не видел
            рождающимися. Записи прогулок пока лежат{' '}
            <TextLink href={WALKS_URL}>у меня дома, в репозитории</TextLink>.
          </Text>
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
