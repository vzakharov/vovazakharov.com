import { List, ListItem, SimpleGrid, Stack, Text, Title } from '@mantine/core';

import { collectionRoute, renderPrimaryDocuments } from '@/shared/content';
import { Card, InternalLink } from '@/shared/ui';

import classes from './dev-section.module.scss';
import { ProjectCard } from './project-card';
import { Section, Subheading } from './section';

export async function DevSection() {
  // Titles come from the documents themselves, so a renamed piece cannot drift.
  const caseStudies = await renderPrimaryDocuments('case-studies');

  return (
    <Section id="dev">
      <Stack gap={24}>
        <Text size="lg" lh={1.625}>
          I build stuff, and here’s what you’ll find: stuff that works, stuff
          that doesn’t, and stuff that’s still a work in progress.
        </Text>
        <Text size="lg" lh={1.625}>
          I’m currently looking for new challenges, so have a look at my{' '}
          <InternalLink href="/cv" inherit>
            CV
          </InternalLink>{' '}
          if you’re looking for new people.
        </Text>
      </Stack>

      <Subheading>Case studies</Subheading>

      <Stack gap={16}>
        {caseStudies.map(({ document, rendered }) => (
          <InternalLink
            key={document.slug}
            href={document.route}
            underline="never"
            c="inherit"
            display="block"
            className={classes['caseStudyLink']}
          >
            <Card>
              <Title order={4} mb={8}>
                {rendered.title}
              </Title>
              <Text lh={1.625}>{document.frontmatter.description}</Text>
            </Card>
          </InternalLink>
        ))}
        <Text size="sm">
          <InternalLink href={collectionRoute('case-studies')} inherit>
            All case studies, including the shorter cuts →
          </InternalLink>
        </Text>
      </Stack>

      <Subheading>Featured Projects</Subheading>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing={16}>
        <ProjectCard
          title="jukebox-webui"
          stars={84}
          description="Google Colab-backed Web UI for OpenAI's Jukebox music generation model. Democratized access to computationally expensive AI music generation with Gradio interface."
          techStack="Python, Gradio, Google Colab"
          url="https://github.com/vzakharov/jukebox-webui"
        />

        <ProjectCard
          title="almostmagic"
          stars={65}
          description="Add AI to your app with one line of code. Lightweight TypeScript wrapper that abstracts prompt engineering complexity with single-function API."
          techStack="TypeScript, OpenAI API"
          url="https://github.com/losideadores/almostmagic"
        />

        <ProjectCard
          title="write"
          description="One of the first text processors with fully configurable LLM provider integration. Way ahead of its time, even if I was the only one using it."
          techStack="Vue, TypeScript"
          url="https://github.com/vzakharov/write"
        />

        <ProjectCard
          title="mindy"
          description="Group AI chatbot. ChatGPT before ChatGPT."
          techStack="Nuxt.js, Vue.js, Vuex"
          url="https://github.com/vzakharov/mindy"
        />

        <ProjectCard
          title="ollum"
          description="Evolution-inspired LLM framework where models act as both creators AND critics. Seeding → Elo-style evaluation → mutation → crossover for iterative content evolution."
          techStack="Python, async-first"
          url="https://github.com/vzakharov/ollum"
        />

        <ProjectCard
          title="sympathico"
          description="Experimental neural networks without traditional weight matrices or backpropagation. Networks as 'colonies of symbolic paths' using evolutionary principles."
          techStack="Python"
          url="https://github.com/vzakharov/sympathico"
        />

        <ProjectCard
          title="komple"
          stars={13}
          description="AI autocomplete for any website. Press Ctrl+Space for suggestions in any text field. Chrome extension with multiple API endpoint support."
          techStack="JavaScript, Vue.js, BPE encoder"
          url="https://github.com/vzakharov/komple"
        />

        <ProjectCard
          title="ideality-nuxt"
          description="AI ideation platform allowing creation of no-code widgets for one-click AI generations (copy, ideas, etc.) embeddable on any website. Configurable by users."
          techStack="Nuxt.js, Vue.js, Bubble backend"
          url="https://github.com/vzakharov/ideality-nuxt"
        />

        <ProjectCard
          title="suno-power-tools"
          description="Collection of in-browser-console tools for Suno. Includes tree-structure display for visualizing clip relationships, extensions, and inpaintings."
          techStack="HTML, JavaScript"
          url="https://github.com/vzakharov/suno-power-tools"
        />
      </SimpleGrid>

      <Subheading>Professional Work</Subheading>

      <Stack gap={16}>
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

        <Card>
          <Title order={4} mb={8}>
            Voicemod (2023)
          </Title>
          <Text mb={12}>
            Prototyper for Experience & Innovation. Built YAML-powered Discord
            bot framework for zero-code bot creation and local Python web API
            with ChatGPT interface.
          </Text>
          <Text size="sm" ff="monospace" opacity={0.6}>
            Python, YAML, Discord API
          </Text>
        </Card>
      </Stack>
    </Section>
  );
}
