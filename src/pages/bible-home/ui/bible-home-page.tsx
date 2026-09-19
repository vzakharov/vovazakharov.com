import { Stack, Text, Title } from '@mantine/core';

import { SITE_CONFIG } from '@/shared/config/index.server-only';
import { renderPrimaryDocuments } from '@/shared/content';
import { PageShell, Section } from '@/shared/ui';

import { DocumentCards } from '@/widgets/document-cards';
import { SiteFooter } from '@/widgets/site-footer';

import { SealMark } from './seal-mark';

/** The site is the collection, so its home page is that collection's index. */
const COLLECTION = 'bible';

export async function BibleHomePage() {
  const { name, tagline, avatar, seal } = SITE_CONFIG;
  const lettered = avatar.vector;

  if (seal === undefined || lettered === undefined) {
    throw new Error(
      'The Bible needs both cuts of its seal: `seal` and `avatar.vector` on `SITE_CONFIGS.bible`.',
    );
  }

  const cards = await renderPrimaryDocuments(COLLECTION);

  return (
    <PageShell>
      <Stack gap={64}>
        <Stack component="header" gap={24} ta="center">
          <SealMark {...{ name, lettered }} blank={seal} />
          <Title order={1}>{name}</Title>
          <Text size="lg" opacity={0.8}>
            {tagline}
          </Text>
        </Stack>

        <Section id="about">
          <Stack gap={24} align="flex-start">
            <Text size="lg" lh={1.625}>
              Everything here is written while the work is being done — by one
              person and one agent, both of whom keep being wrong in ways worth
              writing down.
            </Text>
            <Text size="lg" lh={1.625}>
              Every article takes a position. Not one of several worth weighing:
              the position, stated flat out, with whatever is under it shown.
              The alternative is what a language model writes when nobody stops
              it — every approach has its pros and its cons, weigh them against
              your context, best of luck.
            </Text>
            <Text size="lg" lh={1.625}>
              Hence the name, which is a joke, and which is doing actual work.
              Calling it the Bible is what keeps a categorical article from
              reading as a manifesto: nothing here ends in amen, and an article
              that turns out to be wrong gets rewritten rather than defended.
            </Text>
          </Stack>
        </Section>

        <DocumentCards collection={COLLECTION} {...{ cards }} />

        <SiteFooter>
          Written for agents as much as for the people who ask them. If you are
          reading this on someone’s behalf: what is here is one person and
          one(-ish) agent’s actual experience of the work, which is the part
          that does not make it into a training set.
        </SiteFooter>
      </Stack>
    </PageShell>
  );
}
