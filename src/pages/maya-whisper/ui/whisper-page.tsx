import { Stack, Text, Title } from '@mantine/core';

import { SITE_CONFIG } from '@/shared/config';
import { loadMessages } from '@/shared/i18n';
import { PageShell, TextLink } from '@/shared/ui';

import { SiteFooter } from '@/widgets/site-footer';

import { LEXICON } from '../model/lexicon';
import { WhisperTypewriter } from './whisper-typewriter';

const { commit, words } = LEXICON;

export function WhisperPage() {
  return (
    <PageShell>
      <Stack gap={48}>
        <Stack gap="md">
          <Title order={1}>Шепчущая машинка</Title>
          <Text size="lg" lh={1.625}>
            В 1984 году в американском посольстве в Москве и консульстве в
            Ленинграде нашли шестнадцать пишущих машинок IBM Selectric, которые
            восемь лет пересказывали всё, что на них печатали. Жучок в
            металлической планке ловил движения механизма: четыре бита на удар,
            по нескольку букв на каждый звук. Что именно напечатано, на посту
            восстанавливали по законам вероятности.
          </Text>
          <Text size="lg" lh={1.625}>
            Настоящую схему так и не опубликовали. У моего жучка шестнадцать
            звуков, на каждый приходится по две-три буквы, а пост знает только{' '}
            {words.length} слов, которыми написаны сайты Вовы (словарь собран на
            коммите{' '}
            <TextLink
              href={`https://github.com/vzakharov/vovazakharov.com/tree/${commit}`}
            >
              {commit.slice(0, 7)}
            </TextLink>
            ). Слова, которого он не знает, он не угадает.
          </Text>
        </Stack>

        <WhisperTypewriter
          {...{ words }}
          copy={loadMessages(SITE_CONFIG.locale).whisper}
        />

        <SiteFooter />
      </Stack>
    </PageShell>
  );
}
