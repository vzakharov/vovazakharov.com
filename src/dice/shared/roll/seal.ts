import { assertWorldNumber } from './hash';
import type { Key } from './roll';

/**
 * `S(N, path)`: lowercase hex SHA-256 of `<N>/<path>` in UTF-8 — `pathHash`'s
 * address hashed where no one may find a path from its digest. A commitment's
 * preimage is this spelling byte for byte, so it never changes.
 */
export function sealHash(world: string): (path: string) => Promise<string> {
  assertWorldNumber(world);
  const encoder = new TextEncoder();
  return async (path) => {
    const digest = await crypto.subtle.digest(
      'SHA-256',
      encoder.encode(`${world}/${path}`),
    );
    return Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, '0'),
    ).join('');
  };
}

type Keys = Record<string, Key<never>>;

/** Each named key's seals: `.at(key)` is `S(N, <name>/<key's segments>)`. */
export type Sealed<F extends Keys> = {
  [Name in keyof F]: {
    at: (key: F[Name] extends Key<infer K> ? K : never) => Promise<string>;
  };
};

/** World `N`'s seals, one branch per named key, addressed as `roll` addresses a struct. */
export function sealWith<F extends Keys>(world: string, keys: F): Sealed<F>;

// The entries map name by name onto `Sealed<F>`, which no signature over a
// mapped type can say, so the narrow return is the overload's, as `rollWith`'s.
export function sealWith(world: string, keys: Keys): unknown {
  const seal = sealHash(world);
  return Object.fromEntries(
    Object.entries(keys).map(([name, keyed]) => [
      name,
      { at: async (key: never) => seal(`${name}/${keyed.segments(key)}`) },
    ]),
  );
}
