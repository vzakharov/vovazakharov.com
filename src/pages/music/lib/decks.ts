import type { Hushing } from '@/shared/typings';

/** What the player does on an element's event, handed the deck it fired on. */
export type DeckListeners = ReadonlyArray<
  readonly [keyof HTMLMediaElementEventMap, (deck: HTMLAudioElement) => void]
>;

/**
 * The player's audio: the active element plays and every control drives it,
 * while the track due next is loaded ahead, so changing to it starts a file
 * already on the device rather than a request.
 */
export type Decks = Hushing & {
  active: () => HTMLAudioElement;
  /**
   * The file the active element plays, as `load` or `cue` named it — never
   * read off the element, whose `src` may be a copy of it held in memory.
   */
  loaded: () => string | undefined;
  /** Point the active element at `src`, fetched afresh. */
  load: (src: string) => void;
  /**
   * The file due next, which loads once the active element can play through,
   * so the two never compete for the connection.
   */
  arm: (src: string | undefined) => void;
  /** Put the file due next on the active element if it is `src` and loaded, and say whether it did. */
  cue: (src: string) => boolean;
  /** Play the active element; a refusal the audio cannot get past reaches `onRefused`. */
  play: (onRefused: () => void) => void;
  setVolume: (volume: number) => void;
};

/**
 * The attribute rather than the property, which reads back resolved to an
 * absolute URL that a site-root path never equals.
 */
function loaded(deck: HTMLAudioElement): string | undefined {
  return deck.getAttribute('src') ?? undefined;
}

export function refusal(error: unknown): string | undefined {
  return error instanceof DOMException ? error.name : undefined;
}

export function dueNext(
  active: HTMLAudioElement,
  upcoming: string | undefined,
): string | undefined {
  return active.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA
    ? upcoming
    : undefined;
}

/** Wire each listener onto `deck` while `heard` says so, and hand back the unwiring. */
export function listen(
  deck: HTMLAudioElement,
  listeners: DeckListeners,
  heard: () => boolean = () => true,
): Array<() => void> {
  return listeners.map(([event, handler]) => {
    const listener = () => {
      if (heard()) handler(deck);
    };

    deck.addEventListener(event, listener);

    return () => {
      deck.removeEventListener(event, listener);
    };
  });
}

/**
 * Two audio elements taking turns, as a DJ's decks do, the standby one loading
 * the track due next. The decks are audio engines rather than page content —
 * the bar is what a reader operates — so they are constructed and never enter
 * the document. Each listener hears the active deck only: the standby one's own
 * loading, and the pause of a deck swapped out, are nothing the player did.
 */
export function createDecks(listeners: DeckListeners): Decks {
  const decks = [new Audio(), new Audio()] as const;
  let [active, standby] = decks;
  const played = new WeakSet<HTMLAudioElement>();
  let upcoming: string | undefined;

  for (const deck of decks) deck.preload = 'metadata';

  function swap() {
    [active, standby] = [standby, active];
  }

  function rearm() {
    const wanted = dueNext(active, upcoming);
    if (loaded(standby) === wanted || wanted === loaded(active)) return;

    // A file no longer due is dropped rather than left downloading.
    if (wanted === undefined) {
      standby.removeAttribute('src');
      standby.load();

      return;
    }

    standby.preload = 'auto';
    standby.src = wanted;
  }

  // The browser declining a deck the reader never started, while the other one
  // has played, moves the file onto that one rather than reaching `onRefused`.
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
  const heard = decks.flatMap((deck) =>
    listen(deck, wired, () => deck === active),
  );

  return {
    active: () => active,
    loaded: () => loaded(active),
    load: (src) => {
      active.src = src;
    },
    arm: (src) => {
      if (src === upcoming) return;

      upcoming = src;
      rearm();
    },
    cue: (src) => {
      if (loaded(standby) !== src || loaded(active) === src) return false;

      const outgoing = active;

      swap();
      outgoing.pause();
      // A deck swapped back to holds the track where it was left; a new track
      // starts from the top.
      if (active.currentTime > 0) active.currentTime = 0;

      return true;
    },
    play,
    setVolume: (volume) => {
      for (const deck of decks) deck.volume = volume;
    },
    stop: () => {
      for (const unhear of heard) unhear();
      for (const deck of decks) deck.pause();
    },
  };
}
