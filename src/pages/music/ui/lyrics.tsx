import { Anchor, Box, Stack, Text } from '@mantine/core';
import Markdown, { type Components } from 'react-markdown';

import type { LyricLine, SongLyrics, WithStanzas } from '@/shared/content';
import { loadMessages, type WithLocale } from '@/shared/i18n';
import { cx } from '@/shared/lib/class-names';
import { Subheading } from '@/shared/ui';

import { LineNote } from './line-note';
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
  lines: LyricLine[];
  /** The crib column, held back so the sung words read first. */
  muted?: boolean;
};

/**
 * A note is one line of markdown, so the paragraph the parser wraps it in is
 * dropped, and a link opens beside the song rather than over it.
 */
const NOTE_COMPONENTS: Components = {
  p: ({ children }) => <>{children}</>,
  a: ({ href, children }) => (
    <Anchor {...{ href }} target="_blank" rel="noopener noreferrer" inherit>
      {children}
    </Anchor>
  ),
};

/**
 * A stanza as it was written: one element per line, so a line break needs
 * nothing invisible at the end of a line to survive. The dimming is per line
 * rather than on the stanza, which would dim a note's popover with it.
 */
function Stanza({ lines, muted = false }: StanzaProps) {
  const className = cx(classes['lyricLine'], muted && classes['mutedLine']);

  return (
    <Text component="div" lh={1.75}>
      {lines.map(({ text, note }, index) =>
        note === undefined ? (
          <span key={index} {...{ className }}>
            {text}
          </span>
        ) : (
          <LineNote key={index} {...{ text, className }}>
            <Markdown components={NOTE_COMPONENTS}>{note}</Markdown>
          </LineNote>
        ),
      )}
    </Text>
  );
}
