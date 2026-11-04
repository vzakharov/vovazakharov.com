'use client';

import { useLocalStorage } from '@mantine/hooks';
import { useEffect, useState } from 'react';

import { endModel, modelAvailability, suggest } from '../../brainstorm';

const KEY = 'unsquatted.ideas';

/** Where a visitor removes Chrome's model, which the page itself cannot. */
const REMOVAL = `Forgot the opt-in. Chrome's model itself stays, since no page can delete it. To remove it:
- chrome://settings/system → turn off On-device AI, or
- chrome://flags/#optimization-guide-on-device-model → Disabled, relaunch.
chrome://components shows "Optimization Guide On Device Model" at 0.0.0.0 once it is gone; enabling it again downloads it anew.`;

type Ideas = {
  /** Chrome's model can run here: the offer may show. */
  available: boolean;
  /** The visitor agreed, so every search gets variations. */
  optedIn: boolean;
  optIn: () => void;
  /** The variations of the label, `undefined` while the model thinks. */
  names: readonly string[] | undefined;
};

/**
 * The variations of `label`, once the visitor has opted in. A new label
 * aborts the prompt in flight; answers are kept per label for the page's
 * life. `unsquattedForget()` in the console undoes the opt-in, for testing
 * the offer and the download again.
 */
export function useIdeas(label: string): Ideas {
  const [optedIn, setOptedIn] = useLocalStorage({
    key: KEY,
    defaultValue: false,
  });
  const [available, setAvailable] = useState(false);
  const [answers, setAnswers] = useState<ReadonlyMap<string, string[]>>(
    () => new Map(),
  );

  useEffect(() => {
    modelAvailability().then((availability) => {
      setAvailable(availability !== 'unavailable');
    }, reportError);
  }, []);

  useEffect(() => {
    Object.defineProperty(globalThis, 'unsquattedForget', {
      configurable: true,
      value: () => {
        setOptedIn(false);
        setAnswers(new Map());
        endModel().catch(reportError);

        // The console prints what a call returns.
        return REMOVAL;
      },
    });
  }, [setOptedIn]);

  const wanted = optedIn && available && label !== '' && !answers.has(label);

  useEffect(() => {
    if (!wanted) return;

    const controller = new AbortController();

    const answer = (names: string[]) => {
      setAnswers((current) => new Map(current).set(label, names));
    };

    // A failed prompt is reported and answers with nothing, so the line
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
    optedIn,
    optIn: () => {
      setOptedIn(true);
    },
    names: answers.get(label),
  };
}
