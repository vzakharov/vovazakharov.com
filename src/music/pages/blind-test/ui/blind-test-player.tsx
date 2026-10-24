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
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import type { Messages } from '@/music/shared/i18n';

import { BlindPlayer } from '../model/blind-player';
import {
  type BlindTest,
  type Variant,
  VARIANTS,
  variantUrls,
} from '../model/blind-test';
import { verdictStore } from '../model/verdicts';

type BlindTestPlayerProps = { test: BlindTest; copy: Messages['blindTest'] };

// Letters, so a master is never read as a song's number; the files keep 1–3.
const MASTER_LABELS = { 1: 'A', 2: 'B', 3: 'C' } as const;

// Each letter also on the Russian layout's key in its place.
const KEYS: Record<string, Variant> = {
  m: 'mix',
  ь: 'mix',
  a: '1',
  ф: '1',
  b: '2',
  и: '2',
  c: '3',
  с: '3',
};
const TICK_MS = 200;
const COPIED_MS = 2000;
const SKIP_S = 1;

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
  const store = useMemo(() => verdictStore(test), [test]);
  const verdicts = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  const [copied, setCopied] = useState(false);
  const piece = test.pieces[pieceIndex];

  const report = (error_: unknown) => {
    setError(String(error_));
  };

  useEffect(() => {
    const created = new BlindPlayer();
    playerRef.current = created;
    const timer = setInterval(() => {
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
      event.stopPropagation();
    };
    // Captured and stopped: the music section's own player listens for the same
    // keys on bubble, and would start the radio under the test.
    globalThis.addEventListener('keydown', onKey, { capture: true });
    return () => {
      globalThis.removeEventListener('keydown', onKey, { capture: true });
    };
  });

  const setVerdict = (text: string) => {
    if (piece === undefined) return;
    try {
      store.save({ ...verdicts, [piece.id]: text });
    } catch (error_) {
      report(error_);
    }
  };

  const summary = test.pieces
    .map(({ id }) => `${id}: ${verdicts[id] ?? '—'}`)
    .join('\n');

  const copySummary = () => {
    navigator.clipboard
      .writeText(summary)
      .then(() => {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, COPIED_MS);
      })
      .catch(report);
  };

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
          label: each === 'mix' ? copy.mix : MASTER_LABELS[each],
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
      <Button variant="default" onClick={copySummary} w={160}>
        {copied ? copy.copied : copy.copy}
      </Button>
    </Stack>
  );
}
