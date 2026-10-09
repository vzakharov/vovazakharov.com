import { Box, Stack, Text } from '@mantine/core';
import { Fragment } from 'react';
import Markdown, { type Components } from 'react-markdown';

import { loadMessages, type WithLocale } from '@/shared/i18n';
import { cx } from '@/shared/lib/class-names';
import type { SungLanguage } from '@/shared/music-catalogue';
import type { WithText } from '@/shared/typings';
import { Subheading, TextLink } from '@/shared/ui';

import { inlineRuns } from '../lib/lyric-inline';
import type { LyricLine, WithStanzas } from '../lib/lyric-notes';
import type { SongLyrics } from '../lib/song-text';
import { romanizedTag, type Transliteration } from '../lib/transliteration';
import classes from './music.module.scss';
import { NotedSpan } from './noted-span';
import {
  TransliterationToggle,
  type TransliterationToggleProps,
} from './transliteration-toggle';

export type LyricsProps = WithLocale & {
  lyrics: SongLyrics;
  /** What the crib is, where it is more than a crib: one line of markdown. */
  cribNote?: string;
};

/**
 * A note is one line of markdown, so the paragraph the parser wraps it in is
 * dropped, and a link opens beside the song rather than over it.
 */
const NOTE_COMPONENTS: Components = {
  p: ({ children }) => <>{children}</>,
  // The type is HTML's, where an `<a>` may have no address; a markdown link
  // always has one.
  a: ({ href = '', children }) => <TextLink {...{ href }}>{children}</TextLink>,
};

/**
 * The words, and their crib beside them where the reader's language is not the
 * one they are sung in. Stanza for stanza rather than line for line: the lines
 * of a translated stanza do not correspond, and pretending they do makes a
 * table that is wrong in a way nothing on the page admits.
 *
 * Each language is one element holding all of its stanzas, so a selection
 * started in one column stays in it.
 *
 * Words with a transliteration get a switch above their column that sets it
 * line under line — beside the script, never in place of it: Latin letters
 * standing in for a Quranic phrase are what scholars object to, and a reading
 * aid under it is what they accept.
 */
export function Lyrics({ lyrics, locale, cribNote }: LyricsProps) {
  const { stanzas, translation, language, transliteration } = lyrics;
  const { lyrics: labels } = loadMessages(locale).music;
  const words = { stanzas, transliteration, lang: language };
  const switchLabel =
    transliteration === undefined ? undefined : labels.transliteration;

  return (
    <Stack component="section" gap={24}>
      <Box>
        <Subheading>{labels.title}</Subheading>
        {translation !== undefined && (
          <Text size="sm" opacity={0.6} mt={8}>
            {cribNote === undefined ? (
              labels.crib
            ) : (
              <Markdown components={NOTE_COMPONENTS}>{cribNote}</Markdown>
            )}
          </Text>
        )}
      </Box>

      {translation === undefined ? (
        <WordsBox className={classes['lyricsStack']} label={switchLabel}>
          <Stack gap={24} lang={language}>
            <StanzaList {...words} />
          </Stack>
        </WordsBox>
      ) : (
        <Box className={classes['lyricsScroll']}>
          <WordsBox
            className={classes['lyricsColumns']}
            style={{ '--stanzas': stanzas.length }}
            label={switchLabel}
          >
            <LyricsColumn {...words} />
            <LyricsColumn stanzas={translation} lang={locale} muted />
          </WordsBox>
        </Box>
      )}
    </Stack>
  );
}

type WordsBoxProps = Omit<TransliterationToggleProps, 'label'> & {
  /** The transliteration switch's, where the words have a transliteration. */
  label: string | undefined;
};

function WordsBox({ label, ...box }: WordsBoxProps) {
  return label === undefined ? (
    <Box {...box} />
  ) : (
    <TransliterationToggle {...box} {...{ label }} />
  );
}

type Romanizable = { transliteration?: Transliteration | undefined };

type LyricsColumnProps = WithStanzas &
  Romanizable & {
    lang: SungLanguage;
    /** The crib: set dimmer than the words, so they are what reads first. */
    muted?: boolean;
  };

function LyricsColumn({ lang, muted = false, ...words }: LyricsColumnProps) {
  return (
    <Box
      className={cx(classes['lyricsColumn'], muted && classes['mutedColumn'])}
      {...{ lang }}
    >
      <StanzaList {...words} {...{ lang }} />
    </Box>
  );
}

function StanzaList({
  stanzas,
  transliteration,
  lang,
}: WithStanzas & Romanizable & { lang: SungLanguage }) {
  const tag = romanizedTag(lang);

  // Stanzas have no identity of their own, and a repeated chorus is a repeated
  // string — the index is what distinguishes them.
  return stanzas.map((lines, index) => (
    <Stanza
      key={index}
      {...{ lines, tag }}
      romanized={transliteration?.[index]}
    />
  ));
}

/** The BCP 47 tag romanized lines are set in. */
type Tagged = { tag: string };

type StanzaProps = Tagged & {
  lines: LyricLine[];
  /** Each entry's romanization, where the words have one. */
  romanized: string[] | undefined;
};

/**
 * A stanza as it was written: one element per line, so a line break needs
 * nothing invisible at the end of a line to survive — save for lines under one
 * note, which share an element and keep their breaks in its text. `div`s
 * throughout, since a note's popover is a block and sits beside the words it
 * hangs off.
 *
 * A romanized line sits under its own, in the static HTML whether shown or
 * not: after the line, or — in lines sharing a note — inside the block, under
 * each of them.
 */
function Stanza({ lines, romanized, tag }: StanzaProps) {
  return (
    <Text component="div" lh={1.75}>
      {lines.map((spans, index) => {
        const under = romanized?.[index];
        const block = under?.includes('\n') === true ? under : undefined;

        return (
          <div key={index} className={classes['lyricLine']}>
            {spans.map(({ text, note }, at) => {
              const words =
                block === undefined ? (
                  <Inline {...{ text }} />
                ) : (
                  <Interlinear {...{ text, tag }} under={block} />
                );

              return note === undefined ? (
                <Fragment key={at}>{words}</Fragment>
              ) : (
                <NotedSpan key={at} {...{ words }}>
                  <Markdown components={NOTE_COMPONENTS}>{note}</Markdown>
                </NotedSpan>
              );
            })}
            {block === undefined && under !== undefined && (
              <Romanized text={under} {...{ tag }} />
            )}
          </div>
        );
      })}
    </Text>
  );
}

/** Lines of a block under one note, each followed by its romanization. */
function Interlinear({
  text,
  under,
  tag,
}: WithText & Tagged & { under: string }) {
  const romanized = under.split('\n');

  return text.split('\n').map((line, index) => (
    <Fragment key={index}>
      <span className={classes['interlinearLine']}>
        <Inline text={line} />
      </span>
      <Romanized text={romanized[index] ?? ''} {...{ tag }} />
    </Fragment>
  ));
}

/** A line in Latin letters, italic as a transliteration is wherever the page shows one. */
function Romanized({ text, tag }: WithText & Tagged) {
  return (
    <span className={classes['transliteration']}>
      <i lang={tag}>
        <Inline {...{ text }} />
      </i>
    </span>
  );
}

/** A stretch of verse with its italics set. */
function Inline({ text }: WithText) {
  return inlineRuns(text).map(({ text: run, emphasis }, index) =>
    emphasis ? <em key={index}>{run}</em> : run,
  );
}
