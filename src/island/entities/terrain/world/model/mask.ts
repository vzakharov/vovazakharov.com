import { z } from 'zod';

import { OUR_WORLD, worldHash } from './hash';
import { K, WORD_COUNT } from './layout';
import committed from './mask.json';

const BYTES = 4 * WORD_COUNT;

function fromBase64(text: string): Uint32Array {
  const binary = atob(text);
  if (binary.length !== BYTES) {
    throw new Error(`mask: ${binary.length} bytes, expected ${BYTES}`);
  }
  const view = new DataView(new ArrayBuffer(BYTES));
  for (let n = 0; n < BYTES; n += 1)
    view.setUint8(n, binary.codePointAt(n) ?? 0);
  return Uint32Array.from({ length: WORD_COUNT }, (_, i) =>
    view.getUint32(4 * i, true),
  );
}

function toBase64(words: Uint32Array): string {
  const view = new DataView(new ArrayBuffer(BYTES));
  for (const [i, word] of words.entries()) view.setUint32(4 * i, word, true);
  const chunks: string[] = [];
  for (let n = 0; n < BYTES; n += 0x80_00) {
    const bytes = new Uint8Array(view.buffer, n, Math.min(0x80_00, BYTES - n));
    chunks.push(String.fromCodePoint(...bytes));
  }
  return btoa(chunks.join(''));
}

function assertWordCount(words: Uint32Array, what: string) {
  if (words.length !== WORD_COUNT) {
    throw new Error(`${what}: ${words.length} words, expected ${WORD_COUNT}`);
  }
}

/** `mask.json`: base64 of the mask's little-endian `uint32` words. */
const MaskFileSchema = z.object({
  K: z.literal(K),
  words: z.string().transform(fromBase64),
});

/** A mask read from its file's JSON; throws on any other `K` or length. */
export const parseMask = (json: unknown): Uint32Array =>
  MaskFileSchema.parse(json).words;

/** `mask`'s file text, as `parseMask` reads it and Prettier formats it. */
export function serializeMask(mask: Uint32Array): string {
  assertWordCount(mask, 'mask');
  return `${JSON.stringify({ K, words: toBase64(mask) }, null, 2)}\n`;
}

/** The committed mask `M`, which makes world 1 ours. */
export const MASK: Uint32Array = parseMask(committed);

/** `M(i) = H(1, i) XOR ours(i)`: the mask under which world 1 decodes to `ours`. */
export function makeMask(ours: Uint32Array): Uint32Array {
  assertWordCount(ours, 'ours');
  const hash = worldHash(OUR_WORLD);
  return ours.map((word, i) => (hash(i) ^ word) >>> 0);
}

/** `W(N, i) = H(N, i) XOR M(i)` for every word of world `N`. */
export function worldWords(
  world: string,
  mask: Uint32Array = MASK,
): Uint32Array {
  assertWordCount(mask, 'mask');
  const hash = worldHash(world);
  return mask.map((m, i) => (hash(i) ^ m) >>> 0);
}
