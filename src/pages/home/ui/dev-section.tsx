import {
  Anchor,
  Group,
  List,
  ListItem,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import Image from 'next/image';

import { FEATURED_CASE_STUDY_ROUTE } from '@/shared/content';
import type { TitledBlock } from '@/shared/typings';
import { Card, InternalButton, Section, Subheading } from '@/shared/ui';

import { ProjectCard } from './project-card';
import { TechLine } from './tech-line';

/** Projects the grid names rather than cards, each a thing a big player later shipped as a standard. */
const EARLIER_PROJECTS = [
  { name: 'write', gloss: 'a BYOK AI-first text processor' },
  { name: 'mindy', gloss: 'ChatGPT before ChatGPT' },
  { name: 'ideality-nuxt', gloss: 'no-code AI widgets' },
];

type HighlightCardProps = TitledBlock & {
  /** Basename under `public/logos/`. */
  logo: string;
  tech: string;
};

function HighlightCard({ logo, title, tech, children }: HighlightCardProps) {
  return (
    <Card>
      <Group gap={12} mb={8} wrap="nowrap">
        <Image
          src={`/logos/${logo}.png`}
          alt=""
          width={28}
          height={28}
          style={{ borderRadius: 6 }}
        />
        <Title order={4}>{title}</Title>
      </Group>
      {children}
      <TechLine>{tech}</TechLine>
    </Card>
  );
}

export function DevSection() {
  return (
    <Section id="dev">
      <Stack gap={24} align="flex-start">
        <Text size="lg" lh={1.625}>
          I build stuff, and here’s what you’ll find: stuff that works, stuff
          that doesn’t, and stuff that’s still a work in progress.
        </Text>
        <Text size="lg" lh={1.625}>
          These days I’m looking for a hands-on CTO position — taking an idea to
          production, or putting a team that already exists onto agent rails.
        </Text>
        <InternalButton href="/cv" variant="default" size="md">
          Read full CV
        </InternalButton>
      </Stack>

      <Subheading>Featured Projects</Subheading>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing={16}>
        <ProjectCard
          title="Playgram.ai"
          description="A live, feature-rich AI chat product lifted off a no-code builder into a production Next.js codebase in 158 days, and in production for its users the whole way through."
          techStack="Next.js 16, Supabase, Railway, feature-sliced design, Claude Code"
          url="https://playgram.ai"
          caseStudyHref={FEATURED_CASE_STUDY_ROUTE}
        />

        <ProjectCard
          title="agent-project-boilerplate"
          description="The engineering platform that rebuild ran on, extracted so it travels: the architecture, the staged pipeline and the pre-push gate, ready to carry onto my — or anyone’s — next project."
          techStack="Claude Code, project templating, open source"
          url="https://github.com/vzakharov/agent-project-boilerplate"
        />

        <ProjectCard
          title="jukebox-webui"
          stars={84}
          description="Suno before Suno: running OpenAI's music model in Google Colab back when there was no product to use instead."
          techStack="Python, Gradio, Google Colab"
          url="https://github.com/vzakharov/jukebox-webui"
        />

        <ProjectCard
          title="almostmagic"
          stars={65}
          description="Structured generation before it was a feature — typed output from a single call, years before every SDK shipped its own version of it."
          techStack="TypeScript, OpenAI API"
          url="https://github.com/losideadores/almostmagic"
        />
      </SimpleGrid>

      <Text size="sm" opacity={0.7}>
        Same pattern, earlier:{' '}
        {EARLIER_PROJECTS.map(({ name, gloss }, index) => (
          <span key={name}>
            {index > 0 && ', '}
            <Anchor
              href={`https://github.com/vzakharov/${name}`}
              target="_blank"
              rel="noopener noreferrer"
              inherit
            >
              {name}
            </Anchor>{' '}
            ({gloss})
          </span>
        ))}
        .
      </Text>

      <Subheading>Work Highlights</Subheading>

      <Stack gap={16}>
        <HighlightCard
          logo="playgram"
          title="Playgram (March–August 2026)"
          tech="Next.js 16, TypeScript, feature-sliced design, Claude Code"
        >
          <Text mb={12}>
            Rebuilt a live AI chat product from Bubble into production Next.js
            16 in 158 days: 250,000 lines of TypeScript, none of it
            hand-written, up to 20 agents working at once, a deploy every 2.4
            days. Reviewed and mentored three engineers on the platform, which
            they run today without me.
          </Text>
        </HighlightCard>

        <HighlightCard
          logo="ddb"
          title="DDB / randddb.com (2023-2025)"
          tech="Django + PostgreSQL, Vue + TypeScript"
        >
          <Text mb={12}>
            Experimental AI platform at one of the world’s largest ad firms.
            Built enterprise-scale suite:
          </Text>
          <List spacing={4} mb={12}>
            <ListItem>
              <strong>Chatbot:</strong> ChatGPT-style corporate assistant with
              documents, images, personas, multi-user support
            </ListItem>
            <ListItem>
              <strong>Robowriter:</strong> Build-your-own-agent content
              generation tool
            </ListItem>
            <ListItem>
              <strong>Picmaker:</strong> Replicate-powered image
              generation/training
            </ListItem>
            <ListItem>
              <strong>YesYouCannes:</strong> Cannes award deck generator (idea →
              imagery in minutes)
            </ListItem>
            <ListItem>
              <strong>Spaces:</strong> White-label mini-platforms for agency
              clients
            </ListItem>
          </List>
        </HighlightCard>

        <HighlightCard
          logo="orcool"
          title="Orcool (June-August 2025)"
          tech="Next.js/NestJS, Cloudflare Workers, Firebase"
        >
          <Text mb={12}>
            AI-agent-based review intelligence tool for brand marketing. Built
            end-to-end: automated review collection → AI summarization (SWOT,
            competitive positioning) → SaaS platform.
          </Text>
        </HighlightCard>
      </Stack>
    </Section>
  );
}
