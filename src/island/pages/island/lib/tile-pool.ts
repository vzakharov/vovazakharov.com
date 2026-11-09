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
 * Workers in the pool. Each holds its own world field (16 MB), so a few
 * share the fills without a phone paying for one per core.
 */
const POOL_SIZE = 2;

/** Fills a worker holds at once: enough to keep it busy, few enough that a newer, nearer tile is not stuck behind a backlog. */
const IN_FLIGHT = 2;

export type TilePool = CanDispose & {
  /** The field the first worker built, copied out, its seed and its build time. */
  readonly field: Promise<Built>;
  /**
   * The tiles wanted now from `eye` (world metres), replacing what was wanted
   * before: queued ones no longer wanted are dropped, the rest go out nearest
   * the eye first, each filled to the eye's `cubeDetailCut`.
   */
  readonly want: (orders: readonly TileOrder[], eye: Vec3) => void;
  /** Whether the variant `orderId` names is asked of a worker and not yet back. */
  readonly pending: (id: string) => boolean;
};

type Slot = { readonly worker: Worker; busy: number };

type Built = WorldField & { readonly buildMs: number };

/**
 * Starts `POOL_SIZE` tile workers on world `world`, each building its field
 * from the number. Every filled tile goes to `onTile`; a worker's failure goes
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
        if (copy !== null) field.resolve({ field: copy, seed, buildMs });
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
    send(slot, { kind: 'init', world, sendField: index === 0 });
  };
  for (let index = 0; index < POOL_SIZE; index++) spawn(index);

  return {
    field: field.promise,
    want: (orders, eye) => {
      from = eye;
      queue = nearestFirst(
        orders.filter((order) => !inFlight.has(orderId(order))),
        eye,
      );
      pump();
    },
    pending: (id) => inFlight.has(id),
    dispose: () => {
      for (const { worker } of slots) worker.terminate();
    },
  };
}
