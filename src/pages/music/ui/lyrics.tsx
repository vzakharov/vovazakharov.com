import { Box, Stack, Text } from '@mantine/core';

import type { SongLyrics, WithStanzas } from '@/shared/content';
import { loadMessages, type WithLocale } from '@/shared/i18n';
import { Subheading } from '@/shared/ui';

import classes from './music.module.scss';

export type LyricsProps = WithLocale & { lyrics: SongLyrics };

/**
 * The words, and their crib beside them where the reader's language is not the
 * one they are sung in. Stanza for stanza rather than line for line: the lines
 * of a translated stanza do not correspond, and pretending they do makes a
 * table that is wrong in a way nothing on the page admits.
 */
export function Lyrics({ lyrics, locale }: LyricsProps) {
  const { stanzas, translation } = lyrics;
  const { lyrics: labels } = loadMessages(locale).music;

  return (
    <Stack component="section" gap={24}>
      <Box>
        <Subheading>{labels.title}</Subheading>
        {translation !== undefined && (
          <Text size="sm" opacity={0.6} mt={8}>
            {labels.crib}
          </Text>
        )}
      </Box>

      {translation === undefined ? (
        <StanzaColumn {...{ stanzas }} />
      ) : (
        <Stack gap={24}>
          {stanzas.map((stanza, index) => (
            // Stanzas have no identity of their own, and a repeated chorus is
            // a repeated string — the index is what distinguishes them.
            <Box key={index} className={classes['lyricsPair']}>
              <Stanza lines={stanza} />
              <Stanza lines={translation[index] ?? []} muted />
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

function StanzaColumn({ stanzas }: WithStanzas) {
  return (
    <Stack gap={24}>
      {stanzas.map((lines, index) => (
        <Stanza key={index} {...{ lines }} />
      ))}
    </Stack>
  );
}

type StanzaProps = {
  lines: string[];
  /** The crib column, held back so the sung words read first. */
  muted?: boolean;
};

/**
 * A stanza as it was written: one element per line, so a line break needs
 * nothing invisible at the end of a line to survive.
 */
function Stanza({ lines, muted = false }: StanzaProps) {
  return (
    <Text component="p" lh={1.75} opacity={muted ? 0.7 : 1}>
      {lines.map((line, index) => (
        <span key={index} className={classes['lyricLine']}>
          {line}
        </span>
      ))}
    </Text>
  );
}
