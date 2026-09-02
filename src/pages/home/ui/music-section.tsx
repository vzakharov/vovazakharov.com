import { Anchor, Box, Stack, Text, Title } from '@mantine/core';

import { Card } from '@/shared/ui';

import { Section, Subheading } from './section';

export function MusicSection() {
  return (
    <Section id="music">
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
        <Card>
          <Title order={4} mb={12}>
            GENERATED
          </Title>
          <SpotifyEmbed artist="GENERATED" artistId="3tnTz9WCaghp3PJPSsTxQW" />
        </Card>

        <Card>
          <Title order={4} mb={12}>
            Полуживые (ru. for “Half-Alive”)
          </Title>
          <SpotifyEmbed artist="Полуживые" artistId="2rdnjZV6ahlz4pKeh9a8B3" />
        </Card>

        <Card>
          <Title order={4} mb={12}>
            Downtemple
          </Title>
          <SpotifyEmbed artist="Downtemple" artistId="2vN8JKg3rQLxleZ9xsafy6" />
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
