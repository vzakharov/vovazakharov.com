/**
 * Colour arithmetic on the palette's `0xrrggbb` integers, kept free of
 * Phaser so the tests can hold the palette's contrasts.
 */

type Rgb = Record<'r' | 'g' | 'b', number>;
type Hsv = Record<'h' | 's' | 'v', number>;

function channels(colour: number): Rgb {
  return {
    r: (colour >> 16) & 0xff,
    g: (colour >> 8) & 0xff,
    b: colour & 0xff,
  };
}

/** A channel rounded to a whole byte. */
function byte(value: number): number {
  return Math.min(255, Math.max(0, Math.round(value)));
}

function packed({ r, g, b }: Rgb): number {
  return (byte(r) << 16) | (byte(g) << 8) | byte(b);
}

/** Hue in turns, saturation and value from 0 to 1. */
export function toHsv(colour: number): Hsv {
  const { r, g, b } = channels(colour);
  const high = Math.max(r, g, b);
  const low = Math.min(r, g, b);
  const span = high - low;
  const v = high / 255;
  const s = high === 0 ? 0 : span / high;
  if (span === 0) return { h: 0, s, v };
  const sector =
    high === r
      ? (g - b) / span + 6
      : high === g
        ? (b - r) / span + 2
        : (r - g) / span + 4;
  return { h: (sector / 6) % 1, s, v };
}

function fromHsv({ h, s, v }: Hsv): number {
  const turn = (((h % 1) + 1) % 1) * 6;
  const sector = Math.floor(turn);
  const f = turn - sector;
  const [p, q, t] = [v * (1 - s), v * (1 - s * f), v * (1 - s * (1 - f))];
  const rgb = (
    [
      [v, t, p],
      [q, v, p],
      [p, v, t],
      [p, q, v],
      [t, p, v],
      [v, p, q],
    ] as const
  )[sector % 6] ?? [v, v, v];
  return packed({ r: rgb[0] * 255, g: rgb[1] * 255, b: rgb[2] * 255 });
}

/** `from` blended toward `to` by `t`, channel by channel. */
export function mix(from: number, to: number, t: number): number {
  const a = channels(from);
  const b = channels(to);
  return packed({
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  });
}

/** `colour` turned round the colour wheel by `nudge`, a fraction of a turn. */
export function nudgeHue(colour: number, nudge: number): number {
  const hsv = toHsv(colour);
  return fromHsv({ ...hsv, h: hsv.h + nudge });
}

/** `colour` with its HSV value lowered by the share `by`. */
export function darken(colour: number, by: number): number {
  const hsv = toHsv(colour);
  return fromHsv({ ...hsv, v: hsv.v * (1 - by) });
}

/** An sRGB channel, 0–255, as linear light. */
function linear(channel: number): number {
  const c = channel / 255;
  return c <= 0.040_45 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function encoded(light: number): number {
  const c =
    light <= 0.003_130_8 ? light * 12.92 : 1.055 * light ** (1 / 2.4) - 0.055;
  return c * 255;
}

/** WCAG's relative luminance, from 0 (black) to 1 (white). */
export function luminance(colour: number): number {
  const { r, g, b } = channels(colour);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/** WCAG's contrast ratio between two colours, from 1 to 21. */
export function contrast(a: number, b: number): number {
  const [light, dark] = [luminance(a), luminance(b)].toSorted((x, y) => y - x);
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
}

/** `colour` dimmed in linear light until its luminance is at most `most`, its hue kept. */
export function dimTo(colour: number, most: number): number {
  const now = luminance(colour);
  if (now <= most) return colour;
  // A hair under, so rounding back to whole channels never lands past it.
  const k = (most / now) * 0.98;
  const { r, g, b } = channels(colour);
  return packed({
    r: encoded(linear(r) * k),
    g: encoded(linear(g) * k),
    b: encoded(linear(b) * k),
  });
}
