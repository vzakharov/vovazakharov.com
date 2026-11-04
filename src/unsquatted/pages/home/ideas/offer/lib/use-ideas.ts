'use client';

import { useLocalStorage } from '@mantine/hooks';
import { useEffect, useState, useSyncExternalStore } from 'react';

import {
  forgetModel,
  loadProgress,
  modelCached,
  modelDtype,
  startModel,
  suggest,
  watchLoad,
} from '../../brainstorm';

const KEY = 'unsquatted.ideas';

/** Where the opt-in's download stands. */
export type Loading = {
  /** The fraction downloaded while the download runs. */
  downloading: number | undefined;
  /** The last download failed. */
  failed: boolean;
};

type Ideas = Loading & {
  /** The model can run here: the offer may show. */
  available: boolean;
  /** The visitor agreed, so every search gets variations. */
  optedIn: boolean;
  /** Downloads the model, opting in once it is ready. */
  turnOn: () => void;
  /** The variations of the label, `undefined` while the model thinks. */
  names: readonly string[] | undefined;
};

/**
 * The variations of `label`, once the visitor has opted in. An opt-in whose
 * weights the browser has since evicted is undone, so the offer asks again
 * before downloading anything. A new label aborts the generation in flight;
 * answers are kept per label for the page's life. `unsquattedForget()` in the
 * console undoes the opt-in and deletes the weights, for testing the offer
 * and the download again.
 */
export function useIdeas(label: string): Ideas {
  const [agreed, setAgreed] = useLocalStorage({
    key: KEY,
    defaultValue: false,
  });
  const [available, setAvailable] = useState(false);
  /** The weights were found cached, or just downloaded. */
  const [present, setPresent] = useState(false);
  const [answers, setAnswers] = useState<ReadonlyMap<string, string[]>>(
    () => new Map(),
  );
  const [failed, setFailed] = useState(false);
  // The server render's snapshot is the same: nothing loads there.
  const progress = useSyncExternalStore(watchLoad, loadProgress, loadProgress);

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
        setPresent(false);
        setAnswers(new Map());
        await forgetModel();

        // The console prints what the call resolves to.
        return 'Forgot the opt-in and deleted the model from this site’s storage.';
      },
    });
  }, [setAgreed]);

  const wanted = agreed && present && label !== '' && !answers.has(label);

  useEffect(() => {
    if (!wanted) return;

    const controller = new AbortController();

    const answer = (names: string[]) => {
      setAnswers((current) => new Map(current).set(label, names));
    };

    // A failed generation is reported and answers with nothing, so the line
    // empties rather than thinking forever.
    suggest(label, controller.signal).then(answer, (error: unknown) => {
      if (controller.signal.aborted) return;
      reportError(error);
      answer([]);
    });

    return () => {
      controller.abort();
    };
  }, [wanted, label]);

  return {
    available,
    optedIn: agreed,
    turnOn: () => {
      setFailed(false);
      startModel().then(
        () => {
          setPresent(true);
          setAgreed(true);
        },
        (error: unknown) => {
          reportError(error);
          setFailed(true);
        },
      );
    },
    downloading: agreed ? undefined : progress,
    failed,
    names: answers.get(label),
  };
}
