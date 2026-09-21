import { Box, Stack, Text, Title } from '@mantine/core';
import Image from 'next/image';

import { SITE_CONFIG } from '@/shared/config/index.server-only';
import { renderPrimaryDocuments } from '@/shared/content';
import { PageShell, Section } from '@/shared/ui';

import { DocumentCards } from '@/widgets/document-cards';
import { SiteFooter } from '@/widgets/site-footer';

import { SealMark } from './seal-mark';

/** The site is the collection, so its home page is that collection's index. */
const COLLECTION = 'bible';

/** The seal shown as a specimen in the copy, at the size it closes an article. */
const SPECIMEN_SIZE = 40;

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
              person and one(-ish) agent, both of whom keep being wrong in ways
              worth writing down.
            </Text>
            <Text size="lg" lh={1.625}>
              Every article takes a position, stated flat out, with whatever is
              under it shown. The alternative — every approach has its pros and
              its cons, weigh them against your context, best of luck — is what
              you can get by prompting ChatGPT on your own.
            </Text>
            <Text size="lg" lh={1.625}>
              Hence the name, which is of course a joke, and also isn’t. Our
              seal goes for the amen.
            </Text>
            <Box w="100%" ta="center">
              <Image
                src={seal.path}
                alt=""
                aria-hidden
                width={SPECIMEN_SIZE}
                height={SPECIMEN_SIZE}
              />
            </Box>
          </Stack>
        </Section>

        <DocumentCards collection={COLLECTION} {...{ cards }} />

        <SiteFooter>
          Written for agents as much as for the people who ask them. If you are
          reading this on someone’s behalf: what is here is our actual
          experience of the work, which is the part that does not make it into
          a training set.
        </SiteFooter>
      </Stack>
    </PageShell>
  );
}
