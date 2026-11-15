import { floorsOf, type World } from './hole';
import type { Standing } from './pose';
import type { Cell } from './room';
import { seals } from './seals';

/**
 * Where a walk is, as its URL fragment carries it. `hatch` is the room of
 * `at`'s floor the walk landed in through the hole above — the answer to that
 * hole's commitment, which no one finds but by falling — and null on floor 1,
 * which no hole leads to. A real hatch implies every floor above it, so the
 * fragment carries the last one alone.
 */
export type Address = { hatch: Cell | null; at: Standing };

const BYTE = 8;
/** Bits of `u` and of `v`, each over `[0, 1)`. */
const SPOT_BITS = 16;
/** Bits of the yaw, over one turn. */
const YAW_BITS = 12;
/** Bits of the elevation: steps of a right angle over 127, offset by 127. */
const ELEVATION_BITS = 8;
const ELEVATION_STEPS = 127;
/** Bytes of the checksum closing the address. */
const CHECK_BYTES = 3;

/** A value and the bits it is packed into. */
type Field = readonly [value: bigint, width: number];

/** `fields` packed most significant bit first, zero-padded to whole bytes. */
function pack(fields: readonly Field[]): Uint8Array {
  let all = 0n;
  let width = 0;
  for (const [value, bits] of fields) {
    if (value < 0n || value >> BigInt(bits) !== 0n) {
      throw new RangeError(
        `${String(value)} does not fit ${String(bits)} bits`,
      );
    }
    all = (all << BigInt(bits)) | value;
    width += bits;
  }
  const length = Math.ceil(width / BYTE);
  all <<= BigInt(length * BYTE - width);
  return Uint8Array.from({ length }, (_, i) =>
    Number((all >> BigInt((length - 1 - i) * BYTE)) & 0xffn),
  );
}

/** The fields `pack` laid out in `widths`, or null when its padding is not zero. */
function unpack(bytes: Uint8Array, widths: readonly number[]): bigint[] | null {
  let all = bytes.reduce(
    (acc, byte) => (acc << BigInt(BYTE)) | BigInt(byte),
    0n,
  );
  const width = widths.reduce((sum, bits) => sum + bits, 0);
  const padding = BigInt(bytes.length * BYTE - width);
  if ((all & ((1n << padding) - 1n)) !== 0n) return null;
  all >>= padding;
  const fields: bigint[] = [];
  for (const bits of widths.toReversed()) {
    fields.unshift(all & ((1n << BigInt(bits)) - 1n));
    all >>= BigInt(bits);
  }
  return fields;
}

/** A room of floor `n` takes `n - 1` bits per axis: it is `2^(n-1)` rooms across. */
const hatchWidths = (n: number): number[] => (n === 1 ? [] : [n - 1, n - 1]);

const placeWidths = (n: number): number[] => [
  n - 1,
  n - 1,
  SPOT_BITS,
  SPOT_BITS,
  YAW_BITS,
  ELEVATION_BITS,
];

const bytesOf = (widths: readonly number[]): number =>
  Math.ceil(widths.reduce((sum, bits) => sum + bits, 0) / BYTE);

const TURN = 2 * Math.PI;
const RIGHT_ANGLE = Math.PI / 2;

const spotOf = (at: number): bigint =>
  BigInt(
    Math.min(2 ** SPOT_BITS - 1, Math.max(0, Math.floor(at * 2 ** SPOT_BITS))),
  );
const spotAt = (q: bigint): number => (Number(q) + 0.5) / 2 ** SPOT_BITS;

const yawOf = (yaw: number): bigint => {
  const steps = 2 ** YAW_BITS;
  return BigInt(((Math.round((yaw / TURN) * steps) % steps) + steps) % steps);
};
const yawAt = (q: bigint): number => (Number(q) / 2 ** YAW_BITS) * TURN;

// Truncated rather than rounded, so a decoded elevation never passes the one
// it was written from, and the pitch clamp still holds.
const elevationOf = (elevation: number): bigint => {
  const steps = Math.trunc((elevation / RIGHT_ANGLE) * ELEVATION_STEPS);
  return BigInt(
    Math.min(ELEVATION_STEPS, Math.max(-ELEVATION_STEPS, steps)) +
      ELEVATION_STEPS,
  );
};
const elevationAt = (q: bigint): number =>
  ((Number(q) - ELEVATION_STEPS) / ELEVATION_STEPS) * RIGHT_ANGLE;

const concat = (...parts: readonly Uint8Array[]): Uint8Array<ArrayBuffer> => {
  const all = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let at = 0;
  for (const part of parts) {
    all.set(part, at);
    at += part.length;
  }
  return all;
};

const sha256 = async (
  bytes: Uint8Array<ArrayBuffer>,
): Promise<Uint8Array<ArrayBuffer>> =>
  new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));

const label = (world: World, purpose: string): Uint8Array =>
  new TextEncoder().encode(`cube-address/${purpose}/${world.seed}/`);

/**
 * `length` bytes of SHA-256 in counter mode over the world and `clear`, the
 * head and checksum: keyed on the checksum, any change of place changes every
 * masked byte, so no character of the fragment stays put as the player moves.
 */
