/// <reference types="@webgpu/types" />

import { asError } from '@/kernel/shared/lib/error-class';
import type { CanDispose } from '@/kernel/shared/typings';

/** The stretches of a frame the GPU times, in the order a frame runs them. */
const STAGES = ['scene', 'mirrors', 'glow', 'lens'] as const;
type Stage = (typeof STAGES)[number];

/** Milliseconds of GPU time per frame on each stage, the mean of a window. */
export type PassTimes = Record<Stage, number>;

type TimingSwitch = {
  /**
   * Starts or stops timing, dropping whatever was timed before: while off, a
   * frame carries no stamps and reads nothing back.
   */
  timing: (on: boolean) => void;
};

export type Timed = TimingSwitch & {
  /**
   * The GPU's time per frame on each stage, the mean of the frames read
   * since the last call; null where the GPU cannot time passes, or no frame
   * was read.
   */
  passTimes: () => PassTimes | null;
};

/**
 * The instants stamped each frame, by index: the scene pass's start and end,
 * the end of the last mirror pass, the lens pass's start and end. Bloom runs
 * between the mirrors' end and the lens's start.
 */
const STAMPS = 5;

export type PassTimer = CanDispose &
  TimingSwitch & {
    /** Whether frames are stamped: off until `timing` turns it on. */
    stamping: () => boolean;
    /** Stamps the scene pass's start and end. */
    scene: GPURenderPassTimestampWrites;
    /** Stamps the end of the last mirror pass. */
    mirrors: GPURenderPassTimestampWrites;
    /** Stamps the lens pass's start and end. */
    lens: GPURenderPassTimestampWrites;
    /** Records copying this frame's stamps out, unless a read is under way. */
    resolve: (encoder: GPUCommandEncoder) => void;
    /** Reads back the stamps `resolve` copied, once the frame is submitted. */
    read: () => void;
    /** The mean of the frames read since the last call, or null if none was. */
    take: () => PassTimes | null;
  };

const NANOS_PER_MS = 1e6;

const zeroes = (): PassTimes => ({ scene: 0, mirrors: 0, glow: 0, lens: 0 });

/** Each stage's span, in ms, from one frame's stamps in nanoseconds. */
export function spansOf(stamps: BigInt64Array): PassTimes {
  const at = (index: number): number => Number(stamps[index] ?? 0n);
  const span = (from: number, to: number): number =>
    Math.max(at(to) - at(from), 0) / NANOS_PER_MS;
  return {
    scene: span(0, 1),
    mirrors: span(1, 2),
    glow: span(2, 3),
    lens: span(3, 4),
  };
}

/** `times` as one line of the frame-rate meter. */
export const timesLine = (times: PassTimes): string =>
  `GPU ms: ${STAGES.map((stage) => `${stage} ${times[stage].toFixed(2)}`).join(' · ')}`;

/** `timer` as the meter reads it, or nothing to read where there is none. */
export const timedOf = (timer: PassTimer | null): Timed => ({
  passTimes: () => timer?.take() ?? null,
  timing: (on) => {
    timer?.timing(on);
  },
});

/**
 * `Timed` over a drawing that may not be made yet: the switch is held, and
 * handed on to the drawing `settle` is given once it is.
 */
export function heldTiming(drawing: () => Timed | null): {
  timed: Timed;
  settle: (made: Timed) => void;
} {
  let on = false;
  return {
    timed: {
      passTimes: () => drawing()?.passTimes() ?? null,
      timing: (next) => {
        on = next;
        drawing()?.timing(next);
      },
    },
    settle: (made) => {
      made.timing(on);
    },
  };
}

/**
 * A timer over `device`, which must have been made with `timestamp-query`.
 * `onError` hears a read that fails while the timer is live.
 */
export function createPassTimer(
  device: GPUDevice,
  onError: (error: Error) => void,
): PassTimer {
  const querySet = device.createQuerySet({ type: 'timestamp', count: STAMPS });
  const bytes = STAMPS * BigInt64Array.BYTES_PER_ELEMENT;
  const resolved = device.createBuffer({
    size: bytes,
    usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC,
  });
  const readback = device.createBuffer({
    size: bytes,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  });
  /** Whether `readback` is copied into or mapped, and so off limits. */
  let busy = false;
  /** Whether this frame's encoder copies into `readback`. */
  let copied = false;
  let disposed = false;
  let stamping = false;
  let sum = zeroes();
  let frames = 0;

  const read = async (): Promise<void> => {
    await readback.mapAsync(GPUMapMode.READ);
    const stamps = BigInt64Array.from(
      new BigInt64Array(readback.getMappedRange()),
    );
    readback.unmap();
    const spans = spansOf(stamps);
    for (const stage of STAGES) sum[stage] += spans[stage];
    frames += 1;
    busy = false;
  };

  return {
    stamping: () => stamping,
    timing: (on) => {
      stamping = on;
      sum = zeroes();
      frames = 0;
    },
    scene: {
      querySet,
      beginningOfPassWriteIndex: 0,
      endOfPassWriteIndex: 1,
    },
    mirrors: { querySet, endOfPassWriteIndex: 2 },
    lens: { querySet, beginningOfPassWriteIndex: 3, endOfPassWriteIndex: 4 },
    resolve: (encoder) => {
      copied = !busy;
      if (!copied) return;
      busy = true;
      encoder.resolveQuerySet(querySet, 0, STAMPS, resolved, 0);
      encoder.copyBufferToBuffer(resolved, 0, readback, 0, bytes);
    },
    read: () => {
      if (!copied) return;
      copied = false;
      read().catch((error: unknown) => {
        // Destroying the buffers rejects a read under way; that one is moot.
        if (disposed) return;
        onError(asError(error));
      });
    },
    take: () => {
      if (frames === 0) return null;
      const mean = zeroes();
      for (const stage of STAGES) mean[stage] = sum[stage] / frames;
      sum = zeroes();
      frames = 0;
      return mean;
    },
    dispose: () => {
      disposed = true;
      querySet.destroy();
      resolved.destroy();
      readback.destroy();
    },
  };
}
