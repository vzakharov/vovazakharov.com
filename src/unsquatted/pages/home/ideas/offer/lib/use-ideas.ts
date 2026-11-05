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
import { unlocks } from './unlock';

const KEY = 'unsquatted.ideas';
const TIMED_KEY = 'unsquatted.ideasSeconds';
const UNLOCKED_KEY = 'unsquatted.ideasUnlocked';

/** Where the opt-in and its download stand. */
export type Loading = {
  /** The visitor agreed, so the button brainstorms. */
  optedIn: boolean;
  /** The fraction downloaded while the download runs. */
  downloading: number | undefined;
  /** The last download failed. */
  failed: boolean;
  /**
   * Opted in, but the browser has since deleted the weights, which the next
   * press downloads again.
   */
  evicted: boolean;
};

/** What the button is doing, which its label says. */
export type Stage = Loading & {
  /** The visitor pressed the button and the variations are on their way. */
  thinking: boolean;
};

export type Ideas = Stage & {
  /** The model can run here. */
  available: boolean;
  /** The visitor once typed "give me ai" or has opted in, so the bulb shows. */
  unlocked: boolean;
  /**
   * Unlocked just now: the bulb pops in with a note pointing at it, which
   * stays until the bulb is pressed.
   */
  pointing: boolean;
  /** Unlocks the bulb when `typed`, the field's text, is the phrase. */
  listen: (typed: string) => void;
  /** The bulb was pressed, so the note goes. */
  noticed: () => void;
  /** Downloads the model, opting in once it is ready, then brainstorms. */
  turnOn: () => void;
  /**
   * Brainstorms the label shown, once opted in, downloading the weights again
   * first where the browser deleted them.
   */
  brainstorm: () => void;
  /** Stops the download, leaving the visitor not opted in. */
  stop: () => void;
  /** The ring round the button, while it loads or thinks. */
  ring: RingTarget | undefined;
  /** The label the variations on their way are for, which restarts the ring. */
  asked: string | undefined;
  /** The last press's variations, whatever the label is now. */
  names: readonly string[] | undefined;
};

/**
 * The variations of `label`, generated when the visitor presses the button
 * and never on a new label alone. A generation in flight runs on through a
 * new label and answers for the one it was asked for; a press for another
 * label replaces it, and one for the same label leaves it running. The last
 * variations stay until the next press brings new ones, so the visitor can
 * try them one after another. The first generation is timed and the time
 * kept, to pace the ring of every later one. `unsquattedForget()` in the
 * console undoes the unlock, the opt-in and the timing and deletes the
 * weights, for testing the phrase, the offer and the download again.
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
  const [unlocked, setUnlocked, forgetUnlocked] = useLocalStorage({
    key: UNLOCKED_KEY,
    defaultValue: false,
  });
  const [pointing, setPointing] = useState(false);
  const [available, setAvailable] = useState(false);
  /**
   * The weights were found cached or just downloaded (`true`), or found
   * missing (`false`); `undefined` until the cache is looked at.
   */
  const [present, setPresent] = useState<boolean>();
  /** The last press's variations, kept through every pick among them. */
  const [names, setNames] = useState<readonly string[]>();
  const [failed, setFailed] = useState(false);
  /** The label the button was pressed for, until its variations are in. */
  const [asked, setAsked] = useState<string>();
  // The server render's snapshots are the same: nothing loads there.
  const progress = useSyncExternalStore(watchLoad, loadProgress, loadProgress);
  const ready = useSyncExternalStore(watchLoad, modelReady, modelReady);

  useEffect(() => {
    modelDtype().then((dtype) => {
      setAvailable(dtype !== undefined);
    }, reportError);
  }, []);

  useEffect(() => {
    if (!agreed || !available || present !== undefined) return;

    modelCached().then(setPresent, reportError);
  }, [agreed, available, present]);

  useEffect(() => {
    Object.defineProperty(globalThis, 'unsquattedForget', {
      configurable: true,
      value: async () => {
        forgetUnlocked();
        setPointing(false);
        setAgreed(false);
        forgetTimed();
        setPresent(undefined);
        setNames(undefined);
        await forgetModel();

        // The console prints what the call resolves to.
        return 'Forgot the unlock, the opt-in and the timing, and deleted the model from this site’s storage.';
      },
    });
  }, [forgetUnlocked, setAgreed, forgetTimed]);

  useEffect(() => {
    if (asked === undefined || !agreed || present !== true) return;

    const controller = new AbortController();
    const { signal } = controller;

    const answer = (found: string[]) => {
      setNames(found);
      setAsked(undefined);
    };

    const generate = async () => {
      // Loaded before the clock starts, so the time is the generation's alone.
      await startModel();
      const begun = performance.now();
      const found = await suggest(asked, signal);

      setTimed((known) => known ?? (performance.now() - begun) / 1000);

      return found;
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
  const evicted = agreed && present === false;
  // Loading weights already cached is no download.
  const downloading = agreed && !evicted ? undefined : progress;
  const fetching = downloading !== undefined;

  // Closing the tab mid-download asks first: the browser keeps only the files
  // downloaded whole, and the bulk of the weights is one file.
  useEffect(() => {
    if (!fetching) return;
    globalThis.addEventListener('beforeunload', holdPage);

    return () => {
      globalThis.removeEventListener('beforeunload', holdPage);
    };
  }, [fetching]);

  const turnOn = () => {
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
  };

  const open = unlocked || agreed;

  return {
    available,
    unlocked: open,
    pointing,
    listen: (typed) => {
      if (open || !unlocks(typed)) return;
      setUnlocked(true);
      setPointing(true);
    },
    noticed: () => {
      setPointing(false);
    },
    optedIn: agreed,
    evicted,
    turnOn,
    brainstorm: () => {
      if (evicted) turnOn();
      else setAsked(label);
    },
    stop: stopModel,
    thinking,
    ring: ringOf({ loading: progress, asked: thinking, ready, timed }),
    asked,
    downloading,
    failed,
    names,
  };
}

/** Has the browser ask before the page goes, in words of its own. */
function holdPage(event: BeforeUnloadEvent) {
  event.preventDefault();
}
