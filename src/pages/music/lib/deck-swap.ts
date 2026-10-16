import {
  type DeckListener,
  type DeckListeners,
  type DeckPlayback,
  loaded,
  refusal,
  unload,
} from './deck-element';

/** What a `swapIn` reports back. */
export type SwapDone = {
  /** The new file plays — or would, were playback on — from where the old one was. */
  onLanded: () => void;
  /** The browser withheld playback, as `play`'s own refusal. */
  onRefused: () => void;
};

/**
 * How far a swap got: the standby deck loading the file, sent to where the song
 * is to load from there, holding that moment and seeking to it inside what it
 * loaded, and starting to play over the active deck.
 */
type SwapStage = 'loading' | 'sought' | 'aligned' | 'landing';

type Bringing = { brings: string };

type Swap = SwapDone & Bringing & { replaces: string; stage: SwapStage };

/**
 * A file the active deck loads itself in place of a swap, and the moment it
 * resumes at once its length is known.
 */
type TakenInPlace = Bringing &
  Pick<SwapDone, 'onLanded'> & { resumeAt: number; sought: boolean };

/** What a swap drives of the decks it runs between. */
export type SwapHost = DeckPlayback & {
  standby: () => HTMLAudioElement;
  /** Make the standby deck the active one. */
  exchange: () => void;
  /** Load the file due next onto the standby deck, as the decks' own `arm` does. */
  rearm: () => void;
  /** A deck the reader's browser has let play, which may play again unasked. */
  markPlayed: (deck: HTMLAudioElement) => void;
};

export type Swapper = {
  /**
   * Put `src` — the playing song in another file — on the active deck where the
   * song is: the standby deck loads it and seeks there while the active one
   * plays on, and takes over once it can play from that point. `src` already on
   * the active deck calls off a swap under way, and reports it landed.
   */
  swapIn: (src: string, done: SwapDone) => void;
  /** Whether a swap holds the standby deck, which then loads nothing else. */
  underWay: () => boolean;
  /**
   * Whether the active deck's `timeupdate` is the reset to 0 a file taken in
   * place reports before it is sought back, which is not where the song is.
   */
  resetting: () => boolean;
  /**
   * The swap's own listeners, each hearing only the deck it is about. They go
   * ahead of the player's, so a tuned-in radio's seek wins over the resume of a
   * file taken in place.
   */
  listeners: DeckListeners;
  reset: () => void;
};

/** How much the standby deck must hold past the song's moment before it aligns there. */
const AHEAD_SECONDS = 1;

/** How far the decks may part before an aligned swap aligns again — a seek meanwhile. */
const REALIGN_SECONDS = 0.5;

function covers(ranges: TimeRanges, from: number, to: number): boolean {
  for (let at = 0; at < ranges.length; at++) {
    if (ranges.start(at) <= from && ranges.end(at) >= to) return true;
  }

  return false;
}

/**
 * The standby deck bringing the playing song in another file under the active
 * one, and taking over at the moment the song has reached.
 */
