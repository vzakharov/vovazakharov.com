/// <reference types="@webgpu/types" />
import type * as EngineModule from './engine';
import type { Dtype } from './engine';

type Engine = typeof EngineModule;

let engine: Promise<Engine> | undefined;

/**
 * The engine, imported on first use, so a visitor who never opts in never
 * loads the model's code. It runs on the page's thread: the bundler emits a
 * `new Worker(new URL(…))` file unbundled, and WebGPU does the heavy work
 * off the thread anyway.
 */
async function started(): Promise<Engine> {
  engine ??= import('./engine').catch((error: unknown) => {
    engine = undefined;
    throw error;
  });

  return engine;
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
  const { weightsCached } = await started();

  return weightsCached(await knownDtype());
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
    const { load } = await started();

    await load(await knownDtype(), onProgress);
  })().catch((error: unknown) => {
    loading = undefined;
    throw error;
  });

  return loading;
}

/** Generations run one at a time, in the order asked. */
let queue: Promise<unknown> = Promise.resolve();

/**
 * Variations of `label`. Aborting while it waits its turn drops it; aborting
 * while it generates stops the generation.
 */
export async function suggest(
  label: string,
  signal: AbortSignal,
): Promise<string[]> {
  await startModel();
  const { generate, stop } = await started();
  const turn = queue.then(async () => {
    signal.throwIfAborted();
    signal.addEventListener('abort', stop, { once: true });
    try {
      const names = await generate(label);

      signal.throwIfAborted();

      return names;
    } finally {
      signal.removeEventListener('abort', stop);
    }
  });

  queue = Promise.allSettled([turn]);

  return turn;
}

/** Deletes the weights from the browser's cache and drops the model. */
export async function forgetModel(): Promise<void> {
  const { clear } = await started();

  loading = undefined;
  await clear(await knownDtype());
}
