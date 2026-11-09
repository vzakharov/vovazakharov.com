import { z } from 'zod';

/**
 * A pinned world's own land series, stored rather than rolled: every `c_lm` up
 * to `degree` at `sphere-series`'s slots, each a signed integer word of `bits`
 * bits times its degree's scale, `c_lm = q_lm · scales[l]`. The words are
 * packed least significant bit first, offset by `2^(bits−1) − 1` so they are
 * unsigned, and base64-encoded.
 */
export const PinnedRowSchema = z.object({
  world: z.string().regex(/^(0|[1-9]\d*)$/),
  degree: z.number().int().min(0),
  bits: z.number().int().min(2).max(32),
  scales: z.array(z.number().nonnegative()),
  words: z.string(),
});

export type PinnedRow = z.infer<typeof PinnedRowSchema>;

/** The largest word magnitude at `bits` bits; `−reach..reach` all fit. */
const reachOf = (bits: number) => 2 ** (bits - 1) - 1;

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(text: string): Uint8Array {
  const binary = atob(text);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Each degree's scale: its largest `|c_lm|` over the word reach, so that
 * coefficient lands on the reach itself. A degree all zero scales by 0.
 */
function degreeScales(series: Float64Array, degree: number, reach: number) {
  const scales: number[] = [];
  for (let l = 0; l <= degree; l += 1) {
    let largest = 0;
    for (let slot = l * l; slot < (l + 1) * (l + 1); slot += 1)
      largest = Math.max(largest, Math.abs(series[slot] ?? 0));
    scales.push(largest / reach);
  }
  return scales;
}

/** `series` (up to `degree`, `(degree + 1)²` slots) as a row at `bits`. */
export function encodePinnedRow(
  world: string,
  series: Float64Array,
  degree: number,
  bits: number,
): PinnedRow {
  const count = (degree + 1) ** 2;
  if (series.length !== count)
    throw new Error(`encodePinnedRow: ${series.length} slots, want ${count}`);
  const reach = reachOf(bits);
  const scales = degreeScales(series, degree, reach);
  const bytes = new Uint8Array(Math.ceil((count * bits) / 8));
  let at = 0;
  for (let l = 0; l <= degree; l += 1) {
    const scale = scales[l] ?? 0;
    for (let slot = l * l; slot < (l + 1) * (l + 1); slot += 1) {
      const q = scale === 0 ? 0 : Math.round((series[slot] ?? 0) / scale);
      let word = Math.min(reach, Math.max(-reach, q)) + reach;
      for (let bit = 0; bit < bits; bit += 1, at += 1) {
        if (word % 2 === 1)
          bytes[at >> 3] = (bytes[at >> 3] ?? 0) | (1 << (at & 7));
        word = Math.floor(word / 2);
      }
    }
  }
  return { world, degree, bits, scales, words: toBase64(bytes) };
}

/** The series a row stores, `(degree + 1)²` slots. */
export function decodePinnedRow({
  degree,
  bits,
  scales,
  words,
}: PinnedRow): Float64Array {
  if (scales.length !== degree + 1)
    throw new Error(
      `decodePinnedRow: ${scales.length} scales for degree ${degree}`,
    );
  const reach = reachOf(bits);
  const bytes = fromBase64(words);
  const series = new Float64Array((degree + 1) ** 2);
  if (bytes.length * 8 < series.length * bits)
    throw new Error('decodePinnedRow: the words end early');
  let at = 0;
  for (let l = 0; l <= degree; l += 1) {
    const scale = scales[l] ?? 0;
    for (let slot = l * l; slot < (l + 1) * (l + 1); slot += 1) {
      let word = 0;
      for (let bit = 0; bit < bits; bit += 1, at += 1) {
        if (((bytes[at >> 3] ?? 0) >> (at & 7)) & 1) word += 2 ** bit;
      }
      series[slot] = (word - reach) * scale;
    }
  }
  return series;
}

/**
 * The pinned rows by world number, each loaded only when its world opens.
 * Every number not here reads `H`.
 */
const PINNED_ROWS: Partial<Record<string, () => Promise<unknown>>> = {
  '1': async () => (await import('./pinned/1.json')).default,
};

/**
 * World `world`'s pinned land series — the shape `landSeries` gives a rolled
 * world, to be synthesised in its place — or `undefined` when the world is
 * not pinned.
 */
export async function pinnedSeries(
  world: string,
): Promise<Float64Array | undefined> {
  const load = PINNED_ROWS[world];
  if (!load) return undefined;
  const row = PinnedRowSchema.parse(await load());
  if (row.world !== world)
    throw new Error(`pinnedSeries: row for #${row.world} filed as #${world}`);
  return decodePinnedRow(row);
}
