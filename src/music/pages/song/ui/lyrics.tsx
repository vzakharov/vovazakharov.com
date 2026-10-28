import { Box, Stack, Text } from '@mantine/core';
import { Fragment } from 'react';
import Markdown, { type Components } from 'react-markdown';

import type { WithLocale } from '@/kernel/shared/i18n';
import { cx } from '@/kernel/shared/lib/class-names';
import type { WithFileName, WithText } from '@/kernel/shared/typings';

import { Subheading, TextLink } from '@/shell/shared/ui';

import { resolveAuthoredUrl } from '@/blog/shared/content';

import {
  type ScriptKept,
  type SongLyrics,
  SONGS,
  type SungLanguage,
} from '@/music/shared/catalogue';
import {
  inlineRuns,
  type LyricLine,
  romanizedTag,
  type Transliteration,
  type WithStanzas,
} from '@/music/shared/catalogue/index.node-safe';
import { messages } from '@/music/shared/i18n';
import { NotedSpan } from '@/music/shared/ui';

import classes from './lyrics.module.scss';

/** `fileName` is the song's file, which the notes' relative links resolve
 * against. */
export type LyricsProps = WithLocale &
  WithFileName & {
    lyrics: SongLyrics;
    /** What the crib is, where it is more than a crib: one line of markdown. */
    cribNote?: string;
  };

/**
 * A note is one line of markdown, so the paragraph the parser wraps it in is
 * dropped, and a link opens beside the song rather than over it — at the page
 * a `./x.md` names, as in the song's story.
 */
function noteComponents(fileName: string): Components {
  return {
    p: ({ children }) => <>{children}</>,
    // The type is HTML's, where an `<a>` may have no address; a markdown link
    // always has one.
    a: ({ href = '', children }) => (
      <TextLink href={resolveAuthoredUrl(SONGS.id, fileName, href)}>
        {children}
      </TextLink>
    ),
  };
}

/**
 * The words, and their crib beside them where the reader's language is not the
 * one they are sung in. Stanza for stanza rather than line for line: the lines
 * of a translated stanza do not correspond, and pretending they do makes a
 * table that is wrong in a way nothing on the page admits.
 *
 * Each language is one element holding all of its stanzas, so a selection
 * started in one column stays in it.
 *
 * Words with a transliteration follow the reader's script, which the song's
 * title switches: in Latin mode each line shows in Latin letters, in place of
 * the script — or, for words that keep their script, line under line beside it.
 */
export function Lyrics({ lyrics, locale, fileName, cribNote }: LyricsProps) {
  const { stanzas, translation, language, transliteration, keepsScript } =
    lyrics;
  const { lyrics: labels } = messages(locale);
  const notes = noteComponents(fileName);
  const words = {
    stanzas,
    transliteration,
    keepsScript,
    notes,
    lang: language,
  };

  return (
    <Stack component="section" gap={24}>
      <Box>
        <Subheading>{labels.title}</Subheading>
        {translation !== undefined && (
          <Text size="sm" opacity={0.6} mt={8}>
            {cribNote === undefined ? (
              labels.crib
            ) : (
              <Markdown components={notes}>{cribNote}</Markdown>
            )}
          </Text>
        )}
      </Box>

      {translation === undefined ? (
        <Stack gap={24} lang={language}>
          <StanzaList {...words} />
        </Stack>
      ) : (
        <Box className={classes['lyricsScroll']}>
          <Box
            className={classes['lyricsColumns']}
            style={{ '--stanzas': stanzas.length }}
          >
            <LyricsColumn {...words} />
            <LyricsColumn
              stanzas={translation}
              lang={locale}
              {...{ notes }}
              muted
            />
          </Box>
        </Box>
      )}
    </Stack>
  );
}

type Romanizable = {
  transliteration?: Transliteration | undefined;
} & Partial<ScriptKept>;

/** How a note's markdown is set: `noteComponents`, for the song's file. */
type NoteSetting = { notes: Components };

type LyricsColumnProps = WithStanzas &
  Romanizable &
  NoteSetting & {
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
  keepsScript = false,
  notes,
  lang,
}: WithStanzas & Romanizable & NoteSetting & { lang: SungLanguage }) {
  const tag = romanizedTag(lang);

  // Stanzas have no identity of their own, and a repeated chorus is a repeated
  // string — the index is what distinguishes them.
  return stanzas.map((lines, index) => (
    <Stanza
      key={index}
      {...{ lines, tag, keepsScript, notes }}
      romanized={transliteration?.[index]}
    />
  ));
}

/** The BCP 47 tag romanized lines are set in. */
type Tagged = { tag: string };

/** How a line of the words is set: its romanization's tag and its notes. */
type LineSetting = Tagged & NoteSetting;

type StanzaProps = LineSetting & {
  lines: LyricLine[];
  /** Each entry's romanization, where the words have one. */
  romanized: string[] | undefined;
  keepsScript: boolean;
};

/**
 * A stanza as it was written: one element per line, so a line break needs
 * nothing invisible at the end of a line to survive — save for lines under one
 * note, which share an element and keep their breaks in its text. `div`s
 * throughout, since a note's popover is a block and sits beside the words it
 * hangs off.
 *
 * Both spellings are in the static HTML, `<html>`'s `data-script` picking which
 * shows.
 */
function Stanza({ lines, romanized, tag, keepsScript, notes }: StanzaProps) {
  return (
    <Text component="div" lh={1.75}>
      {lines.map((spans, index) => {
        const latin = romanized?.[index];

        return (
          <div key={index} className={classes['lyricLine']}>
            {latin === undefined || keepsScript ? (
              <LineWords {...{ spans, tag, notes }} under={latin} />
            ) : (
              <>
                <div data-spelling="original">
                  <LineWords {...{ spans, tag, notes }} />
                </div>
                <div data-spelling="latin">
                  <i lang={tag}>
                    <Inline text={latin} />
                  </i>
                </div>
              </>
            )}
          </div>
        );
      })}
    </Text>
  );
}

type LineWordsProps = LineSetting & {
  spans: LyricLine;
  /** The line's romanization, set under it in Latin mode. */
  under?: string | undefined;
};

/** A line's words with their notes, and its romanization under it where given. */
function LineWords({ spans, tag, under, notes }: LineWordsProps) {
  const block = under?.includes('\n') === true ? under : undefined;

  return (
    <>
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
            <Markdown components={notes}>{note}</Markdown>
          </NotedSpan>
        );
      })}
      {block === undefined && under !== undefined && (
        <Romanized text={under} {...{ tag }} />
      )}
    </>
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

/** A line in Latin letters under its own, shown in Latin mode only. */
function Romanized({ text, tag }: WithText & Tagged) {
  return (
    <span className={classes['transliteration']} data-spelling="latin">
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
