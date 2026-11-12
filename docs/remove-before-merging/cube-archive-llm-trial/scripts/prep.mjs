// node tmp/llm/prep.mjs — tokenizes prompts.json for every model dir; decode.mjs renders results.
import fs from 'node:fs';
import path from 'node:path';

import { AutoTokenizer, env } from '@huggingface/transformers';

import { header } from './header.mjs';

const here = path.dirname(new URL(import.meta.url).pathname);
env.localModelPath = path.join(here, 'models/');
env.allowRemoteModels = false;

// The first N addresses on floor 26 with distinct document types, so the samples cover the range.
const SEEDS = [];
const seenTypes = new Set();
for (let i = 0; SEEDS.length < Number(process.env.N ?? 12); i++) {
  const addr = `26/${1 + (i % 30)}/${1 + ((i >> 2) % 6)}/${1 + i}/1`;
  const type = header(addr).split('\n')[2];
  if (!seenTypes.has(type)) {
    seenTypes.add(type);
    SEEDS.push(addr);
  }
}
const sampling = { temperature: 0.8, k: 40, mode: process.env.MODE ?? 'float', grid: 8, steps: Number(process.env.STEPS ?? 120), repPenalty: 1.1, repWindow: 64, keepLogits: 8 };

fs.mkdirSync(path.join(here, 'out'), { recursive: true });
for (const dir of fs.readdirSync(path.join(here, 'models'))) {
  const tok = await AutoTokenizer.from_pretrained(dir);
  const items = SEEDS.map((seed) => {
    const text = header(seed);
    return { seed, text, ids: tok.encode(text, { add_special_tokens: false }) };
  });
  fs.writeFileSync(path.join(here, 'out', `prompts.${dir}.json`), JSON.stringify({ items, sampling }));
  console.log(dir, items.map((p) => p.ids.length).join(' '));
}