async function keystream(
  world: World,
  clear: Uint8Array,
  length: number,
): Promise<Uint8Array> {
  const blocks = await Promise.all(
    Array.from({ length: Math.ceil(length / 32) }, async (_, i) =>
      sha256(concat(label(world, 'key'), clear, Uint8Array.of(i))),
    ),
  );
  return concat(...blocks).slice(0, length);
}

const checksum = async (world: World, plain: Uint8Array): Promise<Uint8Array> =>
  (await sha256(concat(label(world, 'check'), plain))).slice(0, CHECK_BYTES);

const xor = (bytes: Uint8Array, mask: Uint8Array): Uint8Array =>
  bytes.map((byte, i) => byte ^ (mask[i] ?? 0));

const toBase64Url = (bytes: Uint8Array): string =>
  btoa(String.fromCodePoint(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');

/** The bytes `text` spells in canonical unpadded base64url, or null. */
function fromBase64Url(text: string): Uint8Array | null {
  if (!/^[\w-]*$/.test(text) || text.length % 4 === 1) return null;
  const binary = atob(text.replaceAll('-', '+').replaceAll('_', '/'));
  const bytes = Uint8Array.from(binary, (char) => char.codePointAt(0) ?? 0);
  // Trailing bits atob drops would let two spellings name one address.
  return toBase64Url(bytes) === text ? bytes : null;
}

/**
 * `address` as a URL fragment: the floor in a byte and the hatch bit-packed,
 * both in the clear, then a checksum over them and the place, then the place
 * on the floor masked with a keystream of the world and all that precedes it.
 * Throws when the floor is not `world`'s or the hatch is missing below floor 1
 * or present on it.
 */
export async function encodeAddress(
  world: World,
  { hatch, at: { n, x, y, u, v, yaw, elevation } }: Address,
): Promise<string> {
  if (!Number.isInteger(n) || n < 1 || n > floorsOf(world)) {
    throw new RangeError(`Floor ${String(n)} is not in the world`);
  }
  if ((hatch === null) !== (n === 1)) {
    throw new RangeError(`Floor ${String(n)} takes a hatch below floor 1 only`);
  }
  const head = concat(
    Uint8Array.of(n),
    pack(
      hatch === null
        ? []
        : [
            [hatch.x, n - 1],
            [hatch.y, n - 1],
          ],
    ),
  );
  const place = pack([
    [x, n - 1],
    [y, n - 1],
    [spotOf(u), SPOT_BITS],
    [spotOf(v), SPOT_BITS],
    [yawOf(yaw), YAW_BITS],
    [elevationOf(elevation), ELEVATION_BITS],
  ]);
  const clear = concat(head, await checksum(world, concat(head, place)));
  const mask = await keystream(world, clear, place.length);
  return toBase64Url(concat(clear, xor(place, mask)));
}

/**
 * The address `fragment` spells in `world`, or null when it leads nowhere:
 * malformed, its checksum failing, or its hatch not the room the hole above
 * commits to.
 */
export async function decodeAddress(
  world: World,
  fragment: string,
): Promise<Address | null> {
  const bytes = fromBase64Url(fragment);
  const n = bytes?.[0];
  if (bytes === null || n === undefined || n < 1 || n > floorsOf(world)) {
    return null;
  }
  const headBytes = 1 + bytesOf(hatchWidths(n));
  const placeBytes = bytesOf(placeWidths(n));
  if (bytes.length !== headBytes + placeBytes + CHECK_BYTES) return null;
  const head = bytes.subarray(0, headBytes);
  const clear = bytes.subarray(0, headBytes + CHECK_BYTES);
  const mask = await keystream(world, clear, placeBytes);
  const place = xor(bytes.subarray(clear.length), mask);
  const check = await checksum(world, concat(head, place));
  if (check.some((byte, i) => byte !== clear[headBytes + i])) return null;
  const hatchFields = unpack(head.subarray(1), hatchWidths(n));
  const fields = unpack(place, placeWidths(n));
  if (hatchFields === null || fields === null) return null;
  const [x, y, u, v, yaw, elevation] = fields;
  if (
    x === undefined ||
    y === undefined ||
    u === undefined ||
    v === undefined ||
    yaw === undefined ||
    elevation === undefined ||
    elevation > BigInt(2 * ELEVATION_STEPS)
  ) {
    return null;
  }
  const [hatchX, hatchY] = hatchFields;
  const hatch =
    hatchX === undefined || hatchY === undefined
      ? null
      : { x: hatchX, y: hatchY };
  if (hatch !== null && !(await answers(world, n - 1, hatch))) return null;
  return {
    hatch,
    at: {
      n,
      x,
      y,
      u: spotAt(u),
      v: spotAt(v),
      yaw: yawAt(yaw),
      elevation: elevationAt(elevation),
    },
  };
}

/** Whether `(x, y)` is the room floor `n`'s hole commits to, on floor `n + 1`. */
async function answers(
  world: World,
  n: number,
  { x, y }: Cell,
): Promise<boolean> {
  const { hole } = seals(world.seed);
  return (await hole.at({ n, x, y })) === world.holes[n - 1];
}
