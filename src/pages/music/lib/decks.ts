/** What the player does on an element's event, handed the deck it fired on. */
export type DeckListeners = ReadonlyArray<
  readonly [keyof HTMLMediaElementEventMap, (deck: HTMLAudioElement) => void]
>;

/** What a `swapIn` reports back. */
type SwapDone = {
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
 * Two audio elements taking turns, as a DJ's decks do: the active one plays and
 * every control drives it, while the standby one loads the track due next, so
 * changing to it starts a buffered file rather than a request.
 */
export type Decks = {
  active: () => HTMLAudioElement;
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
  /**
   * Put `src` — the playing song in another file — on the active deck where the
   * song is: the standby deck loads it and seeks there while the active one
   * plays on, and takes over once it can play from that point. `src` already on
   * the active deck calls off a swap under way, and reports it landed.
   */
  swapIn: (src: string, done: SwapDone) => void;
  /**
   * Play the active deck. A refusal reaches `onRefused`, unless it is the
   * browser declining a deck the reader never started while the other one has
   * played: the file then moves onto that one.
   */
  play: (onRefused: () => void) => void;
  setVolume: (volume: number) => void;
  /** Silence both decks and stop hearing them. */
  stop: () => void;
};

/**
 * The attribute rather than the property, which reads back resolved to an
 * absolute URL that a site-root path never equals.
 */
function loaded(deck: HTMLAudioElement): string | undefined {
  return deck.getAttribute('src') ?? undefined;
}

function refusal(error: unknown): string | undefined {
  return error instanceof DOMException ? error.name : undefined;
}

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
  let swapping: Swap | undefined;
  let taking: TakenInPlace | undefined;

  for (const deck of decks) deck.preload = 'metadata';

  function swap() {
    [active, standby] = [standby, active];
  }

  /** A file no longer due, dropped rather than left downloading. */
  function unload(deck: HTMLAudioElement) {
    deck.removeAttribute('src');
    deck.load();
  }

  /**
   * The swap under way, dropped — and its file with it, whether loading or
   * just starting to sound — once the file it replaces left the active deck.
   */
  function underWay(): Swap | undefined {
    if (swapping !== undefined && loaded(active) !== swapping.replaces) {
      if (loaded(standby) === swapping.brings) unload(standby);
      swapping = undefined;
    }

    return swapping;
  }

  /** The file taken in place, dropped once another took its place on the active deck. */
  function takenInPlace(): TakenInPlace | undefined {
    if (taking !== undefined && loaded(active) !== taking.brings) {
      taking = undefined;
    }

    return taking;
  }

  function rearm() {
    if (underWay() !== undefined) return;

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

        swap();
        if (src !== undefined) active.src = src;
        play(onRefused);

        return;
      }

      onRefused();
    });
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
      resumeAt: active.currentTime,
      sought: false,
    };
    active.src = to;
    play(onRefused);
  }

  function landed(done: Pick<SwapDone, 'onLanded'>) {
    swapping = undefined;
    rearm();
    done.onLanded();
  }

  function land(done: Swap) {
    const outgoing = active;
    const incoming = standby;

    if (outgoing.paused) {
      swap();
      landed(done);

      return;
    }

    done.stage = 'landing';
    // The outgoing deck plays on until the incoming one sounds, so the cut
    // overlaps the two by the moment the start takes rather than leaving a gap.
    incoming.play().then(
      () => {
        if (underWay() !== done) {
          incoming.pause();

          return;
        }

        const pausedMeanwhile = outgoing.paused;

        played.add(incoming);
        swap();
        outgoing.pause();
        if (pausedMeanwhile) incoming.pause();
        landed(done);
      },
      (error: unknown) => {
        if (refusal(error) !== 'AbortError' && underWay() === done) {
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
    const under = underWay();

    if (
      under === undefined ||
      under.stage === 'landing' ||
      loaded(standby) !== under.brings ||
      standby.readyState < HTMLMediaElement.HAVE_METADATA ||
      standby.seeking
    ) {
      return;
    }

    const at = active.currentTime;

    if (under.stage === 'aligned') {
      if (Math.abs(standby.currentTime - at) > REALIGN_SECONDS) {
        under.stage = 'sought';
      } else {
        if (standby.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
          land(under);
        }

        return;
      }
    }

    const ahead = Math.min(at + AHEAD_SECONDS, standby.duration);

    if (covers(standby.buffered, at, ahead)) {
      under.stage = 'aligned';
      standby.currentTime = at;

      return;
    }

    // Loaded from where the song is rather than from the top, which would
    // fetch all of what came before; again only where a seek took it back.
    if (under.stage === 'loading' || at < standby.currentTime) {
      under.stage = 'sought';
      standby.currentTime = at;
    }
  }

  function failed() {
    const under = underWay();

    if (under !== undefined && loaded(standby) === under.brings) {
      inPlace(under.brings, under);
    }
  }

  // Ahead of the player's own, so a tuned-in radio's seek wins over the
  // resume of a file taken in place.
  const wired: DeckListeners = [
    [
      'loadedmetadata',
      (deck) => {
        const taken = takenInPlace();

        if (taken === undefined || taken.sought) return;

        taken.sought = true;
        deck.currentTime = taken.resumeAt;
      },
    ],
    [
      'canplay',
      () => {
        const taken = takenInPlace();

        if (taken?.sought !== true) return;

        taking = undefined;
        taken.onLanded();
      },
    ],
    // Any other file on the active deck ends a swap now, not at the standby
    // deck's next event, which a request still waiting on its first byte
    // does not send.
    [
      'loadstart',
      () => {
        underWay();
      },
    ],
    ...listeners,
    ['canplaythrough', rearm],
    [
      'playing',
      (deck) => {
        played.add(deck);
      },
    ],
  ];

  function onStandby(
    event: keyof HTMLMediaElementEventMap,
    handler: () => void,
  ): DeckListeners[number] {
    return [
      event,
      (deck) => {
        if (deck === standby) handler();
      },
    ];
  }

  // The active deck's events reach the player, but for the reset to 0 a file
  // taken in place reports before it is sought back, which is not where the
  // song is; the standby deck's walk a swap on.
  const routed: DeckListeners = [
    ...wired.map(([event, handler]): DeckListeners[number] => [
      event,
      (deck) => {
        if (deck !== active) return;
        if (event === 'timeupdate' && takenInPlace()?.sought === false) {
          return;
        }

        handler(deck);
      },
    ]),
    ...(['loadedmetadata', 'progress', 'canplay', 'seeked'] as const).map(
      (event) => onStandby(event, align),
    ),
    onStandby('error', failed),
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
        underWay() !== undefined ||
        loaded(standby) !== src ||
        loaded(active) === src
      ) {
        return false;
      }

      const outgoing = active;

      swap();
      outgoing.pause();
      // A deck swapped back to holds the track where it was left; a new track
      // starts from the top.
      if (active.currentTime > 0) active.currentTime = 0;

      return true;
    },
    swapIn: (src, done) => {
      const from = loaded(active);
      const under = underWay();

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
      standby.preload = 'auto';
      if (loaded(standby) === src) {
        align();
      } else {
        standby.src = src;
      }
    },
    play,
    setVolume: (volume) => {
      for (const deck of decks) deck.volume = volume;
    },
    stop: () => {
      for (const unhear of heard) unhear();
      for (const deck of decks) deck.pause();
      swapping = undefined;
      taking = undefined;
    },
  };
}
