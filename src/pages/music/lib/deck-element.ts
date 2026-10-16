/** What the player does on an element's event, handed the deck it fired on. */
export type DeckListeners = readonly DeckListener[];

export type DeckListener = readonly [
  keyof HTMLMediaElementEventMap,
  (deck: HTMLAudioElement) => void,
];

export type DeckPlayback = {
  active: () => HTMLAudioElement;
  /**
   * Play the active deck. A refusal reaches `onRefused`, unless it is the
   * browser declining a deck the reader never started while the other one has
   * played: the file then moves onto that one.
   */
  play: (onRefused: () => void) => void;
};

/**
 * The attribute rather than the property, which reads back resolved to an
 * absolute URL that a site-root path never equals.
 */
export function loaded(deck: HTMLAudioElement): string | undefined {
  return deck.getAttribute('src') ?? undefined;
}

export function refusal(error: unknown): string | undefined {
  return error instanceof DOMException ? error.name : undefined;
}

/** A file no longer due, dropped rather than left downloading. */
export function unload(deck: HTMLAudioElement) {
  deck.removeAttribute('src');
  deck.load();
}
