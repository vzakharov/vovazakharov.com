import { isWorldNumber } from '@/island/entities/terrain';

/** Our island's world number, which no hash, `#1` and any invalid hash open. */
export const OUR_WORLD = '1';

/**
 * The world a URL hash (`location.hash`, `#` included or not) opens: its
 * `<N>` when that is a world number, else ours. An invalid hash is an
 * expected input with a defined meaning, not a failure.
 */
export function worldOfHash(hash: string): string {
  const world = hash.startsWith('#') ? hash.slice(1) : hash;
  return isWorldNumber(world) ? world : OUR_WORLD;
}
