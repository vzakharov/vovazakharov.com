import { Anchor, Stack, Text, Title } from '@mantine/core';

import { SITE_CONFIG } from '@/shared/config';
import { Section } from '@/shared/ui';

/**
 * CLAUDE.md § "GitHub comments" retires this file when the post it exists for
 * runs, and the paragraph below both links and quotes it — so that retirement
 * is a rewrite here.
 */
const FIVE_PERCENT_URL =
  'https://github.com/vzakharov/vovazakharov.com/blob/main/writing/notes/the-five-percent.md';

/**
 * The opening argument, which is also the channel's first post: the same thing
 * said once in each language, so an edit here has a counterpart in
 * `writing/late-stage-agentic/drafts/p0-welcome.md`.
 */
export function AboutSection() {
  return (
    <Section id="about">
      <Stack gap={24} align="flex-start">
        <Title order={2}>{SITE_CONFIG.tagline}</Title>

        <Text size="lg" lh={1.625}>
          I keep asking myself this, and I keep getting asked it: what are all
          you developers for, if an agent can write GTA 6 from a single prompt?
        </Text>

        <Text size="lg" lh={1.625}>
          My Claude and I have been trying to answer that with something other
          than philosophy. There is a{' '}
          <Anchor
            href={FIVE_PERCENT_URL}
            target="_blank"
            rel="noopener noreferrer"
            inherit
          >
            file
          </Anchor>{' '}
          that Claude writes to after every review of code it wrote — what
          exactly it got wrong, generalised and grouped with everything before
          it. The most frequent finding in it reads:
        </Text>

        <Text size="xl" fs="italic" opacity={0.8}>
          What it was handed, it treats as fixed
        </Text>

        <Text size="lg" lh={1.625}>
          Solving a well-posed task reliably, predictably and elegantly is one
          talent, and the models get closer to it month by month — though there
          is a great deal still to work on, and a great deal of this site is
          about that. Seeing that the task is posed wrong, or that it is the
          wrong task altogether, is the other talent. That one, as Mastercard
          says, is priceless.
        </Text>

        <Text size="lg" lh={1.625}>
          So inventing the skills and the methods that let an agent and a person
          help rather than hinder each other is the right work, and most of what
          gets written here is that work. But don’t count on the agents’
          ever-improving analysis, planning and self-correction abilities to
          replace what we meat sacks get as a bonus for being limited and not
          lasting very long — the bumps and bruises collected over a life. And
          the new bruises, for every one of Claude’s mistakes, are still yours
          to collect.
        </Text>

        <Text size="lg" lh={1.625}>
          Welcome to {SITE_CONFIG.name} — a diagnosis best heard while there is
          still anyone to make it.
        </Text>
      </Stack>
    </Section>
  );
}
