'use client';

import { useLocalStorage } from '@mantine/hooks';
import { useEffect, useState, useSyncExternalStore } from 'react';

import {
  forgetModel,
  isStopped,
  loadProgress,
  modelCached,
  modelDtype,
  modelReady,
  startModel,
  stopModel,
  suggest,
  watchLoad,
} from '../../brainstorm';
import { ringOf, type RingTarget } from './ring';

const KEY = 'unsquatted.ideas';
const TIMED_KEY = 'unsquatted.ideasSeconds';

/** Where the opt-in's download stands. */
export type Loading = {
  /** The fraction downloaded while the download runs. */
  downloading: number | undefined;
  /** The last download failed. */
  failed: boolean;
};

/** What the button is doing, which its label says. */
export type Stage = Loading & {
  /** The visitor agreed, so the button brainstorms. */
  optedIn: boolean;
  /** The visitor pressed the button and the variations are on their way. */
  thinking: boolean;
};

export type Ideas = Stage & {
  /** The model can run here. */
  available: boolean;
  /** Downloads the model, opting in once it is ready, then brainstorms. */
  turnOn: () => void;
  /** Brainstorms the label shown, once opted in. */
  brainstorm: () => void;
  /** Stops the download, leaving the visitor not opted in. */
  stop: () => void;
  /** The ring round the button, while it loads or thinks. */
  ring: RingTarget | undefined;
  /** The variations of the label, once asked for. */
  names: readonly string[] | undefined;
};

/**
 * The variations of `label`, generated when the visitor presses the button
 * and never on a new label alone. A new label abandons the generation in
 * flight; answers are kept per label for the page's life. The first
 * generation is timed and the time kept, to pace the ring of every later one.
 * An opt-in whose weights the browser has since evicted is undone, so the
 * offer asks again before downloading anything. `unsquattedForget()` in the
 * console undoes the opt-in and the timing and deletes the weights, for
 * testing the offer and the download again.
 */
export function useIdeas(label: string): Ideas {
  const [agreed, setAgreed] = useLocalStorage({
    key: KEY,
    defaultValue: false,
  });
  const [timed, setTimed, forgetTimed] = useLocalStorage<number | undefined>({
    key: TIMED_KEY,
    defaultValue: undefined,
  });
  const [available, setAvailable] = useState(false);
  /** The weights were found cached, or just downloaded. */
  const [present, setPresent] = useState(false);
  const [answers, setAnswers] = useState<ReadonlyMap<string, string[]>>(
    () => new Map(),
  );
  const [failed, setFailed] = useState(false);
  /** The label the button was pressed for, until its variations are in. */
  const [asked, setAsked] = useState<string>();
  const [seenLabel, setSeenLabel] = useState(label);
  // The server render's snapshots are the same: nothing loads there.
  const progress = useSyncExternalStore(watchLoad, loadProgress, loadProgress);
  const ready = useSyncExternalStore(watchLoad, modelReady, modelReady);

  if (label !== seenLabel) {
    setSeenLabel(label);
    setAsked(undefined);
  }

  useEffect(() => {
    modelDtype().then((dtype) => {
      setAvailable(dtype !== undefined);
    }, reportError);
  }, []);

  useEffect(() => {
    if (!agreed || !available || present) return;

    modelCached().then((cached) => {
      if (cached) setPresent(true);
      else setAgreed(false);
    }, reportError);
  }, [agreed, available, present, setAgreed]);

  useEffect(() => {
    Object.defineProperty(globalThis, 'unsquattedForget', {
      configurable: true,
      value: async () => {
        setAgreed(false);
        forgetTimed();
        setPresent(false);
        setAnswers(new Map());
        await forgetModel();

        // The console prints what the call resolves to.
        return 'Forgot the opt-in and the timing, and deleted the model from this site’s storage.';
      },
    });
  }, [setAgreed, forgetTimed]);

  useEffect(() => {
    if (asked === undefined || !agreed || !present) return;

    const controller = new AbortController();
    const { signal } = controller;

    const answer = (names: string[]) => {
      setAnswers((current) => new Map(current).set(asked, names));
      setAsked(undefined);
    };

    const generate = async () => {
      // Loads the model first on a page that has not yet.
      await startModel();
      const begun = performance.now();
      const names = await suggest(asked, signal);

      setTimed((known) => known ?? (performance.now() - begun) / 1000);

      return names;
    };

    // A failed generation is reported and answers with nothing, so the ring
    // closes rather than thinking forever.
    generate().then(answer, (error: unknown) => {
      if (signal.aborted) return;
      reportError(error);
      answer([]);
    });

    return () => {
      controller.abort();
    };
  }, [asked, agreed, present, setTimed]);

  const thinking = asked !== undefined;

  return {
    available,
    optedIn: agreed,
    turnOn: () => {
      setFailed(false);
      setAsked(label);
      startModel().then(
        () => {
          setPresent(true);
          setAgreed(true);
        },
        (error: unknown) => {
          setAsked(undefined);
          if (isStopped(error)) return;
          reportError(error);
          setFailed(true);
        },
      );
    },
    brainstorm: () => {
      setAsked(label);
    },
    stop: stopModel,
    thinking,
    ring: ringOf({ loading: progress, asked: thinking, ready, timed }),
    downloading: agreed ? undefined : progress,
    failed,
    names: answers.get(label),
  };
}
