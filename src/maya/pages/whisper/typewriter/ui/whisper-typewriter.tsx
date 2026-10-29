'use client';

import { Stack, Text, Textarea, Title, Tooltip } from '@mantine/core';
import { useMemo, useState } from 'react';

import type { Messages } from '../../config/i18n';
import { fold, overhear, type Stretch } from '../model/hush';
import {
  type Counted,
  fileBySound,
  type Lexicon,
  readSounds,
} from '../model/listening-post';

type WithCopy = { copy: Messages };

type WithStretches = { stretches: Stretch[] };

/** How many of the passed-over words a tooltip names. */
const RIVALS_SHOWN = 5;

/** A catalogue string with its `{name}` slots filled. */
const fill = (template: string, values: Record<string, string | number>) =>
  template.replaceAll(/{(\w+)}/g, (slot, name: string) =>
    String(values[name] ?? slot),
  );

/** One test for both the tally’s right and the text’s red, so they agree. */
const readRight = (guess: string | undefined, typed: string) =>
  guess === fold(typed);

function Heard({ stretches }: WithStretches) {
  return (
    <Text ff="monospace" style={{ overflowWrap: 'anywhere' }}>
      {stretches.map((stretch) => (stretch.word ? stretch.sounds : ' · '))}
    </Text>
  );
}

type WrittenProps = WithStretches & WithCopy & { lexicon: Lexicon };

function Written({ stretches, lexicon, copy }: WrittenProps) {
  return (
    <Text size="lg">
      {stretches.map((stretch, index) => {
        if (!stretch.word) return stretch.typed;

        const reading = readSounds(stretch.sounds, lexicon);

        if (reading.guess === undefined) {
          return (
            <Tooltip key={index} label={copy.unknown}>
              <Text span ff="monospace" c="dimmed">
                {stretch.sounds}
              </Text>
            </Tooltip>
          );
        }

        const right = readRight(reading.guess, stretch.typed);
        const rivals = reading.passedOver.slice(0, RIVALS_SHOWN);
        const label = [
          right ? undefined : fill(copy.typed, { word: stretch.typed }),
          rivals.length > 0
            ? fill(copy.alike, { words: rivals.join(', ') })
            : undefined,
        ]
          .filter(Boolean)
          .join('. ');

        return (
          <Tooltip key={index} {...{ label }} disabled={!label}>
            <Text
              span
              c={right ? undefined : 'red'}
              td={rivals.length > 0 ? 'underline dotted' : undefined}
            >
              {reading.guess}
            </Text>
          </Tooltip>
        );
      })}
    </Text>
  );
}

type WhisperTypewriterProps = WithCopy & { words: readonly Counted[] };

export function WhisperTypewriter({ words, copy }: WhisperTypewriterProps) {
  const lexicon = useMemo(() => fileBySound(words), [words]);
  const [text, setText] = useState(copy.sample);
  const stretches = useMemo(() => overhear(text), [text]);
  const typed = stretches.filter((stretch) => stretch.word);
  const right = typed.filter(({ sounds, typed: word }) =>
    readRight(readSounds(sounds, lexicon).guess, word),
  ).length;

  return (
    <Stack gap="xl">
      <Textarea
        label={copy.typewriter}
        description={copy.typeHint}
        autosize
        minRows={3}
        size="lg"
        value={text}
        onChange={(event) => {
          setText(event.currentTarget.value);
        }}
      />

      <Stack gap="xs">
        <Title order={2}>{copy.heard}</Title>
        <Heard {...{ stretches }} />
      </Stack>

      <Stack gap="xs">
        <Title order={2}>{copy.written}</Title>
        <Written {...{ stretches, lexicon, copy }} />
        <Text c="dimmed">
          {fill(copy.tally, { right, total: typed.length })}
        </Text>
      </Stack>
    </Stack>
  );
}
