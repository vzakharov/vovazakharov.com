/**
 * The model, off the page's thread so generating never freezes the field.
 * Requests run one at a time in arrival order, since one model cannot
 * generate twice at once.
 */
import {
  AutoModelForCausalLM,
  AutoTokenizer,
  InterruptableStoppingCriteria,
  ModelRegistry,
  type PreTrainedModel,
  type PreTrainedTokenizer,
  type ProgressInfo,
  Tensor,
} from '@huggingface/transformers';

import { pick } from '@/kernel/shared/lib/collections';

import { parseIdeas } from './parse-ideas';
import { chatFor } from './prompt';
import type { Dtype, Numbered, Reply, Request, Settlement } from './protocol';

/**
 * Qwen3.5's 0.8B: its text half alone loads under this class, the vision
 * encoder left on the Hub.
 */
const MODEL = 'onnx-community/Qwen3.5-0.8B-ONNX';

/** Ample for six short names, one per line. */
const MAX_NEW_TOKENS = 60;

type Loaded = { tokenizer: PreTrainedTokenizer; model: PreTrainedModel };

let loaded: Promise<Loaded> | undefined;
let queue = Promise.resolve();
let running: number | undefined;
const stopped = new Set<number>();
const stopping = new InterruptableStoppingCriteria();

const reply = (message: Reply) => {
  postMessage(message, { transfer: [] });
};

/** The model, `onProgress` hearing the fraction done while it downloads. */
async function load(dtype: Dtype, onProgress: (fraction: number) => void) {
  const progress_callback = (info: ProgressInfo) => {
    if (info.status === 'progress_total') onProgress(info.progress / 100);
  };

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

  return loaded;
}

/**
 * Whether the weights are in the cache. The model's own file list names the
 * vision encoder this worker never fetches, so only the decoder's weights,
 * the bulk of the download, are looked for.
 */
async function weightsCached(dtype: Dtype): Promise<boolean> {
  const { files } = await ModelRegistry.is_cached_files(MODEL, { dtype });

  return files.some(
    ({ file, cached }) =>
      file === `onnx/decoder_model_merged_${dtype}.onnx_data` && cached,
  );
}

async function suggest(label: string): Promise<string[]> {
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

async function settle(
  request: Exclude<Request, { kind: 'stop' }>,
): Promise<Settlement> {
  if (request.kind === 'suggest')
    return { kind: 'ideas', names: await suggest(request.label) };

  if (request.kind === 'cached')
    return { kind: 'cached', cached: await weightsCached(request.dtype) };

  await (request.kind === 'load'
    ? load(request.dtype, (fraction) => {
        reply({ ...pick(request, 'id'), kind: 'progress', fraction });
      })
    : ModelRegistry.clear_cache(MODEL, pick(request, 'dtype')));

  return { kind: 'done' };
}

/** Runs `request` after those before it, unless it was stopped meanwhile. */
function enqueue(request: Exclude<Request, { kind: 'stop' }>) {
  const numbered: Numbered = pick(request, 'id');

  queue = queue.then(async () => {
    if (stopped.delete(numbered.id)) return;
    running = numbered.id;
    try {
      reply({ ...numbered, ...(await settle(request)) });
    } catch (error) {
      reply({ ...numbered, kind: 'failed', message: String(error) });
    } finally {
      running = undefined;
    }
  });
}

addEventListener('message', ({ data: request }: MessageEvent<Request>) => {
  if (request.kind !== 'stop') {
    enqueue(request);
    return;
  }

  if (running === request.id) stopping.interrupt();
  else stopped.add(request.id);
});
