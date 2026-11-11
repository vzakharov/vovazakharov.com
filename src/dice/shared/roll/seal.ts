import { assertWorldNumber } from './hash';

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
