import { ROOM_METRES } from '@/cube/shared/lib/room-shape';

/** How tall a visitor of floor 1 is, in metres. */
const FIRST_HEIGHT = 1.6;

/** How tall the visitor is on floor `n`, in metres: half of the floor above's. */
export const visitorMetres = (n: number): number => FIRST_HEIGHT / 2 ** (n - 1);

/**
 * How many of floor `n`'s room sides a real metre is drawn as, for it to be
 * life-size in the visitor's frame, where a room's side reads as five metres.
 */
export const sidesPerMetre = (n: number): number => 2 ** (n - 1) / ROOM_METRES;

/** The units a length is written in, largest first, each in metres. */
const UNITS = [
  ['M', 1],
  ['CM', 1e-2],
  ['MM', 1e-3],
  ['µM', 1e-6],
  ['NM', 1e-9],
  ['PM', 1e-12],
  ['FM', 1e-15],
  ['AM', 1e-18],
  ['ZM', 1e-21],
  ['YM', 1e-24],
] as const;

/** `value` to two significant figures, with no trailing zeros. */
export const rounded = (value: number): string =>
  String(Number(value.toPrecision(2)));

/**
 * `metres` as a caption writes it: two significant figures in the largest
 * unit that leaves at least 1 of it — `9 CM`, `760 NM`, `22 ZM`.
 */
export function lengthLabel(metres: number): string {
  const [unit, size] = UNITS.find(([, each]) => metres >= each * 0.9995) ??
    UNITS.at(-1) ?? ['M', 1];
  return `${rounded(metres / size)} ${unit}`;
}

/**
 * The longest of the round lengths 1, 2 and 5 times a power of ten, in
 * metres, that is no longer than `metres`: what a ruler is marked off in.
 */
export function roundLength(metres: number): number {
  const decade = 10 ** Math.floor(Math.log10(metres));
  const lead = [5, 2, 1].find((each) => each * decade <= metres * 1.000_001);
  return (lead ?? 1) * decade;
}
