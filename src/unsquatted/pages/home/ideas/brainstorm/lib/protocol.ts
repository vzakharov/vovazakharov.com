/**
 * The weights' quantization: `q4f16` where the GPU computes in half floats,
 * `q4` elsewhere, a tenth larger.
 */
export type Dtype = 'q4f16' | 'q4';

/** Pairs a reply with the request it answers. */
export type Numbered = { id: number };

/** What the page asks the model's worker. `stop` interrupts request `id`. */
export type Request = Numbered &
  (
    | { kind: 'load' | 'cached' | 'clear'; dtype: Dtype }
    | { kind: 'suggest'; label: string }
    | { kind: 'stop' }
  );

/** The reply that settles a request. */
export type Settlement =
  | { kind: 'done' }
  | { kind: 'cached'; cached: boolean }
  | { kind: 'ideas'; names: string[] }
  | { kind: 'failed'; message: string };

/**
 * The worker's answer to request `id`: any number of `progress` replies while
 * a `load` downloads, then the settlement.
 */
export type Reply = Numbered &
  ({ kind: 'progress'; fraction: number } | Settlement);
