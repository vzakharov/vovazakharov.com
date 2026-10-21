'use client';

import {
  Alert,
  Button,
  Group,
  SegmentedControl,
  Slider,
  Stack,
  Text,
  Textarea,
} from '@mantine/core';
import { useEffect, useRef, useState } from 'react';

import { BlindPlayer } from '../model/blind-player';
import {
  type BlindTest,
  VARIANTS,
  type Variant,
  variantUrls,
} from '../model/blind-test';

const LABELS: Record<Variant, string> = { mix: 'Микс', 1: '1', 2: '2', 3: '3' };
const KEYS: Record<string, Variant> = { m: 'mix', 0: 'mix', 1: '1', 2: '2', 3: '3' };
const TICK_MS = 200;
const SKIP_S = 5;

const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

const asVariant = (value: string) => VARIANTS.find((each) => each === value);

export function BlindTestPlayer({ test }: { test: BlindTest }) {
  const player = useRef<BlindPlayer>(null);
  // The variant carries over to the next song, which the load effect applies without re-running on each switch.
  const chosen = useRef<Variant>('mix');
  const [pieceIndex, setPieceIndex] = useState(0);
  const [variant, setVariant] = useState<Variant>('mix');
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string>();
  const [verdicts, setVerdicts] = useState<Record<string, string>>({});
  const piece = test.pieces[pieceIndex];

  useEffect(() => {
    const created = new BlindPlayer();
    player.current = created;
    const timer = setInterval(() => {
      created.resync();
      setTime(created.time);
      setDuration(created.duration);
      setPlaying(created.playing);
    }, TICK_MS);
    return () => {
      clearInterval(timer);
      created.close();
    };
  }, []);

  useEffect(() => {
    const current = player.current;
    if (current === null || piece === undefined) return;
    const wasPlaying = current.playing;
    current.load(variantUrls(test, piece));
    current.select(chosen.current);
    if (wasPlaying) {
      current.play().catch((cause: unknown) => setError(String(cause)));
    }
  }, [test, piece]);

  const choose = (next: Variant) => {
    player.current?.select(next);
    chosen.current = next;
    setVariant(next);
  };

  const toggle = () => {
    const current = player.current;
    if (current === null) return;
    if (current.playing) current.pause();
    else current.play().catch((cause: unknown) => setError(String(cause)));
  };

  const seek = (seconds: number) => player.current?.seek(Math.max(0, seconds));

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLTextAreaElement) return;
      const picked = KEYS[event.key];
      if (picked !== undefined) choose(picked);
      else if (event.key === ' ') toggle();
      else if (event.key === 'ArrowLeft') seek((player.current?.time ?? 0) - SKIP_S);
      else if (event.key === 'ArrowRight') seek((player.current?.time ?? 0) + SKIP_S);
      else return;
      event.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
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
        onChange={(value) => setPieceIndex(Number(value))}
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
        data={VARIANTS.map((each) => ({ value: each, label: LABELS[each] }))}
      />
      <Group gap="sm" wrap="nowrap">
        <Button onClick={toggle} w={110}>
          {playing ? 'Пауза' : 'Играть'}
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
        <Alert color="red" title="Не играет">
          {error}
        </Alert>
      )}
      <Text size="sm" c="dimmed">
        Клавиши: M или 0 — микс, 1–3 — мастеры, пробел — пауза, ← → — на 5 секунд.
        Все четыре на громкости микса.
      </Text>
      <Textarea
        label={`Вердикт: ${piece?.title ?? ''}`}
        placeholder="2 > 1 > 3"
        value={piece === undefined ? '' : (verdicts[piece.id] ?? '')}
        onChange={(event) => setVerdict(event.currentTarget.value)}
        autosize
      />
      <Textarea label="Все вердикты — скопируй в чат" value={summary} readOnly autosize />
    </Stack>
  );
}
