// node tmp/llm/decode.mjs <result.json> [maxPerPrompt] — prints prompt + continuation for each address.
import fs from 'node:fs';
import path from 'node:path';

import { AutoTokenizer, env } from '@huggingface/transformers';

const here = path.dirname(new URL(import.meta.url).pathname);
env.localModelPath = path.join(here, 'models/');
env.allowRemoteModels = false;
const [file, max = '99'] = process.argv.slice(2);
const res = JSON.parse(fs.readFileSync(file, 'utf8'));
const job = JSON.parse(fs.readFileSync(path.join(here, 'out', `prompts.${res.modelDir}.json`), 'utf8'));
const tok = await AutoTokenizer.from_pretrained(res.modelDir);
for (const r of res.results.slice(0, Number(max))) {
  console.log(`----- ${res.modelDir} | address ${r.seed} | ${r.tokPerSec.toFixed(1)} tok/s`);
  console.log(job.items.find((it) => it.seed === r.seed).text + '\u2588' + tok.decode(r.steps.map((s) => s.token), { skip_special_tokens: false }));
}
