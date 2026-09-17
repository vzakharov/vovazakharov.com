import { Anchor, Box, Stack, Text, Title } from '@mantine/core';

import {
  MUSIC_ORGANIZATION,
  MUSIC_ORGANIZATION_URL,
  MUSIC_PROJECT_NAMES,
  MUSIC_PROJECTS,
} from '@/shared/config';
import { loadMessages, type WithLocale } from '@/shared/i18n';
import { Card, Section, Subheading } from '@/shared/ui';

export function MusicSection({ locale }: WithLocale) {
  const { intro, projects, alsoOn, and, openSource } =
    loadMessages(locale).music;

  return (
    <Section id="music" standalone>
      <Box>
        <Text size="lg" lh={1.625} fs="italic" mb={16}>
          {intro.quote}
        </Text>
        <Text size="lg" lh={1.625}>
          {intro.body}
        </Text>
      </Box>

      <Subheading>{projects}</Subheading>

      <Stack gap={24}>
        {MUSIC_PROJECT_NAMES.map((artist) => {
          const { label, artistId } = MUSIC_PROJECTS[artist];

          // A project with nothing on Spotify has nothing to embed; the songs
          // themselves are what say it exists.
          if (artistId === undefined) return null;

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
          {alsoOn}{' '}
          <Anchor
            href="https://soundcloud.com/vzkrv"
            target="_blank"
            rel="noopener noreferrer"
            inherit
          >
            SoundCloud
          </Anchor>{' '}
          {and}{' '}
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
          {openSource}{' '}
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
