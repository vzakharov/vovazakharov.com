/// <reference types="@webgpu/types" />

import type { Sized } from '@/kernel/shared/typings';

/**
 * One encoding of a stage under the slowdown: the share of its targets' rows
 * it draws, and whether it is the first or the last of the stage's
 * encodings, which carry the stage's start and end stamps.
 */
export type Repeat = { rows: number; first: boolean; last: boolean };

/**
 * The encodings of each stage of a frame drawn `slowdown` times over: one
 * over the fraction past a whole number, then `floor(slowdown)` whole. The
 * part comes first because a pass's clear is not scissored: a whole encoding
 * after it leaves the picture as one alone would. Each encoding is its own
 * render pass clearing its target, which a tiled GPU cannot skip as it skips
 * overdraw it can prove hidden inside one pass.
 */
export function repeatsOf(slowdown: number): Repeat[] {
  const whole = Math.max(1, Math.floor(slowdown));
  const part = slowdown - whole;
  const rows = [
    ...(part > 0 ? [part] : []),
    ...Array.from({ length: whole }, () => 1),
  ];
  return rows.map((share, index) => ({
    rows: share,
    first: index === 0,
    last: index === rows.length - 1,
  }));
}

/** A stage's only encoding, as it is with no slowdown. */
export const UNREPEATED: Repeat = { rows: 1, first: true, last: true };

/** Encodes a stage once per repeat, giving back what its last encoding gave. */
export function encodeRepeats<T>(
  repeats: readonly Repeat[],
  encode: (repeat: Repeat) => T,
): T {
  const [first = UNREPEATED, ...rest] = repeats;
  let made = encode(first);
  for (const repeat of rest) made = encode(repeat);
  return made;
}

/** A stage's encoding over a target of a size, for its scissor. */
export type Scissored = Sized & { repeat: Repeat };

/**
 * `stamp` as `repeat` carries it: the start on the first encoding, the end
 * on the last, so the stamps span every encoding of the stage.
 */
export function stampOf(
  stamp: GPURenderPassTimestampWrites | undefined,
  { first, last }: Repeat,
): GPURenderPassTimestampWrites | undefined {
  if (stamp === undefined || (first && last)) return stamp;
  const { querySet, beginningOfPassWriteIndex, endOfPassWriteIndex } = stamp;
  const begins = first ? beginningOfPassWriteIndex : undefined;
  const ends = last ? endOfPassWriteIndex : undefined;
  if (begins === undefined && ends === undefined) return undefined;
  return {
    querySet,
    ...(begins === undefined ? {} : { beginningOfPassWriteIndex: begins }),
    ...(ends === undefined ? {} : { endOfPassWriteIndex: ends }),
  };
}

/**
 * Begins `descriptor`'s pass as `repeat` encodes it over a `size` target:
 * its share of the stamps, and scissored to its rows where it draws fewer
 * than all. A whole, single encoding begins exactly as `descriptor` says.
 */
export function beginRepeat(
  encoder: GPUCommandEncoder,
  descriptor: GPURenderPassDescriptor,
  repeat: Repeat,
  { width, height }: Sized,
): GPURenderPassEncoder {
  const { timestampWrites, ...rest } = descriptor;
  const stamp = stampOf(timestampWrites, repeat);
  const pass = encoder.beginRenderPass(
    stamp === undefined ? rest : { ...rest, timestampWrites: stamp },
  );
  if (repeat.rows < 1) {
    pass.setScissorRect(
      0,
      0,
      width,
      Math.max(1, Math.ceil(height * repeat.rows)),
    );
  }
  return pass;
}
