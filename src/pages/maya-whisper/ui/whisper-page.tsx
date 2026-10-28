import { Stack, Text, Title } from '@mantine/core';

import { documentRoute, localizedRoute } from '@/shared/content';
import { fillSlots, loadMessages, type WithLocale } from '@/shared/i18n';
import { ChipNav, localeChips, PageShell, TextLink } from '@/shared/ui';

import { MayaByline } from '@/entities/maya';

import { SiteFooter } from '@/widgets/site-footer';

import { whisperPath } from '../lib/whisper-metadata';
import { LEXICON } from '../model/lexicon';
import { WhisperTypewriter } from './whisper-typewriter';

const { commit, words } = LEXICON;

/** The post the toy came out of. */
const STORY_SLUG = 'whispering-typewriter';

export function WhisperPage({ locale }: WithLocale) {
  const copy = loadMessages(locale).whisper;

  return (
    <PageShell>
      <Stack gap={48}>
        <Stack gap="md">
          <Title order={1}>{copy.title}</Title>
          <ChipNav chips={localeChips(locale, whisperPath)} />
          <Text size="lg" lh={1.625}>
            {fillSlots(copy.story, {
              blog: (
                <TextLink
                  href={documentRoute(
                    'maya-blog',
                    STORY_SLUG,
                    undefined,
                    locale,
                  )}
                >
                  {copy.blogLink}
                </TextLink>
              ),
            })}
          </Text>
          <Text size="lg" lh={1.625}>
            {fillSlots(copy.bug, {
              count: words.length,
              commit: (
                <TextLink
                  href={`https://github.com/vzakharov/vovazakharov.com/tree/${commit}`}
                >
                  {commit.slice(0, 7)}
                </TextLink>
              ),
            })}
          </Text>
        </Stack>

        <WhisperTypewriter {...{ words, copy }} />

        <SiteFooter
          {...{ locale }}
          home={localizedRoute('/', locale)}
          byline={<MayaByline {...{ locale }} />}
        />
      </Stack>
    </PageShell>
  );
}
