import {
  type Address,
  decodeAddress,
  floorsOf,
  planted,
  type Posed,
} from '@/cube/entities/world';
import { arrivedOn, EYE_HEIGHT } from '@/cube/features/player';

/**
 * The query naming a floor the walk went to by its number rather than through
 * the holes above it, and starts on.
 */
const CHEAT_QUERY = 'cheated_to';

/**
 * Where a walk starts, the hatch it landed on its floor through, and whether
 * that hatch was earned, so that the walk's address may be written back.
 * `ashore` starts it asleep on the island's shore instead, `pose` being where it
 * first stands once it has climbed in.
 */
export type Start = Posed & {
  hatch: Address['hatch'];
  resumable: boolean;
  ashore: boolean;
};

/**
 * Where the page starts. `?cheated_to=` wins over the fragment and starts on
 * that floor with no earned hatch, so nothing is written back; a floor the
 * planted world lacks throws, so the route's error boundary names it. Otherwise a fragment resumes the address it spells,
 * standing at a person's height, or yields null when it leads nowhere; with
 * neither, the walk starts asleep outside the cube, floor 1 ahead of it.
 */
export async function startOf(
  query: URLSearchParams,
  fragment: string,
): Promise<Start | null> {
  const asked = query.get(CHEAT_QUERY);
  if (asked !== null) {
    const n = Number(asked);
    const floors = floorsOf(planted);
    if (!Number.isInteger(n) || n < 1 || n > floors) {
      throw new RangeError(
        `?${CHEAT_QUERY}= takes a floor from 1 to ${floors}`,
      );
    }
    return { pose: arrivedOn(n), hatch: null, resumable: false, ashore: false };
  }
  if (fragment === '') {
    return { pose: arrivedOn(1), hatch: null, resumable: true, ashore: true };
  }
  const address = await decodeAddress(planted, fragment);
  if (address === null) return null;
  const { at, hatch } = address;
  return {
    pose: { ...at, eyeAbove: EYE_HEIGHT, scale: 1 },
    hatch,
    resumable: true,
    ashore: false,
  };
}

/** Replaces the URL's fragment without adding a history entry. */
export const writeFragment = (fragment: string): void => {
  globalThis.history.replaceState(null, '', `#${fragment}`);
};

/**
 * Makes the URL say the walk cheated its way to floor `n`, its fragment
 * dropped: an address is of a floor reached through its holes.
 */
export const writeCheat = (n: number): void => {
  globalThis.history.replaceState(null, '', `?${CHEAT_QUERY}=${String(n)}`);
};
