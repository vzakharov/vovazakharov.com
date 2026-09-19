import { SimpleGrid, Stack, Title } from '@mantine/core';

import { SITE_CONFIG } from '@/shared/config/index.server-only';
import { PageShell, Section, SiteAvatar, SummaryCard } from '@/shared/ui';

import { SiteFooter } from '@/widgets/site-footer';

import { AboutSection } from './about-section';

/**
 * Written here rather than read from a registry: two of the three point
 * off-site at things this repository does not own.
 */
const WORK = [
  {
    title: 'The Agentic Bible',
    description:
      'Articles on agentic coding that take a position and show the grounds under it.',
    href: 'https://agentic.bible',
  },
  {
    title: 'MUTHUR',
    description:
      'The agent infrastructure this site runs on, as a template you can start a repository from: the skill loop, the layer boundaries, the lint discipline.',
    href: 'https://github.com/vzakharov/muthur',
  },
  {
    title: 'Agentic coding courses',
    description:
      'The same material as the articles, in the order you would actually learn it, with the work to do between the parts.',
    eyebrow: 'Coming soon',
  },
];

export function LsaHomePage() {
  const { name } = SITE_CONFIG;

  return (
    <PageShell>
      <Stack gap={64}>
        <Stack component="header" gap={24} ta="center">
          <SiteAvatar {...SITE_CONFIG} />
          <Title order={1}>{name}</Title>
        </Stack>

        <AboutSection />

        <Section id="work">
          <Title order={2}>Where it goes</Title>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={16}>
            {WORK.map((card) => (
              <SummaryCard key={card.title} {...card} />
            ))}
          </SimpleGrid>
        </Section>

        {/* The address to agent readers travels with the articles it was written for. */}
        <SiteFooter />
      </Stack>
    </PageShell>
  );
}
