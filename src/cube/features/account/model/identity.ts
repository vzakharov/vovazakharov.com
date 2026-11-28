import { ed25519 } from '@noble/curves/ed25519.js';
import {
  generateMnemonic,
  mnemonicToSeedSync,
  validateMnemonic,
} from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';

/** A 12-word phrase: 128 bits, as BIP-39 counts them. */
const PHRASE_BITS = 128;
/** An Ed25519 secret key's length, in bytes, taken off the phrase's seed. */
const SECRET_BYTES = 32;

/**
 * Who a player is: `id`, the public key everyone may know them by, and
 * `phrase`, the secret that proves it, which never leaves their browser.
 */
export type Identity = { id: string; phrase: string };

const base64url = (bytes: Uint8Array): string =>
  btoa(String.fromCodePoint(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');

/** `phrase` with its words lower-cased and single-spaced, as BIP-39 reads it. */
const tidied = (phrase: string): string =>
  phrase.trim().toLowerCase().split(/\s+/).join(' ');

/** Whether `phrase` is a phrase some identity was made from. */
export const isPhrase = (phrase: string): boolean =>
  validateMnemonic(tidied(phrase), wordlist);

/**
 * The identity `phrase` proves: its Ed25519 key is the first 32 bytes of the
 * phrase's BIP-39 seed, and the id that key's public half, base64url. The
 * same phrase gives the same id on any device. Throws on a phrase that is
 * none, so a typo never mints a stranger.
 */
export function identityOf(phrase: string): Identity {
  const words = tidied(phrase);
  if (!validateMnemonic(words, wordlist)) {
    throw new Error('Not a phrase: a word is misspelt or missing');
  }
  const secret = mnemonicToSeedSync(words).slice(0, SECRET_BYTES);
  return { id: base64url(ed25519.getPublicKey(secret)), phrase: words };
}

/**
 * A new identity, from the browser's cryptographic randomness: a key is not
 * the world, so the cube's rolled dice have no say in it.
 */
export const newIdentity = (): Identity =>
  identityOf(generateMnemonic(wordlist, PHRASE_BITS));
