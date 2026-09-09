import { List, ListItem, Stack, Text } from '@mantine/core';

import { SITE_CONFIG } from '@/shared/config';
import { FEATURED_CASE_STUDY_ROUTE } from '@/shared/content';
import { loadMessages } from '@/shared/i18n';
import { InternalLink, Section } from '@/shared/ui';

import { ReadCvButton } from './read-cv-button';

/**
 * The engagement names are the CV's own list, read off the catalogue rather
 * than retyped, so the landing page cannot offer something the CV does not.
 */
const ENGAGEMENTS = loadMessages('en').cv.whatIOffer.blocks.engagements.items;

export function OfferSection() {
  return (
    <Section id="offer">
      <Stack gap={24} align="flex-start">
        <Text
          component="h2"
          fz={{ base: 20, sm: 24 }}
          lh={{ base: '28px', sm: '32px' }}
          opacity={0.8}
        >
          {SITE_CONFIG.tagline}
        </Text>
        <Text size="lg" lh={1.625}>
          A lot of teams now have agents writing their code, and nobody whose
          job it is to keep what comes out shippable. That’s the job I do: I
          draw the architecture, set up the pipeline the agents ship through on
          your codebase, and sit in the pull requests rather than in the org
          chart.{' '}
          <InternalLink href={FEATURED_CASE_STUDY_ROUTE} inherit>
            Last time round
          </InternalLink>{' '}
          that took a live product from a no-code builder to 250,000 lines of
          production TypeScript in 158 days — and the engineers who took it over
          run it today.
        </Text>
        <List spacing={8} size="lg">
          {ENGAGEMENTS.map(({ label }) => (
            <ListItem key={label}>{label}</ListItem>
          ))}
        </List>
        <ReadCvButton />
      </Stack>
    </Section>
  );
}
