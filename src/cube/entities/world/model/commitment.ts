/**
 * The hole commitment of floor `n`: lowercase hex SHA-256 of
 * `<seed>/hole/<n>/<x>/<y>`, `(x, y)` being the room on floor `n + 1` the hole
 * drops into. The one place the preimage is spelled.
 */
export async function commitment(
  seed: string,
  n: number,
  x: bigint,
  y: bigint,
): Promise<string> {
  const preimage = new TextEncoder().encode(`${seed}/hole/${n}/${x}/${y}`);
  const digest = await crypto.subtle.digest('SHA-256', preimage);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}