export function createSwapper(host: SwapHost): Swapper {
  const { active, standby } = host;
  let swapping: Swap | undefined;
  let taking: TakenInPlace | undefined;

  /**
   * The swap under way, dropped — and its file with it, whether loading or
   * just starting to sound — once the file it replaces left the active deck.
   */
  function current(): Swap | undefined {
    if (swapping !== undefined && loaded(active()) !== swapping.replaces) {
      if (loaded(standby()) === swapping.brings) unload(standby());
      swapping = undefined;
    }

    return swapping;
  }

  /** The file taken in place, dropped once another took its place on the active deck. */
  function takenInPlace(): TakenInPlace | undefined {
    if (taking !== undefined && loaded(active()) !== taking.brings) {
      taking = undefined;
    }

    return taking;
  }

  /**
   * What a swap falls back on where the standby deck cannot take over — the
   * browser refusing a deck the reader never started, or the file failing to
   * load there: the active deck loads the file itself, and the song goes quiet
   * while it does, any failure of its own reaching `play`'s refusal.
   */
  function inPlace(to: string, { onLanded, onRefused }: SwapDone) {
    swapping = undefined;
    taking = {
      brings: to,
      onLanded,
      resumeAt: active().currentTime,
      sought: false,
    };
    active().src = to;
    host.play(onRefused);
  }

  function landed(done: Pick<SwapDone, 'onLanded'>) {
    swapping = undefined;
    host.rearm();
    done.onLanded();
  }

  function land(done: Swap) {
    const outgoing = active();
    const incoming = standby();

    if (outgoing.paused) {
      host.exchange();
      landed(done);

      return;
    }

    done.stage = 'landing';
    // The outgoing deck plays on until the incoming one sounds, so the cut
    // overlaps the two by the moment the start takes rather than leaving a gap.
    incoming.play().then(
      () => {
        if (current() !== done) {
          incoming.pause();

          return;
        }

        const pausedMeanwhile = outgoing.paused;

        host.markPlayed(incoming);
        host.exchange();
        outgoing.pause();
        if (pausedMeanwhile) incoming.pause();
        landed(done);
      },
      (error: unknown) => {
        if (refusal(error) !== 'AbortError' && current() === done) {
          inPlace(done.brings, done);
        }
      },
    );
  }

  /**
   * Walks a swap on from what the standby deck has loaded: to where the song is
   * once it knows the file's length, then — once it holds a moment past where
   * the song has got to by then — to that point inside it, and in.
   */
  function align() {
    const under = current();
    const deck = standby();

    if (
      under === undefined ||
      under.stage === 'landing' ||
      loaded(deck) !== under.brings ||
      deck.readyState < HTMLMediaElement.HAVE_METADATA ||
      deck.seeking
    ) {
      return;
    }

    const at = active().currentTime;

    if (under.stage === 'aligned') {
      if (Math.abs(deck.currentTime - at) > REALIGN_SECONDS) {
        under.stage = 'sought';
      } else {
        if (deck.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) land(under);

        return;
      }
    }

    const ahead = Math.min(at + AHEAD_SECONDS, deck.duration);

    if (covers(deck.buffered, at, ahead)) {
      under.stage = 'aligned';
      deck.currentTime = at;

      return;
    }

    // Loaded from where the song is rather than from the top, which would
    // fetch all of what came before; again only where a seek took it back.
    if (under.stage === 'loading' || at < deck.currentTime) {
      under.stage = 'sought';
      deck.currentTime = at;
    }
  }

  function failed() {
    const under = current();

    if (under !== undefined && loaded(standby()) === under.brings) {
      inPlace(under.brings, under);
    }
  }

  function onActive(
    event: DeckListener[0],
    handler: (deck: HTMLAudioElement) => void,
  ): DeckListener {
    return [
      event,
      (deck) => {
        if (deck === active()) handler(deck);
      },
    ];
  }

  function onStandby(
    event: DeckListener[0],
    handler: () => void,
  ): DeckListener {
    return [
      event,
      (deck) => {
        if (deck === standby()) handler();
      },
    ];
  }

  const listeners: DeckListeners = [
    onActive('loadedmetadata', (deck) => {
      const taken = takenInPlace();

      if (taken === undefined || taken.sought) return;

      taken.sought = true;
      deck.currentTime = taken.resumeAt;
    }),
    onActive('canplay', () => {
      const taken = takenInPlace();

      if (taken?.sought !== true) return;

      taking = undefined;
      taken.onLanded();
    }),
    // Any other file on the active deck ends a swap now, not at the standby
    // deck's next event, which a request still waiting on its first byte
    // does not send.
    onActive('loadstart', () => {
      current();
    }),
    ...(['loadedmetadata', 'progress', 'canplay', 'seeked'] as const).map(
      (event) => onStandby(event, align),
    ),
    onStandby('error', failed),
  ];

  return {
    swapIn: (src, done) => {
      const from = loaded(active());
      const under = current();

      if (from === src) {
        const taken = takenInPlace();

        // A file taken in place lands once it can play, not now.
        if (taken !== undefined) {
          taken.onLanded = done.onLanded;

          return;
        }
        landed(done);

        return;
      }
      if (under?.brings === src) {
        Object.assign(under, done);

        return;
      }
      if (from === undefined) {
        inPlace(src, done);

        return;
      }

      swapping = { replaces: from, brings: src, stage: 'loading', ...done };
      standby().preload = 'auto';
      if (loaded(standby()) === src) {
        align();
      } else {
        standby().src = src;
      }
    },
    underWay: () => current() !== undefined,
    resetting: () => takenInPlace()?.sought === false,
    listeners,
    reset: () => {
      swapping = undefined;
      taking = undefined;
    },
  };
}
