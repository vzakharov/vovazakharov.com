import { parsed, serialized, type Wallet } from './wallet';

const PHRASE_KEY = 'cube.phrase';
const walletKey = (id: string): string => `cube.wallet.${id}`;

/**
 * This browser's storage, or null where it refuses it (a private window,
 * blocked site data) — which the account dialog tells the player, since
 * nothing then outlives the page.
 */
export function storage(): Storage | null {
  try {
    const probe = 'cube.probe';
    localStorage.setItem(probe, probe);
    localStorage.removeItem(probe);
    return localStorage;
  } catch {
    // Refused: the caller says so to the player rather than pretending.
    return null;
  }
}

/** The phrase this browser was asked to remember, if any. */
export const rememberedPhrase = (store: Storage): string | null =>
  store.getItem(PHRASE_KEY);

/** Remembers `phrase` on this browser, or forgets it given null. */
export function remember(store: Storage, phrase: string | null): void {
  if (phrase === null) store.removeItem(PHRASE_KEY);
  else store.setItem(PHRASE_KEY, phrase);
}

/** `id`'s wallet as this browser keeps it, or null where it keeps none. */
export function storedWallet(store: Storage, id: string): Wallet | null {
  const text = store.getItem(walletKey(id));
  return text === null ? null : parsed(text);
}

/** Keeps `wallet` as `id`'s on this browser. */
export function storeWallet(store: Storage, id: string, wallet: Wallet): void {
  store.setItem(walletKey(id), serialized(wallet));
}
