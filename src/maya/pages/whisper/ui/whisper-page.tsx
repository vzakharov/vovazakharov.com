import { Stack, Text, Title } from '@mantine/core';

<<<<<<< HEAD:src/maya/pages/whisper/ui/whisper-page.tsx
import { SITE_CONFIG } from '@/kernel/shared/config';
=======
import { documentRoute, localizedRoute } from '@/shared/content';
import { fillSlots, loadMessages, type WithLocale } from '@/shared/i18n';
import { ChipNav, localeChips, PageShell, TextLink } from '@/shared/ui';
>>>>>>> origin/main:src/pages/maya-whisper/ui/whisper-page.tsx

import { PageShell, TextLink } from '@/shell/shared/ui';
import { SiteFooter } from '@/shell/widgets/site-footer';

<<<<<<< HEAD:src/maya/pages/whisper/ui/whisper-page.tsx
import { messages } from '../i18n';
=======
import { whisperPath } from '../lib/whisper-metadata';
>>>>>>> origin/main:src/pages/maya-whisper/ui/whisper-page.tsx
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

<<<<<<< HEAD:src/maya/pages/whisper/ui/whisper-page.tsx
        <WhisperTypewriter {...{ words }} copy={messages(SITE_CONFIG.locale)} />
=======
        <WhisperTypewriter {...{ words, copy }} />
>>>>>>> origin/main:src/pages/maya-whisper/ui/whisper-page.tsx

        <SiteFooter {...{ locale }} home={localizedRoute('/', locale)} />
      </Stack>
    </PageShell>
  );
}
