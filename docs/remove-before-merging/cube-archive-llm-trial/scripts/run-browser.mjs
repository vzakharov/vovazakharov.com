// node tmp/llm/run-browser.mjs <modelDir> <onnxFile> <outJson> [threads] [forcedJson]
// Same job as run-node.mjs, but onnxruntime-web runs inside headless Chromium.
// The server sends COOP/COEP so threads > 1 can use SharedArrayBuffer.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

import { createRequire } from 'node:module';

// The container's Playwright is global: require() honours NODE_PATH, ESM import does not.
const { chromium } = createRequire(import.meta.url)('playwright');

const [modelDir, onnxFile, outJson, threads = '1', forcedJson] = process.argv.slice(2);
const here = path.dirname(new URL(import.meta.url).pathname);
const ORT = path.join(here, '../../node_modules/.pnpm/onnxruntime-web@1.31.0-dev.20260914-8d85527a0/node_modules/onnxruntime-web/dist');
const TYPES = { '.mjs': 'text/javascript', '.js': 'text/javascript', '.wasm': 'application/wasm', '.json': 'application/json', '.html': 'text/html' };

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const file = url.startsWith('/ort/') ? path.join(ORT, url.slice(5)) : path.join(here, url);
  if (!fs.existsSync(file)) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, {
    'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
  });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;
fs.writeFileSync(
  path.join(here, 'page.html'),
  `<!doctype html><script type="module">
import * as ort from '/ort/ort.wasm.mjs';
import { generate } from '/core.mjs';
window.run = async (modelDir, onnxFile, threads, forced) => {
  ort.env.wasm.wasmPaths = '/ort/';
  ort.env.wasm.numThreads = threads;
  const base = '/models/' + modelDir;
  const cfg = await (await fetch(base + '/config.json')).json();
  const gen = await (await fetch(base + '/generation_config.json')).json();
  cfg.eos_token_id ??= gen.eos_token_id;
  const model = new Uint8Array(await (await fetch(base + '/onnx/' + onnxFile)).arrayBuffer());
  const ext = await fetch(base + '/onnx/' + onnxFile + '_data');
  const externalData = ext.ok ? [{ path: onnxFile + '_data', data: new Uint8Array(await ext.arrayBuffer()) }] : undefined;
  const session = await ort.InferenceSession.create(model, { executionProviders: ['wasm'], graphOptimizationLevel: 'all', externalData });
  const job = await (await fetch('/out/prompts.' + modelDir + '.json')).json();
  const results = [];
  for (const { seed, ids } of job.items) {
    const f = forced?.results.find((r) => r.seed === seed);
    const r = await generate(ort, session, cfg, ids, seed, { ...job.sampling, forced: f ? f.steps.map((s) => s.token) : undefined, steps: f ? f.steps.length : job.sampling.steps });
    results.push({ seed, ...r });
  }
  return { isolated: crossOriginIsolated, ua: navigator.userAgent, results };
};
window.ready = true;
</script>`,
);
const browser = await chromium.launch();
const page = await browser.newPage();
page.on('console', (m) => process.stderr.write(`[page] ${m.text()}\n`));
page.on('pageerror', (e) => process.stderr.write(`[pageerror] ${e}\n`));
await page.goto(`http://localhost:${port}/page.html`);
await page.waitForFunction(() => window.ready);
const forced = forcedJson ? JSON.parse(fs.readFileSync(forcedJson, 'utf8')) : null;
const out = await page.evaluate(([m, o, t, f]) => window.run(m, o, t, f), [modelDir, onnxFile, Number(threads), forced]);
await browser.close();
server.close();
for (const r of out.results) process.stderr.write(`${modelDir} chromium/${threads} ${r.seed}: ${r.steps.length} tok, ${r.tokPerSec.toFixed(1)} tok/s\n`);
process.stderr.write(`isolated=${out.isolated} ${out.ua}\n`);
fs.writeFileSync(outJson, JSON.stringify({ backend: 'chromium', threads, modelDir, onnxFile, results: out.results }));
