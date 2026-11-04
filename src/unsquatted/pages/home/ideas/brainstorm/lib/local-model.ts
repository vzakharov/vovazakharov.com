/// <reference types="@webgpu/types" />
import type { Dtype, Reply, Request, Settlement } from './protocol';

/** A request without its `id`, which `ask` assigns. */
type Asked = Request extends infer R
  ? R extends Request
    ? Omit<R, 'id'>
    : never
  : never;

type Listening = { onProgress?: (fraction: number) => void };

type Pending = Listening & { settle: (settlement: Settlement) => void };

let worker: Worker | undefined;
let lastId = 0;
const pending = new Map<number, Pending>();

/**
 * The worker, started on first use, so a visitor who never opts in never
 * loads the model's code.
 */
function started(): Worker {
  if (worker) return worker;

  worker = new Worker(new URL('./model.worker.ts', import.meta.url), {
    type: 'module',
  });
  worker.addEventListener('message', ({ data: reply }: MessageEvent<Reply>) => {
    const waiting = pending.get(reply.id);

    if (reply.kind === 'progress') {
      waiting?.onProgress?.(reply.fraction);
      return;
    }
    pending.delete(reply.id);
    waiting?.settle(reply);
  });

  return worker;
}

/** Sends `request` and waits for its settlement; `failed` rejects. */
async function ask(
  request: Asked,
  { signal, onProgress }: Listening & { signal?: AbortSignal } = {},
): Promise<Settlement> {
  const id = ++lastId;
  const target = started();
  const send = (message: Request) => {
    target.postMessage(message, { transfer: [] });
  };

  return new Promise((resolve, reject) => {
    signal?.addEventListener('abort', () => {
      pending.delete(id);
      send({ id, kind: 'stop' });
      reject(new Error('Aborted.', { cause: signal.reason }));
    });
    pending.set(id, {
      settle: (settlement) => {
        if (settlement.kind === 'failed') reject(new Error(settlement.message));
        else resolve(settlement);
      },
      onProgress,
    });
    send({ ...request, id });
  });
}

let dtype: Promise<Dtype | undefined> | undefined;

/**
 * The weights this GPU runs, or `undefined` where no WebGPU adapter is: a
 * model this size on the CPU takes too long to be worth offering.
 */
export async function modelDtype(): Promise<Dtype | undefined> {
  dtype ??= (async () => {
    if (!('gpu' in navigator)) return;
    const adapter = await navigator.gpu.requestAdapter();

    if (!adapter) return;

    return adapter.features.has('shader-f16') ? 'q4f16' : 'q4';
  })();

  return dtype;
}

async function knownDtype(): Promise<Dtype> {
  const known = await modelDtype();

  if (known === undefined) throw new Error('WebGPU is unavailable.');

  return known;
}

/**
 * Whether the browser still holds the weights: it may evict a site's cache,
 * and loading them again is a download the visitor has to agree to.
 */
export async function modelCached(): Promise<boolean> {
  const settlement = await ask({ kind: 'cached', dtype: await knownDtype() });

  if (settlement.kind !== 'cached')
    throw new Error(`Expected cached, got ${settlement.kind}.`);

  return settlement.cached;
}

let loading: Promise<void> | undefined;

/**
 * Loads the model, downloading it the first time, while `onProgress` hears
 * the fraction done. A failed load is forgotten, so the next call tries
 * again.
 */
export async function startModel(
  onProgress?: (fraction: number) => void,
): Promise<void> {
  loading ??= (async () => {
    await ask({ kind: 'load', dtype: await knownDtype() }, { onProgress });
  })().catch((error: unknown) => {
    loading = undefined;
    throw error;
  });

  return loading;
}

/** Variations of `label`; aborting stops the generation. */
export async function suggest(
  label: string,
  signal: AbortSignal,
): Promise<string[]> {
  await startModel();
  const settlement = await ask({ kind: 'suggest', label }, { signal });

  if (settlement.kind !== 'ideas')
    throw new Error(`Expected ideas, got ${settlement.kind}.`);

  return settlement.names;
}

/** Deletes the weights from the browser's cache and stops the worker. */
export async function forgetModel(): Promise<void> {
  await ask({ kind: 'clear', dtype: await knownDtype() });
  worker?.terminate();
  worker = undefined;
  loading = undefined;
  pending.clear();
}
