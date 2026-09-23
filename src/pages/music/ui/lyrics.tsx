import { Anchor, Box, Stack, Text } from '@mantine/core';
import Markdown, { type Components } from 'react-markdown';

import type { LyricLine, SongLyrics, WithStanzas } from '@/shared/content';
import { loadMessages, type Locale, type WithLocale } from '@/shared/i18n';
import { cx } from '@/shared/lib/class-names';
import { Subheading } from '@/shared/ui';

import classes from './music.module.scss';
import { NotedSpan } from './noted-span';

export type LyricsProps = WithLocale & { lyrics: SongLyrics };

/**
 * The words, and their crib beside them where the reader's language is not the
 * one they are sung in. Stanza for stanza rather than line for line: the lines
 * of a translated stanza do not correspond, and pretending they do makes a
 * table that is wrong in a way nothing on the page admits.
 *
 * Each language is one element holding all of its stanzas, so a selection
 * started in one column stays in it.
 */
export function Lyrics({ lyrics, locale }: LyricsProps) {
  const { stanzas, translation, language } = lyrics;
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
        <Stack gap={24} lang={language}>
          <StanzaList {...{ stanzas }} />
        </Stack>
      ) : (
        <Box className={classes['lyricsScroll']}>
          <Box
            className={classes['lyricsColumns']}
            __vars={{ '--stanzas': String(stanzas.length) }}
          >
            <LyricsColumn {...{ stanzas }} lang={language} />
            <LyricsColumn stanzas={translation} lang={locale} muted />
          </Box>
        </Box>
      )}
    </Stack>
  );
}

type LyricsColumnProps = WithStanzas & {
  lang: Locale;
  /** The crib column, held back so the sung words read first. */
  muted?: boolean;
};

function LyricsColumn({ stanzas, lang, muted = false }: LyricsColumnProps) {
  return (
    <Box
      className={cx(classes['lyricsColumn'], muted && classes['mutedColumn'])}
      {...{ lang }}
    >
      <StanzaList {...{ stanzas }} />
    </Box>
  );
}

function StanzaList({ stanzas }: WithStanzas) {
  // Stanzas have no identity of their own, and a repeated chorus is a repeated
  // string — the index is what distinguishes them.
  return stanzas.map((lines, index) => <Stanza key={index} {...{ lines }} />);
}

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

type StanzaProps = { lines: LyricLine[] };

/**
 * A stanza as it was written: one element per line, so a line break needs
 * nothing invisible at the end of a line to survive. `div`s throughout, since
 * a note's popover is a block and sits beside the words it hangs off.
 */
function Stanza({ lines }: StanzaProps) {
  return (
    <Text component="div" lh={1.75}>
      {lines.map((spans, index) => (
        <div key={index}>
          {spans.map(({ text, note }, at) =>
            note === undefined ? (
              text
            ) : (
              <NotedSpan key={at} {...{ text }}>
                <Markdown components={NOTE_COMPONENTS}>{note}</Markdown>
              </NotedSpan>
            ),
          )}
        </div>
      ))}
    </Text>
  );
}
