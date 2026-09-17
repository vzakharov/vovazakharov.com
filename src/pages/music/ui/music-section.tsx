import { Anchor, Box, Stack, Text, Title } from '@mantine/core';

import {
  MUSIC_ORGANIZATION,
  MUSIC_ORGANIZATION_URL,
  MUSIC_PROJECT_NAMES,
  MUSIC_PROJECTS,
} from '@/shared/config';
import { Card, Section, Subheading } from '@/shared/ui';

export function MusicSection() {
  return (
    <Section id="music" standalone>
      <Box>
        <Text size="lg" lh={1.625} fs="italic" mb={16}>
          “AI as collaborator, not tool or replacement”
        </Text>
        <Text size="lg" lh={1.625}>
          Been writing music since preteens, recently focused on AI music (since
          way before Suno — think OpenAI Jukebox). I view AI not as a
          replacement for my creativity, neither as a tool, but as a brilliant
          musician who can bring my ideas to life in ways I often wouldn’t have
          imagined. To be clear, I write most of my AI music starting from my
          own humming/piano playing/MIDIs, so it’s “mine” in most copyright
          senses.
        </Text>
      </Box>

      <Subheading>Active Projects</Subheading>

      <Stack gap={24}>
        {MUSIC_PROJECT_NAMES.map((artist) => {
          const { label, artistId } = MUSIC_PROJECTS[artist];

          return (
            <Card key={artist}>
              <Title order={4} mb={12}>
                {label}
              </Title>
              <SpotifyEmbed {...{ artist, artistId }} />
            </Card>
          );
        })}
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
            href={MUSIC_ORGANIZATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            inherit
          >
            github.com/{MUSIC_ORGANIZATION}
          </Anchor>
        </Text>
      </Stack>
    </Section>
  );
}

type SpotifyEmbedProps = {
  artist: string;
  artistId: string;
};

function SpotifyEmbed({ artist, artistId }: SpotifyEmbedProps) {
  return (
    <iframe
      title={`${artist} on Spotify`}
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
