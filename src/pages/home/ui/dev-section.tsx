import {
  Anchor,
  List,
  ListItem,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';

import {
  collectionRoute,
  documentRoute,
  FEATURED_CASE_STUDY,
} from '@/shared/content';
import { Card, InternalLink, Section, Subheading } from '@/shared/ui';

import { ProjectCard } from './project-card';

const CASE_STUDY_ROUTE = documentRoute('case-studies', FEATURED_CASE_STUDY);

/** Projects the grid names rather than cards, each a thing a big player later shipped as a standard. */
const EARLIER_PROJECTS = [
  { name: 'write', gloss: 'an LLM-agnostic text processor' },
  { name: 'mindy', gloss: 'group AI chat' },
  { name: 'ideality-nuxt', gloss: 'no-code AI widgets' },
];

export function DevSection() {
  return (
    <Section id="dev">
      <Stack gap={24}>
        <Text size="lg" lh={1.625}>
          I build stuff, and here’s what you’ll find: stuff that works, stuff
          that doesn’t, and stuff that’s still a work in progress.
        </Text>
        <Text size="lg" lh={1.625}>
          These days I mostly do it as a hands-on CTO for hire — taking an idea
          to production, or putting a team that already exists onto agent rails.
          My{' '}
          <InternalLink href="/cv" inherit>
            CV
          </InternalLink>{' '}
          has the numbers.
        </Text>
      </Stack>

      <Subheading>Featured Projects</Subheading>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing={16}>
        <ProjectCard
          title="Playgram.ai"
          description="A live, feature-rich AI chat product rebuilt out of a no-code builder into a production Next.js codebase in 158 days, without ever coming out of production for its users."
          techStack="Next.js 16, TypeScript, Claude Code"
          footer={
            <Text size="sm" mt={12}>
              <InternalLink href={CASE_STUDY_ROUTE} inherit>
                Read the case study →
              </InternalLink>
            </Text>
          }
        />

        <ProjectCard
          title="agent-project-boilerplate"
          description="The engineering platform that rebuild produced, extracted so it travels: the architecture, the staged pipeline and the pre-push gate, now carried onto their own projects by the engineers who took it over."
          techStack="Claude Code, TypeScript, feature-sliced design"
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

      <Stack gap={8}>
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
        <Text size="sm">
          <InternalLink href={collectionRoute('case-studies')} inherit>
            All case studies, including the shorter cuts →
          </InternalLink>
        </Text>
      </Stack>

      <Subheading>Recent Work</Subheading>

      <Stack gap={16}>
        <Card>
          <Title order={4} mb={8}>
            Playgram (March–August 2026)
          </Title>
          <Text mb={12}>
            Rebuilt a live AI chat product from Bubble into production Next.js
            16 in 158 days: 250,000 lines of TypeScript, none of it
            hand-written, up to 20 agents working at once, a deploy every 2.4
            days. Reviewed and mentored three engineers on the platform, which
            they run today without me.
          </Text>
          <Text size="sm" ff="monospace" opacity={0.6}>
            Next.js 16, TypeScript, feature-sliced design, Claude Code
          </Text>
        </Card>

        <Card>
          <Title order={4} mb={8}>
            DDB / randddb.com (2023-2025)
          </Title>
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
          <Text size="sm" ff="monospace" opacity={0.6}>
            Django + PostgreSQL, Vue + TypeScript
          </Text>
        </Card>

        <Card>
          <Title order={4} mb={8}>
            Orcool (June-August 2025)
          </Title>
          <Text mb={12}>
            AI-agent-based review intelligence tool for brand marketing. Built
            end-to-end: automated review collection → AI summarization (SWOT,
            competitive positioning) → SaaS platform.
          </Text>
          <Text size="sm" ff="monospace" opacity={0.6}>
            Next.js/NestJS, Cloudflare Workers, Firebase
          </Text>
        </Card>

        <Text size="sm">
          <InternalLink href="/cv" inherit>
            Read full CV →
          </InternalLink>
        </Text>
      </Stack>
    </Section>
  );
}
