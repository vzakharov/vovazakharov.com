'use client';

import {
  Button,
  Group,
  SegmentedControl,
  Slider,
  Stack,
  Text,
  Textarea,
} from '@mantine/core';
import { useEffect, useRef, useState } from 'react';

import type { Messages } from '@/shared/i18n';

import { BlindPlayer } from '../model/blind-player';
import {
  type BlindTest,
  type Variant,
  VARIANTS,
  variantUrls,
} from '../model/blind-test';

type BlindTestPlayerProps = { test: BlindTest; copy: Messages['blindTest'] };

const KEYS: Record<string, Variant> = {
  m: 'mix',
  0: 'mix',
  1: '1',
  2: '2',
  3: '3',
};
const TICK_MS = 200;
const SKIP_S = 5;

const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

const asVariant = (value: string) => VARIANTS.find((each) => each === value);

export function BlindTestPlayer({ test, copy }: BlindTestPlayerProps) {
  const playerRef = useRef<BlindPlayer>(null);
  // The variant carries over to the next song, which the load effect applies without re-running on each switch.
  const chosenRef = useRef<Variant>('mix');
  const [pieceIndex, setPieceIndex] = useState(0);
  const [variant, setVariant] = useState<Variant>('mix');
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string>();
  const [verdicts, setVerdicts] = useState<Record<string, string>>({});
  const piece = test.pieces[pieceIndex];

  const report = (error_: unknown) => {
    setError(String(error_));
  };

  useEffect(() => {
    const created = new BlindPlayer();
    playerRef.current = created;
    const timer = setInterval(() => {
      created.resync();
      setTime(created.time);
      setDuration(created.duration);
      setPlaying(created.playing);
    }, TICK_MS);
    return () => {
      clearInterval(timer);
      created.close().catch(report);
    };
  }, []);

  useEffect(() => {
    const current = playerRef.current;
    if (current === null || piece === undefined) return;
    const wasPlaying = current.playing;
    current.load(variantUrls(test, piece));
    current.select(chosenRef.current);
    if (wasPlaying) current.play().catch(report);
  }, [test, piece]);

  const choose = (next: Variant) => {
    playerRef.current?.select(next);
    chosenRef.current = next;
    setVariant(next);
  };

  const toggle = () => {
    const current = playerRef.current;
    if (current === null) return;
    if (current.playing) current.pause();
    else current.play().catch(report);
  };

  const seek = (seconds: number) => {
    playerRef.current?.seek(Math.max(0, seconds));
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLTextAreaElement) return;
      const picked = KEYS[event.key];
      if (picked === undefined) {
        switch (event.key) {
          case ' ': {
            toggle();
            break;
          }
          case 'ArrowLeft': {
            seek((playerRef.current?.time ?? 0) - SKIP_S);
            break;
          }
          case 'ArrowRight': {
            seek((playerRef.current?.time ?? 0) + SKIP_S);
            break;
          }
          default: {
            return;
          }
        }
      } else {
        choose(picked);
      }
      event.preventDefault();
    };
    globalThis.addEventListener('keydown', onKey);
    return () => {
      globalThis.removeEventListener('keydown', onKey);
    };
  });

  const setVerdict = (text: string) => {
    if (piece === undefined) return;
    setVerdicts({ ...verdicts, [piece.id]: text });
  };

  const summary = test.pieces
    .map(({ id }) => `${id}: ${verdicts[id] ?? '—'}`)
    .join('\n');

  return (
    <Stack gap="lg">
      <SegmentedControl
        orientation="vertical"
        fullWidth
        value={String(pieceIndex)}
        onChange={(value) => {
          setPieceIndex(Number(value));
        }}
        data={test.pieces.map(({ title }, index) => ({
          value: String(index),
          label: title,
        }))}
      />
      <SegmentedControl
        fullWidth
        size="lg"
        value={variant}
        onChange={(value) => {
          const picked = asVariant(value);
          if (picked !== undefined) choose(picked);
        }}
        data={VARIANTS.map((each) => ({
          value: each,
          label: each === 'mix' ? copy.mix : each,
        }))}
      />
      <Group gap="sm" wrap="nowrap">
        <Button onClick={toggle} w={110}>
          {playing ? copy.pause : copy.play}
        </Button>
        <Slider
          flex={1}
          min={0}
          max={duration || 1}
          step={0.1}
          value={time}
          onChange={seek}
          label={clock}
        />
        <Text size="sm" ff="monospace">
          {clock(time)} / {clock(duration)}
        </Text>
      </Group>
      {error !== undefined && (
        <Text role="alert" fw={700}>
          {copy.failed}: {error}
        </Text>
      )}
      <Text size="sm" c="dimmed">
        {copy.keys}
      </Text>
      <Textarea
        label={`${copy.verdict}: ${piece?.title ?? ''}`}
        placeholder={copy.verdictExample}
        value={piece === undefined ? '' : (verdicts[piece.id] ?? '')}
        onChange={(event) => {
          setVerdict(event.currentTarget.value);
        }}
        autosize
      />
      <Textarea label={copy.summary} value={summary} readOnly autosize />
    </Stack>
  );
}
