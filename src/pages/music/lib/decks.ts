import { pick } from '@/shared/lib/collections';

import {
  type DeckListener,
  type DeckListeners,
  type DeckPlayback,
  loaded,
  refusal,
  unload,
} from './deck-element';
import { createSwapper, type Swapping } from './deck-swap';

/**
 * Two audio elements taking turns, as a DJ's decks do: the active one plays and
 * every control drives it, while the standby one loads the track due next, so
 * changing to it starts a buffered file rather than a request.
 */
export type Decks = DeckPlayback &
  Swapping & {
    /**
     * The file due next, which the standby deck loads once the active one can
     * play through, so the two never compete for the connection.
     */
    arm: (src: string | undefined) => void;
    /**
     * Make the standby deck the active one if it holds `src`, and say whether it
     * did — never while it loads a `swapIn`, which is no track of the queue's.
     */
    cue: (src: string) => boolean;
    setVolume: (volume: number) => void;
    /** Silence both decks and stop hearing them. */
    stop: () => void;
  };

/**
 * The decks are audio engines rather than page content — the bar is what a
 * reader operates — so they are constructed and never enter the document. Each
 * listener hears the active deck only: the standby one's own loading, and the
 * pause of a deck swapped out, are nothing the player did.
 */
export function createDecks(listeners: DeckListeners): Decks {
  const decks = [new Audio(), new Audio()] as const;
  let [active, standby] = decks;
  const played = new WeakSet<HTMLAudioElement>();
  let upcoming: string | undefined;

  for (const deck of decks) deck.preload = 'metadata';

  const swapper = createSwapper({
    active: () => active,
    standby: () => standby,
    exchange,
    rearm,
    play,
    markPlayed: (deck) => {
      played.add(deck);
    },
  });

  function exchange() {
    [active, standby] = [standby, active];
  }

  function rearm() {
    if (swapper.underWay()) return;

    const wanted =
      active.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA
        ? upcoming
        : undefined;
    if (loaded(standby) === wanted || wanted === loaded(active)) return;

    if (wanted === undefined) {
      unload(standby);

      return;
    }

    standby.preload = 'auto';
    standby.src = wanted;
  }

  function play(onRefused: () => void) {
    const deck = active;

    deck.play().catch((error: unknown) => {
      // An abort is a source change cutting the play short, and a deck swapped
      // out since is no longer the player's.
      if (refusal(error) === 'AbortError' || deck !== active) return;

      if (
        refusal(error) === 'NotAllowedError' &&
        played.has(standby) &&
        !played.has(deck)
      ) {
        const src = loaded(deck);

        exchange();
        if (src !== undefined) active.src = src;
        play(onRefused);

        return;
      }

      onRefused();
    });
  }

  const wired: DeckListeners = [
    ...listeners,
    ['canplaythrough', rearm],
    [
      'playing',
      (deck) => {
        played.add(deck);
      },
    ],
  ];
  const routed: DeckListeners = [
    ...swapper.listeners,
    ...wired.map(
      ([event, handler]): DeckListener => [
        event,
        (deck) => {
          if (deck !== active) return;
          if (event === 'timeupdate' && swapper.resetting()) return;

          handler(deck);
        },
      ],
    ),
  ];
  const heard = decks.flatMap((deck) =>
    routed.map(([event, handler]) => {
      const listener = () => {
        handler(deck);
      };

      deck.addEventListener(event, listener);

      return () => {
        deck.removeEventListener(event, listener);
      };
    }),
  );

  return {
    active: () => active,
    arm: (src) => {
      if (src === upcoming) return;

      upcoming = src;
      rearm();
    },
    cue: (src) => {
      if (
        swapper.underWay() ||
        loaded(standby) !== src ||
        loaded(active) === src
      ) {
        return false;
      }

      const outgoing = active;

      exchange();
      outgoing.pause();
      // A deck swapped back to holds the track where it was left; a new track
      // starts from the top.
      if (active.currentTime > 0) active.currentTime = 0;

      return true;
    },
    ...pick(swapper, 'swapIn'),
    play,
    setVolume: (volume) => {
      for (const deck of decks) deck.volume = volume;
    },
    stop: () => {
      for (const unhear of heard) unhear();
      for (const deck of decks) deck.pause();
      swapper.reset();
    },
  };
}
