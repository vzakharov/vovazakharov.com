import { pick } from '@/kernel/shared/lib/collections';

import type { SignMount } from '@/cube/entities/world';

import { type Identity, identityOf, newIdentity } from './identity';
import { phraseIn } from './login-link';
import {
  remember,
  rememberedPhrase,
  storage,
  storedWallet,
  storeWallet,
} from './stored';
import {
  credited,
  EMPTY_WALLET,
  giftOf,
  type Wallet,
  withRoom,
} from './wallet';

/** Who is playing on this page, what they hold, and what this browser keeps. */
export type Held = {
  identity: Identity | null;
  wallet: Wallet;
  /** Whether this browser remembers the phrase between visits. */
  remembered: boolean;
  /** Whether this browser keeps anything; false, nothing outlives the page. */
  storable: boolean;
  /** Кубики given before anyone logged in, credited on login. */
  pending: number;
};

/** Nobody, as the static HTML renders the page and hydration starts it. */
export const NOBODY: Held = {
  identity: null,
  wallet: EMPTY_WALLET,
  remembered: false,
  storable: false,
  pending: 0,
};

/**
 * The page's one account. Memory is its truth and storage only its copy, so
 * a browser refusing storage still plays, its account lasting the visit.
 */
let held = NOBODY;
let store: Storage | null = null;
const listeners = new Set<() => void>();

export const heldNow = (): Held => held;

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Makes `next` what is held, keeps it where this browser keeps anything. */
function hold(next: Held): void {
  held = next;
  if (store !== null && next.identity !== null) {
    storeWallet(store, next.identity.id, next.wallet);
    remember(store, next.remembered ? next.identity.phrase : null);
  }
  for (const listener of listeners) listener();
}

/** `identity` held with the wallet this browser keeps for it, and `pending` credited. */
function enter(identity: Identity, remembered: boolean): void {
  const kept = (store && storedWallet(store, identity.id)) ?? EMPTY_WALLET;
  hold({
    ...held,
    identity,
    wallet: held.pending > 0 ? credited(kept, held.pending) : kept,
    remembered,
    pending: 0,
  });
}

/**
 * Starts the account, once the page runs: logs in from a login link's
 * fragment, stripping it from the address before anything reads the fragment
 * as a walk's, or else from the phrase this browser remembers.
 */
export function boot(): void {
  store = storage();
  held = { ...held, storable: store !== null };
  const linked = phraseIn(globalThis.location.hash.slice(1));
  if (linked !== null) {
    const { pathname, search } = globalThis.location;
    globalThis.history.replaceState(null, '', `${pathname}${search}`);
    enter(identityOf(linked), false);
    return;
  }
  const kept = store === null ? null : rememberedPhrase(store);
  if (kept === null) hold(held);
  else enter(identityOf(kept), true);
}

/** A new account, from the browser's cryptographic randomness. */
export const create = (): void => {
  enter(newIdentity(), false);
};

/** Logs in as `phrase`'s owner; throws on a phrase that is none. */
export const logIn = (phrase: string): void => {
  enter(identityOf(phrase), false);
};

export function logOut(): void {
  if (store !== null) remember(store, null);
  hold({ ...NOBODY, ...pick(held, 'storable') });
}

export const setRemembered = (remembered: boolean): void => {
  hold({ ...held, remembered });
};

/**
 * Gives `value` кубики, whole and above zero: to the account logged in, or,
 * with nobody logged in, to whoever logs in next. Returns the balance, or
 * null while they wait.
 */
export function give(value: unknown): number | null {
  const gift = giftOf(value);
  if (held.identity === null) {
    hold({ ...held, pending: held.pending + gift });
    return null;
  }
  hold({ ...held, wallet: credited(held.wallet, gift) });
  return held.wallet.balance;
}

/** Buys the room `key`, its sign at `mount`, for `price`; throws if short. */
export const buy = (key: string, mount: SignMount, price: number): void => {
  hold({ ...held, wallet: withRoom(held.wallet, key, mount, price) });
};
