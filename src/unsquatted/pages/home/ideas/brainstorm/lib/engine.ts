/**
 * The model itself. Only `local-model.ts` imports it, and dynamically, so
 * transformers.js loads on opt-in and never for a visitor who does not.
 */
import {
  AutoModelForCausalLM,
  AutoTokenizer,
  env,
  InterruptableStoppingCriteria,
  ModelRegistry,
  type PreTrainedModel,
  type PreTrainedTokenizer,
  type ProgressInfo,
  Tensor,
} from '@huggingface/transformers';

import { parseIdeas } from './parse-ideas';
import { chatFor } from './prompt';

/**
 * The weights' quantization: `q4f16` where the GPU computes in half floats,
 * `q4` elsewhere, a tenth larger.
 */
export type Dtype = 'q4f16' | 'q4';

/**
 * Qwen3.5's 0.8B: its text half alone loads under this class, the vision
 * encoder left on the Hub.
 */
const MODEL = 'onnx-community/Qwen3.5-0.8B-ONNX';

/** Ample for three short names, one per line. */
const MAX_NEW_TOKENS = 30;

// transformers.js points ONNX Runtime at its wasm on jsDelivr; unset, the
// runtime finds the copy the bundler emits beside it, of the version it was
// built with.
if (env.backends.onnx.wasm) delete env.backends.onnx.wasm.wasmPaths;

/** The running load's signal, carried by every request the library makes. */
let downloads: AbortSignal | null = null;

// The library's loaders take no signal, and every file goes through here.
env.fetch = async (input: string | URL, init?: RequestInit) =>
  fetch(input, { ...init, signal: downloads });

type Loaded = { tokenizer: PreTrainedTokenizer; model: PreTrainedModel };

let loaded: Promise<Loaded> | undefined;
const stopping = new InterruptableStoppingCriteria();

/**
 * The model, `onProgress` hearing the fraction done while it downloads.
 * Aborting `signal` cuts the downloads short and rejects; the files already
 * complete stay cached, so the next load fetches only the rest.
 */
export async function load(
  dtype: Dtype,
  signal: AbortSignal,
  onProgress?: (fraction: number) => void,
): Promise<void> {
  const progress_callback = (info: ProgressInfo) => {
    if (info.status === 'progress_total') onProgress?.(info.progress / 100);
  };

  downloads = signal;
  loaded ??= Promise.all([
    AutoTokenizer.from_pretrained(MODEL),
    AutoModelForCausalLM.from_pretrained(MODEL, {
      dtype,
      device: 'webgpu',
      progress_callback,
    }),
  ]).then(
    ([tokenizer, model]) => ({ tokenizer, model }),
    (error: unknown) => {
      loaded = undefined;
      throw error;
    },
  );

  await loaded;
  // Aborted once every file was in, the load finishes anyway; it still
  // answers as stopped, and the next one finds the model already up.
  signal.throwIfAborted();
}

/**
 * Whether the weights are in the cache. The model's own file list names the
 * vision encoder this page never fetches, so only the decoder's weights, the
 * bulk of the download, are looked for.
 */
export async function weightsCached(dtype: Dtype): Promise<boolean> {
  const { files } = await ModelRegistry.is_cached_files(MODEL, { dtype });

  return files.some(
    ({ file, cached }) =>
      file === `onnx/decoder_model_merged_${dtype}.onnx_data` && cached,
  );
}

/**
 * Variations of `label`. One generation at a time: the caller queues them,
 * and `stop` cuts the running one short.
 */
export async function generate(label: string): Promise<string[]> {
  if (!loaded) throw new Error('The model is not loaded.');

  const { tokenizer, model } = await loaded;
  // `enable_thinking` goes to the chat template, which the options' type
  // does not list: held in a variable, the object passes as a wider one.
  const options = {
    add_generation_prompt: true,
    enable_thinking: false,
    return_dict: true,
  } as const;
  const inputs = tokenizer.apply_chat_template(chatFor(label), options);

  stopping.reset();
  const output = await model.generate({
    ...inputs,
    max_new_tokens: MAX_NEW_TOKENS,
    do_sample: true,
    temperature: 0.8,
    top_p: 0.95,
    repetition_penalty: 1.1,
    stopping_criteria: stopping,
  });

  if (!(output instanceof Tensor)) throw new TypeError('No tokens came back.');
  const [, asked = 0] = inputs.input_ids.dims;
  const [, total = 0] = output.dims;
  const [answer = ''] = tokenizer.batch_decode(
    output.slice(null, [asked, total]),
    { skip_special_tokens: true },
  );

  return parseIdeas(answer, label);
}

/** Cuts the running generation short. */
export function stop(): void {
  stopping.interrupt();
}

/** Deletes the weights from the cache and drops the loaded model. */
export async function clear(dtype: Dtype): Promise<void> {
  const held = loaded;

  loaded = undefined;
  await (await held)?.model.dispose();
  await ModelRegistry.clear_cache(MODEL, { dtype });
}
