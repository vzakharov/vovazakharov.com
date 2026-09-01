import { ReactNode } from 'react';
import Image from 'next/image';
import {
  Anchor,
  Box,
  Button,
  Center,
  Container,
  Divider,
  Group,
  List,
  ListItem,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { ThemeToggle } from '@/features/switch-theme';
import { COLLECTIONS, renderPrimaryDocuments } from '@/shared/content';
import { Card, InternalLink, cssColor } from '@/shared/ui';
import { ArticleCard } from './article-card';
import { ProjectCard } from './project-card';
import classes from './home-page.module.scss';

// A Stack's gap does not collapse with its children's margins, so against the
// 24px gap this reads as the 32px these headings want.
const SUBHEADING_GAP = 8;

export async function HomePage() {
  // Titles come from the documents themselves, so a renamed piece cannot drift.
  const caseStudies = await renderPrimaryDocuments('case-studies');

  return (
    <Box mih="100vh" p={{ base: 32, sm: 80 }} pb={80}>
      <Container size={896} px={0}>
        <Stack gap={64}>
          <Group justify="flex-end">
            <ThemeToggle />
          </Group>

          <Box component="section">
            <Stack gap={24} ta="center">
              <Center>
                <Image
                  src="/ava.png"
                  alt="Vova Zakharov"
                  width={150}
                  height={150}
                  style={{ borderRadius: '50%' }}
                  priority
                />
              </Center>
              <Box>
                <Title order={1} mb={12}>
                  Vova Zakharov
                </Title>
                <Text
                  fz={{ base: 20, sm: 24 }}
                  lh={{ base: '28px', sm: '32px' }}
                  opacity={0.8}
                >
                  Developer, AI tinkerer, word shaker, generative metalhead
                </Text>
                <Text mt={16} opacity={0.7}>
                  Helping our future overlords walk since 2020
                </Text>
              </Box>
            </Stack>
          </Box>

          <Box component="nav">
            <Group justify="center" gap={24}>
              <Text size="lg" component="span">
                <Anchor href="#dev" underline="hover" inherit>
                  dev
                </Anchor>
                &nbsp;(
                <InternalLink href="/cv" underline="hover" inherit>
                  cv
                </InternalLink>
                )
              </Text>
              <Anchor href="#music" size="lg" underline="hover">
                music
              </Anchor>
              <Anchor href="#writing" size="lg" underline="hover">
                writing
              </Anchor>
              <Anchor href="#contact" size="lg" underline="hover">
                contact
              </Anchor>
            </Group>
          </Box>

          <Section id="dev">
            <Stack gap={24}>
              <Text size="lg" lh={1.625}>
                I build stuff, and here’s what you’ll find: stuff that works,
                stuff that doesn’t, and stuff that’s still a work in progress.
              </Text>
              <Text size="lg" lh={1.625}>
                I’m currently looking for new challenges, so have a look at my{' '}
                <InternalLink href="/cv" inherit>
                  CV
                </InternalLink>{' '}
                if you’re looking for new people.
              </Text>
            </Stack>

            <Title order={3} mt={SUBHEADING_GAP}>
              Case studies
            </Title>

            <Stack gap={16}>
              {caseStudies.map(({ document, rendered }) => (
                <InternalLink
                  key={document.slug}
                  href={document.route}
                  underline="never"
                  c="inherit"
                  display="block"
                  className={classes.caseStudyLink}
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
                <InternalLink
                  href={COLLECTIONS['case-studies'].routeBase}
                  inherit
                >
                  All case studies, including the shorter cuts →
                </InternalLink>
              </Text>
            </Stack>

            <Title order={3} mt={SUBHEADING_GAP}>
              Featured Projects
            </Title>

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

            <Title order={3} mt={SUBHEADING_GAP}>
              Professional Work
            </Title>

            <Stack gap={16}>
              <Card>
                <Title order={4} mb={8}>
                  DDB / randddb.com (2023-2025)
                </Title>
                <Text mb={12}>
                  Experimental AI platform at one of the world’s largest ad
                  firms. Built enterprise-scale suite:
                </Text>
                <List spacing={4} mb={12}>
                  <ListItem>
                    <strong>Chatbot:</strong> ChatGPT-style corporate assistant
                    with documents, images, personas, multi-user support
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
                    <strong>YesYouCannes:</strong> Cannes award deck generator
                    (idea → imagery in minutes)
                  </ListItem>
                  <ListItem>
                    <strong>Spaces:</strong> White-label mini-platforms for
                    agency clients
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
                  AI-agent-based review intelligence tool for brand marketing.
                  Built end-to-end: automated review collection → AI
                  summarization (SWOT, competitive positioning) → SaaS platform.
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
                  Prototyper for Experience & Innovation. Built YAML-powered
                  Discord bot framework for zero-code bot creation and local
                  Python web API with ChatGPT interface.
                </Text>
                <Text size="sm" ff="monospace" opacity={0.6}>
                  Python, YAML, Discord API
                </Text>
              </Card>
            </Stack>
          </Section>

          <Section id="music">
            <Box>
              <Text size="lg" lh={1.625} fs="italic" mb={16}>
                “AI as collaborator, not tool or replacement”
              </Text>
              <Text size="lg" lh={1.625}>
                Been writing music since preteens, recently focused on AI music
                (since way before Suno — think OpenAI Jukebox). I view AI not as
                a replacement for my creativity, neither as a tool, but as a
                brilliant musician who can bring my ideas to life in ways I
                often wouldn’t have imagined. To be clear, I write most of my AI
                music starting from my own humming/piano playing/MIDIs, so it’s
                “mine” in most copyright senses.
              </Text>
            </Box>

            <Title order={3} mt={SUBHEADING_GAP}>
              Active Projects
            </Title>

            <Stack gap={24}>
              <Card>
                <Title order={4} mb={12}>
                  GENERATED
                </Title>
                <SpotifyEmbed artistId="3tnTz9WCaghp3PJPSsTxQW" />
              </Card>

              <Card>
                <Title order={4} mb={12}>
                  Полуживые (ru. for “Half-Alive”)
                </Title>
                <SpotifyEmbed artistId="2rdnjZV6ahlz4pKeh9a8B3" />
              </Card>

              <Card>
                <Title order={4} mb={12}>
                  Downtemple
                </Title>
                <SpotifyEmbed artistId="2vN8JKg3rQLxleZ9xsafy6" />
              </Card>
            </Stack>

            <Stack gap={8}>
              <Text size="sm" opacity={0.7}>
                Also on{' '}
                <Anchor
                  href="https://soundcloud.com/vzkrv"
                  target="_blank"
                  rel="noopener noreferrer"
                  inherit
                >
                  SoundCloud
                </Anchor>{' '}
                and{' '}
                <Anchor
                  href="https://suno.com/@vova"
                  target="_blank"
                  rel="noopener noreferrer"
                  inherit
                >
                  Suno
                </Anchor>
              </Text>
              <Text size="sm" opacity={0.7}>
                All my music is open-source:{' '}
                <Anchor
                  href="https://vzakharov.github.io/vovas-music"
                  target="_blank"
                  rel="noopener noreferrer"
                  inherit
                >
                  vzakharov.github.io/vovas-music
                </Anchor>
              </Text>
            </Stack>
          </Section>

          <Section id="writing">
            <Box>
              <Text size="lg" lh={1.625}>
                Before I became a full-time coder, I worked for 22 years as a
                translator, editor, and copywriter. Although I don’t do it much
                anymore, I still find joy in stretching the writing muscles,
                especially with my AI co-conspirator, “synthetic buddy” Finn
                O’Connor, under the brand of{' '}
                <Anchor
                  href="https://glitchporn.substack.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  inherit
                >
                  Glitchporn
                </Anchor>
                .
              </Text>
              <Text size="xl" fs="italic" mt={16} opacity={0.8}>
                “Caressing the cracks in reality until something breaks”
              </Text>
            </Box>

            <Title order={3} mt={SUBHEADING_GAP}>
              Featured Articles
            </Title>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing={16}>
              <ArticleCard
                title="Hard Times, Strong Men, and Other Convenient Memes"
                description="Systematic dismantling of the civilizational cycle meme with historical counterexamples and a warning against uncritical support for authoritarian rhetoric."
                url="https://glitchporn.substack.com/p/hard-times-strong-men"
              />

              <ArticleCard
                title="The Illusion of Thinking Different™"
                description="Critique of Apple's research paper on Large Reasoning Models — linguistic sleight-of-hand, strawman arguments, and buried data showing what they claimed to disprove."
                url="https://glitchporn.substack.com/p/the-illusion-of-thinking-different"
              />

              <ArticleCard
                title="The Post-Vacation Slump Survival Guide"
                description="Compassionate take on motivation crashes after coding breaks. Practical advice on dopamine habit loops, cognitive inertia, and joy-driven productivity."
                url="https://glitchporn.substack.com/p/post-vacation-slump-survival-guide"
              />
            </SimpleGrid>

            <Box mt={SUBHEADING_GAP}>
              <Button
                component="a"
                href="https://glitchporn.substack.com"
                target="_blank"
                rel="noopener noreferrer"
                variant="default"
                size="md"
                h={50}
                px={24}
              >
                Read More on Glitchporn
              </Button>
            </Box>
          </Section>

          <Section id="contact">
            <Card>
              <Stack gap={12}>
                <Text>
                  <strong>Email:</strong>{' '}
                  <Anchor href="mailto:vzakharov@gmail.com" inherit>
                    vzakharov@gmail.com
                  </Anchor>
                </Text>
                <Text>
                  <strong>GitHub:</strong>{' '}
                  <Anchor
                    href="https://github.com/vzakharov"
                    target="_blank"
                    rel="noopener noreferrer"
                    inherit
                  >
                    github.com/vzakharov
                  </Anchor>
                </Text>
                <Text>
                  <strong>LinkedIn:</strong>{' '}
                  <Anchor
                    href="https://linkedin.com/in/vovahimself"
                    target="_blank"
                    rel="noopener noreferrer"
                    inherit
                  >
                    linkedin.com/in/vovahimself
                  </Anchor>
                </Text>
                <Text>
                  <strong>X/Twitter:</strong>{' '}
                  <Anchor
                    href="https://x.com/vovahimself"
                    target="_blank"
                    rel="noopener noreferrer"
                    inherit
                  >
                    x.com/vovahimself
                  </Anchor>
                </Text>
                <Text>
                  <strong>Substack:</strong>{' '}
                  <Anchor
                    href="https://substack.com/@vovahimself"
                    target="_blank"
                    rel="noopener noreferrer"
                    inherit
                  >
                    substack.com/@vovahimself
                  </Anchor>
                </Text>
              </Stack>
            </Card>
          </Section>

          <Box component="footer" ta="center">
            <Divider mb={32} color={cssColor('border-hairline')} />
            <Text size="sm" opacity={0.6}>
              © {new Date().getFullYear()} Vova Zakharov. Built with Next.js.
            </Text>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

/** A titled top-level section; its anchor doubles as the nav target. */
function Section({ id, children }: { id: string; children: ReactNode }) {
  return (
    <Box component="section" id={id}>
      <Stack gap={24}>
        <Title order={2}>/{id}</Title>
        {children}
      </Stack>
    </Box>
  );
}

function SpotifyEmbed({ artistId }: { artistId: string }) {
  return (
    <iframe
      title={`Spotify artist ${artistId}`}
      // Replaced elements are inline by default, which would leave a
      // descender-sized gap under each embed inside its card.
      style={{ display: 'block', borderRadius: '12px' }}
      src={`https://open.spotify.com/embed/artist/${artistId}?utm_source=generator`}
      width="100%"
      height="152"
      frameBorder="0"
      allowFullScreen
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    />
  );
}
