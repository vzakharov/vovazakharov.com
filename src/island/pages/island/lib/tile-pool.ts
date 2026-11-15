import type { CanDispose } from '@/kernel/shared/typings';

import type { Vec3 } from '@/island/shared/globe';

import { nearestFirst } from '../model/tile-cover';
import {
  type FilledTile,
  orderId,
  type TileOrder,
  type WorkerReply,
  type WorkerRequest,
  type WorldField,
} from './tile-protocol';

/**
 * Workers in a pool on a device with `cores` logical cores and `memoryGb` of
 * memory (each `undefined` where the browser does not say). One core is left
 * to the main thread, 2 workers where the cores are unknown. Each worker is an
 * isolate holding its own copy of the world field and adds ~130 MB to the page,
 * so memory buys one worker per doubling — 1 at ≤1 GB, 2 at 2 GB, 3 at 4 GB, 4
 * at 8 GB — which keeps the pool under ~13 % of a small device's memory and
 * lets unknown memory cap nothing. The pool stops at 4 rather than paying for
 * one per core.
 */
export function poolSize(
  cores: number | undefined,
  memoryGb: number | undefined,
): number {
  const byCores = cores === undefined ? 2 : cores - 1;
  const byMemory =
    memoryGb === undefined ? Infinity : Math.floor(Math.log2(memoryGb) + 1);
  return Math.max(1, Math.min(4, byCores, byMemory));
}

/** `navigator.deviceMemory`, GB, which only Chromium reports. */
function deviceMemory(): number | undefined {
  const memory = 'deviceMemory' in navigator ? navigator.deviceMemory : null;
  return typeof memory === 'number' && memory > 0 ? memory : undefined;
}

/** What a worker other than the first is sent once the first has built the field: a structured-clone copy of it, the pool keeping its own. */
export const adoptRequest = ({ field, seed }: WorldField): WorkerRequest => ({
  kind: 'adopt',
  field,
  seed,
});

/** Fills a worker holds at once: enough to keep it busy, few enough that a newer, nearer tile is not stuck behind a backlog. */
const IN_FLIGHT = 2;

export type TilePool = CanDispose & {
  /** The field the first worker built, copied out, its seed and its build time. */
  readonly field: Promise<Built>;
  /**
   * The tiles wanted now from `eye` (world metres), replacing what was wanted
   * before: queued ones no longer wanted are dropped, the rest go out `first`
   * before `rest`, each nearest the eye first and filled to the eye's
   * `cubeDetailCut`.
   */
  readonly want: (
    first: readonly TileOrder[],
    rest: readonly TileOrder[],
    eye: Vec3,
  ) => void;
  /** Whether the variant `orderId` names is asked of a worker and not yet back. */
  readonly pending: (id: string) => boolean;
};

type Slot = { readonly worker: Worker; busy: number };

type Built = WorldField & { readonly buildMs: number };

/**
 * Starts `poolSize` tile workers for this device on world `world`: the first
 * builds its field from the number, and the rest adopt a copy of it once it
 * has. Every filled tile goes to `onTile`; a worker's failure goes
 * to `onError` and leaves its tile pending. A pool holds one world: another is
 * a new pool, this one disposed.
 */
export function startTilePool(
  world: string,
  onTile: (tile: FilledTile) => void,
  onError: (error: Error) => void,
): TilePool {
  const slots: Slot[] = [];
  const inFlight = new Set<string>();
  let queue: TileOrder[] = [];
  /** The eye the queue was wanted from. */
  let from: Vec3 = [0, 0, 0];

  const send = (slot: Slot, request: WorkerRequest) => {
    slot.worker.postMessage(request, []);
  };

  const pump = () => {
    for (const slot of slots) {
      while (slot.busy < IN_FLIGHT) {
        const order = queue.shift();
        if (order === undefined) return;
        inFlight.add(orderId(order));
        slot.busy += 1;
        send(slot, { ...order, kind: 'fill', eye: from });
      }
    }
  };

  const field = Promise.withResolvers<Built>();

  const spawn = (index: number) => {
    const worker = new Worker(new URL('tile-worker.ts', import.meta.url), {
      type: 'module',
    });
    const slot: Slot = { worker, busy: 0 };
    worker.addEventListener('message', (event: MessageEvent<WorkerReply>) => {
      const message = event.data;
      if (message.kind === 'failed') {
        const error = new Error(
          `tile worker ${String(index)}: ${message.message}`,
        );
        field.reject(error);
        onError(error);
        return;
      }
      if (message.kind === 'built') {
        const { field: copy, seed, buildMs } = message;
        field.resolve({ field: copy, seed, buildMs });
        // Copied, not transferred: the page samples this field too.
        for (const other of slots.slice(1))
          send(other, adoptRequest({ field: copy, seed }));
        return;
      }
      inFlight.delete(orderId(message.tile));
      slot.busy -= 1;
      onTile(message.tile);
      pump();
    });
    worker.addEventListener('error', (event) => {
      const error = new Error(`tile worker ${String(index)}: ${event.message}`);
      field.reject(error);
      onError(error);
    });
    slots.push(slot);
  };
  const size = poolSize(navigator.hardwareConcurrency, deviceMemory());
  for (let index = 0; index < size; index++) spawn(index);
  const [builder] = slots;
  if (builder !== undefined) send(builder, { kind: 'build', world });

  return {
    field: field.promise,
    want: (first, rest, eye) => {
      from = eye;
      const queued = (orders: readonly TileOrder[]) =>
        nearestFirst(
          orders.filter((order) => !inFlight.has(orderId(order))),
          eye,
        );
      queue = [...queued(first), ...queued(rest)];
      pump();
    },
    pending: (id) => inFlight.has(id),
    dispose: () => {
      for (const { worker } of slots) worker.terminate();
    },
  };
}
