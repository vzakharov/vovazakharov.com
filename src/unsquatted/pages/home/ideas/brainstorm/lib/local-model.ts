/// <reference types="@webgpu/types" />
import type * as EngineModule from './engine';
import type { Dtype } from './engine';

type Engine = typeof EngineModule;

let engine: Promise<Engine> | undefined;

/**
 * The engine, on the page's thread: the bundler emits a
 * `new Worker(new URL(…))` file unbundled, and WebGPU does the heavy work off
 * the thread anyway.
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
 * model this size on the CPU takes too long to be worth offering. A device
 * with no mouse is taken for a phone or tablet and gets `undefined` too: iOS
 * Safari has WebGPU, but kills the tab once the loaded model outgrows its
 * memory allowance.
 */
export async function modelDtype(): Promise<Dtype | undefined> {
  dtype ??= (async () => {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
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
 * and loading them again is a download the visitor is told of.
 */
export async function modelCached(): Promise<boolean> {
  const { weightsCached } = await started();

  return weightsCached(await knownDtype());
}

let loading: Promise<void> | undefined;
let loadStopper: AbortController | undefined;
let progress: number | undefined;
const watchers = new Set<() => void>();

const progressed = (fraction: number | undefined) => {
  progress = fraction;
  for (const watcher of watchers) watcher();
};

let ready = false;

/** The fraction of the model loaded so far, while a load runs. */
export function loadProgress(): number | undefined {
  return progress;
}

/** Whether the model is loaded on this page. */
export function modelReady(): boolean {
  return ready;
}

/**
 * Calls `watcher` whenever `loadProgress` or `modelReady` changes; returns
 * the unwatch.
 */
export function watchLoad(watcher: () => void): () => void {
  watchers.add(watcher);

  return () => {
    watchers.delete(watcher);
  };
}

/**
 * Loads the model, downloading it the first time, while `loadProgress`
 * reports the fraction done. A failed or stopped load is forgotten, so the
 * next call tries again.
 */
export async function startModel(): Promise<void> {
  loading ??= (async () => {
    const stopper = new AbortController();

    loadStopper = stopper;
    progressed(0);
    const { load } = await started();

    try {
      stopper.signal.throwIfAborted();
      await load(await knownDtype(), stopper.signal, progressed);
      // Set before the `finally` below, whose report then carries it.
      ready = true;
    } catch (error) {
      // The library may wrap the aborted fetch's error in one of its own.
      stopper.signal.throwIfAborted();
      throw error;
    }
  })()
    .catch((error: unknown) => {
      loading = undefined;
      throw error;
    })
    .finally(() => {
      loadStopper = undefined;
      progressed(undefined);
    });

  return loading;
}

/** Stops the running load, whose promise then rejects as `isStopped` tells. */
export function stopModel(): void {
  loadStopper?.abort();
}

/** Whether `error` is the one a stopped load rejects with. */
export function isStopped(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
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
  ready = false;
  progressed(undefined);
  await clear(await knownDtype());
}
