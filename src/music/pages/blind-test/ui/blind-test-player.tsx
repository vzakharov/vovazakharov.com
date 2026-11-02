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
  variants,
  variantUrls,
} from '../model/blind-test';
import { verdictStore } from '../model/verdicts';

type BlindTestPlayerProps = { test: BlindTest; copy: Messages['blindTest'] };

// Letters, so a master is never read as a song's number; the files keep 1, 2…
const LETTERS = 'ABCDEFGH';
// The key each letter sits on in the Russian layout, so a switch works in either.
const RUSSIAN_KEYS = 'фисвуапр';

const label = (variant: Variant, mix: string) =>
  variant === 'mix' ? mix : (LETTERS[Number(variant) - 1] ?? variant);

const keysFor = (list: readonly Variant[]) =>
  new Map<string, Variant>(
    list.flatMap((variant): Array<[string, Variant]> => {
      if (variant === 'mix') {
        return [
          ['m', variant],
          ['ь', variant],
        ];
      }
      const index = Number(variant) - 1;
      const latin = LETTERS[index]?.toLowerCase();
      const russian = RUSSIAN_KEYS[index];
      return latin === undefined || russian === undefined
        ? []
        : [
            [latin, variant],
            [russian, variant],
          ];
    }),
  );
const TICK_MS = 200;
const COPIED_MS = 2000;
const SKIP_S = 1;

const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

export function BlindTestPlayer({ test, copy }: BlindTestPlayerProps) {
  const list = useMemo(() => variants(test), [test]);
  const keys = useMemo(() => keysFor(list), [list]);
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
      const picked = keys.get(event.key);
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
          const picked = list.find((each) => each === value);
          if (picked !== undefined) choose(picked);
        }}
        data={list.map((each) => ({
          value: each,
          label: label(each, copy.mix),
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
