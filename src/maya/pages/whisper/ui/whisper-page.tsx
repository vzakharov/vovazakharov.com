import { Stack, Text, Title } from '@mantine/core';

import { fillSlots, type WithLocale } from '@/kernel/shared/i18n';

<<<<<<< HEAD:src/maya/pages/whisper/ui/whisper-page.tsx
import { ChipNav, localeChips, PageShell, TextLink } from '@/shell/shared/ui';
import { SiteFooter } from '@/shell/widgets/site-footer';
=======
import { MayaByline } from '@/entities/maya';

import { SiteFooter } from '@/widgets/site-footer';
>>>>>>> origin/main:src/pages/maya-whisper/ui/whisper-page.tsx

import { documentRoute, localizedRoute } from '@/blog/shared/content';

import { messages } from '../i18n';
import { whisperPath } from '../lib/whisper-metadata';
import { LEXICON } from '../model/lexicon';
import { WhisperTypewriter } from './whisper-typewriter';

const { commit, words } = LEXICON;

/** The post the toy came out of. */
const STORY_SLUG = 'whispering-typewriter';

export function WhisperPage({ locale }: WithLocale) {
  const copy = messages(locale);

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
