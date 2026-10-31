import { pick } from '@/kernel/shared/lib/collections';
import { errorClass } from '@/kernel/shared/lib/error-class';
import { fetchOk } from '@/kernel/shared/lib/fetch-ok';
import type { Sourced, WithUrl } from '@/kernel/shared/typings';

import {
  type DeckListeners,
  type Decks,
  dueNext,
  listen,
  refusal,
} from './decks';

/** A file the deck holds or fetches, and the in-memory copy it plays once there is one. */
type Copied = Sourced & Partial<WithUrl>;

type Fetching = Copied & { controller: AbortController };

const TrackCopyError = errorClass('TrackCopyError');

function release(url: string | undefined) {
  if (url !== undefined) URL.revokeObjectURL(url);
}

/**
 * Every iOS browser, Safari's engine under each — an iPad asking for the
 * desktop site included, which names itself a Mac with a touchscreen.
 */
export function isIOS(): boolean {
  const agent = navigator.userAgent;

  return (
    /iPhone|iPad|iPod/.test(agent) ||
    (agent.includes('Macintosh') && navigator.maxTouchPoints > 1)
  );
}

/**
 * One audio element, for iOS: a second one loading beside the playing deck has
 * been heard playing over it. The track due next is fetched whole into memory
 * instead, so changing to it hands the element a file already on the device.
 */
export function createFetchingDeck(listeners: DeckListeners): Decks {
  const deck = new Audio();
  let held: Copied | undefined;
  let fetching: Fetching | undefined;
  let upcoming: string | undefined;

  deck.preload = 'metadata';

  // The copy playing until now is let go only once the element has moved off it.
  function hold(next: Copied) {
    const outgoing = held?.url;

    held = next;
    deck.src = next.url ?? next.src;
    release(outgoing);
  }

  function drop() {
    if (fetching === undefined) return;

    fetching.controller.abort();
    release(fetching.url);
    fetching = undefined;
  }

  function prefetch() {
    const wanted = dueNext(deck, upcoming);
    if (fetching?.src === wanted || wanted === held?.src) return;

    drop();
    if (wanted === undefined) return;

    const entry: Fetching = { src: wanted, controller: new AbortController() };

    fetching = entry;
    copy(entry).catch((error: unknown) => {
      // A file no longer due is dropped on purpose; any other failure
      // surfaces, and the track loads from the network when it comes up.
      if (entry.controller.signal.aborted) return;
      throw error;
    });
  }

  async function copy(entry: Fetching) {
    const response = await fetchOk(
      entry.src,
      TrackCopyError,
      pick(entry.controller, 'signal'),
    );
    const blob = await response.blob();

    if (fetching === entry) entry.url = URL.createObjectURL(blob);
  }

  const heard = listen(deck, [...listeners, ['canplaythrough', prefetch]]);

  return {
    active: () => deck,
    loaded: () => held?.src,
    load: (src) => {
      if (fetching?.src === src) drop();
      hold({ src });
    },
    arm: (src) => {
      if (src === upcoming) return;

      upcoming = src;
      prefetch();
    },
    cue: (src) => {
      if (fetching?.src !== src || fetching.url === undefined) return false;

      const { url } = fetching;

      fetching = undefined;
      hold({ src, url });

      return true;
    },
    play: (onRefused) => {
      deck.play().catch((error: unknown) => {
        // An abort is a source change cutting the play short.
        if (refusal(error) !== 'AbortError') onRefused();
      });
    },
    setVolume: (volume) => {
      deck.volume = volume;
    },
    stop: () => {
      for (const unhear of heard) unhear();
      deck.pause();
      drop();
      release(held?.url);
    },
  };
}
