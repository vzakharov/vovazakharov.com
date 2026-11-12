// node tmp/llm/run-node.mjs <backend web|node> <modelDir> <onnxFile> <outJson> [threads] [forcedJson]
// Generates every prompt in prompts.json at every address, recording tokens and logit digests.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

import { generate } from './core.mjs';

const [backend, modelDir, onnxFile, outJson, threads = '1', forcedJson] = process.argv.slice(2);
const here = path.dirname(new URL(import.meta.url).pathname);
const require = createRequire(path.join(here, '../../package.json'));

const ort =
  backend === 'node'
    ? require(path.join(here, '../../node_modules/.pnpm/onnxruntime-node@1.30.0/node_modules/onnxruntime-node'))
    : await import(path.join(here, '../../node_modules/.pnpm/onnxruntime-web@1.31.0-dev.20260914-8d85527a0/node_modules/onnxruntime-web/dist/ort.wasm.mjs'));
if (backend === 'web') {
  ort.env.wasm.numThreads = Number(threads);
}
const dir = path.join(here, 'models', modelDir);
const cfg = JSON.parse(fs.readFileSync(path.join(dir, 'config.json'), 'utf8'));
const gen = JSON.parse(fs.readFileSync(path.join(dir, 'generation_config.json'), 'utf8'));
cfg.eos_token_id ??= gen.eos_token_id;
const file = path.join(dir, 'onnx', onnxFile);
const opts = {
  executionProviders: ['cpu'],
  graphOptimizationLevel: 'all',
  ...(backend === 'node' ? { intraOpNumThreads: Number(threads), interOpNumThreads: 1 } : {}),
};
let session;
if (backend === 'web') {
  const data = fs.existsSync(`${file}_data`) ? [{ path: `${onnxFile}_data`, data: fs.readFileSync(`${file}_data`) }] : undefined;
  session = await ort.InferenceSession.create(fs.readFileSync(file), { ...opts, externalData: data });
} else {
  session = await ort.InferenceSession.create(file, opts);
}

const job = JSON.parse(fs.readFileSync(path.join(here, 'out', `prompts.${modelDir}.json`), 'utf8'));
const forced = forcedJson ? JSON.parse(fs.readFileSync(forcedJson, 'utf8')) : null;
const results = [];
for (const { seed, ids } of job.items) {
  {
    const f = forced?.results.find((r) => r.seed === seed);
    const r = await generate(ort, session, cfg, ids, seed, {
      ...job.sampling,
      forced: f ? f.steps.map((s) => s.token) : undefined,
      steps: f ? f.steps.length : job.sampling.steps,
    });
    results.push({ seed, ...r });
    process.stderr.write(`${modelDir} ${backend}/${threads} ${seed}: ${r.steps.length} tok, ${r.tokPerSec.toFixed(1)} tok/s\n`);
  }
}
fs.writeFileSync(outJson, JSON.stringify({ backend, threads, modelDir, onnxFile, results }));
