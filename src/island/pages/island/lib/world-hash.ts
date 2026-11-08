import { isWorldNumber, OUR_WORLD } from '@/island/entities/terrain';

/**
 * The world a URL hash (`location.hash`, `#` included or not) opens: its
 * `<N>` when that is a world number, else ours — which no hash opens too. An invalid hash is an
 * expected input with a defined meaning, not a failure.
 */
export function worldOfHash(hash: string): string {
  const world = hash.startsWith('#') ? hash.slice(1) : hash;
  return isWorldNumber(world) ? world : OUR_WORLD;
}
