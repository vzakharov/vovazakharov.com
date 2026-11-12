// Deterministic "address -> text" sampler over an ONNX causal LM.
// Runs unchanged in Node (onnxruntime-web or onnxruntime-node) and in the browser:
// the caller injects `ort` and a created session.

const M = 0x9e3779b9;

/** FNV-1a over a string, then murmur3's finaliser. Integer-only, so identical everywhere. */
export function hash32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return fmix(h);
}

function fmix(h) {
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

/** The uniform for token `i` of the document at `seed`: an integer in [0, 2^32). */
export function draw(seed, i) {
  return fmix((hash32(seed) ^ Math.imul(i + 1, M)) >>> 0);
}

/** FNV-1a over the raw bits of a Float32Array: equal digests <=> bit-identical logits. */
export function digest(f32) {
  const u = new Uint32Array(f32.buffer, f32.byteOffset, f32.length);
  let h = 0x811c9dc5;
  for (let i = 0; i < u.length; i++) {
    h ^= u[i];
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

/** Top-k indices by logit, ties broken by lower id. */
function topK(logits, k) {
  const idx = [];
  for (let i = 0; i < logits.length; i++) {
    if (idx.length < k) {
      idx.push(i);
      if (idx.length === k) idx.sort((a, b) => logits[b] - logits[a] || a - b);
    } else if (logits[i] > logits[idx[k - 1]]) {
      let j = k - 1;
      while (j > 0 && logits[i] > logits[idx[j - 1]]) j--;
      idx.splice(j, 0, i);
      idx.pop();
    }
  }
  return idx;
}

/**
 * Pick a token from `logits` with the 32-bit uniform `u`.
 * mode 'float': float64 softmax with Math.exp, CDF walked in token-id order.
 * mode 'quant': logits rounded to 1/grid, weights from an integer table, integer CDF.
 * Returns the token plus how close the decision came to flipping.
 */
export function pick(logits, u, { temperature, k, mode, grid = 8 }) {
  const cand = topK(logits, k);
  const kth = logits[cand[k - 1]];
  const next = (() => {
    let best = -Infinity;
    const inSet = new Set(cand);
    for (let i = 0; i < logits.length; i++) if (!inSet.has(i) && logits[i] > best) best = logits[i];
    return best;
  })();
  const ids = [...cand].sort((a, b) => a - b);
  if (mode === 'float') {
    const m = logits[cand[0]];
    const w = ids.map((i) => Math.exp((logits[i] - m) / temperature));
    const Z = w.reduce((a, b) => a + b, 0);
    const target = (u / 2 ** 32) * Z;
    let acc = 0;
    for (let j = 0; j < ids.length; j++) {
      const lo = acc;
      acc += w[j];
      if (target < acc || j === ids.length - 1) {
        return { token: ids[j], margin: Math.min(target - lo, acc - target) / Z, kGap: kth - next };
      }
    }
  }
  // 'quant'
  const q = ids.map((i) => Math.round(logits[i] * grid));
  const qmax = Math.max(...q);
  // weight table: 2^24 * exp(-d / (grid*T)), integers; d >= ~12*grid*T contributes 0
  const w = q.map((qi) => Math.round(2 ** 24 * Math.exp(-(qmax - qi) / (grid * temperature))));
  // NB Math.exp here only ever sees the same small set of rationals; a shipped
  // version would use a precomputed integer table. Rounding of exact table entries is the same.
  const Z = w.reduce((a, b) => a + b, 0);
  const target = Number((BigInt(u) * BigInt(Z)) >> 32n);
  let acc = 0;
  let roundGap = Infinity;
  for (const i of ids) roundGap = Math.min(roundGap, Math.abs(Math.abs(logits[i] * grid - Math.trunc(logits[i] * grid)) - 0.5) / grid);
  for (let j = 0; j < ids.length; j++) {
    acc += w[j];
    if (target < acc) return { token: ids[j], roundGap, kGap: kth - next };
  }
  return { token: ids[ids.length - 1], roundGap, kGap: kth - next };
}

/** Shapes of the model's KV cache, read from its config.json. */
export function kvShape(cfg) {
  const layers = cfg.num_hidden_layers ?? cfg.num_layers ?? cfg.n_layer;
  const heads = cfg.num_attention_heads ?? cfg.num_heads ?? cfg.n_head;
  const kvHeads = cfg.num_key_value_heads ?? heads;
  const hidden = cfg.hidden_size ?? cfg.n_embd;
  const headDim = cfg.head_dim ?? hidden / heads;
  return { layers, kvHeads, headDim };
}

/**
 * Generate `steps` tokens after `promptIds`, token i drawn with draw(seed, i).
 * With `forced`, the tokens are taken from it instead (teacher forcing), so two
 * backends can be compared step by step on the same context.
 */
export async function generate(ort, session, cfg, promptIds, seed, opts) {
  const { steps, forced, keepLogits = 0, repPenalty = 1, repWindow = 64 } = opts;
  const { layers, kvHeads, headDim } = kvShape(cfg);
  const names = session.inputNames;
  const big = (a) => BigInt64Array.from(a.map(BigInt));
  const past = {};
  for (let l = 0; l < layers; l++) {
    for (const kv of ['key', 'value']) {
      past[`past_key_values.${l}.${kv}`] = new ort.Tensor('float32', new Float32Array(0), [1, kvHeads, 0, headDim]);
    }
  }
  let ids = [...promptIds];
  let feed = [...promptIds];
  const out = [];
  const t0 = performance.now();
  let tFirst = 0;
  for (let s = 0; s < steps; s++) {
    const total = ids.length;
    const inputs = {
      input_ids: new ort.Tensor('int64', big(feed), [1, feed.length]),
    };
    if (names.includes('attention_mask')) inputs.attention_mask = new ort.Tensor('int64', big(Array(total).fill(1)), [1, total]);
    if (names.includes('position_ids')) {
      inputs.position_ids = new ort.Tensor('int64', big(feed.map((_, j) => total - feed.length + j)), [1, feed.length]);
    }
    for (const n of names) if (n.startsWith('past_key_values')) inputs[n] = past[n];
    const res = await session.run(inputs);
    const lg = res.logits;
    const V = lg.dims[2];
    const row = lg.data.slice((feed.length - 1) * V, feed.length * V);
    for (const n of Object.keys(res)) {
      if (n.startsWith('present')) past[n.replace('present', 'past_key_values')] = res[n];
    }
    const raw = digest(row);
    if (repPenalty !== 1) {
      for (const t of new Set(ids.slice(-repWindow))) row[t] = row[t] > 0 ? row[t] / repPenalty : row[t] * repPenalty;
    }
    const u = draw(seed, s);
    const p = pick(row, u, opts);
    const token = forced ? forced[s] : p.token;
    const rec = { token, wouldPick: p.token, digest: raw, margin: p.margin, roundGap: p.roundGap, kGap: p.kGap };
    if (keepLogits) {
      const top = topK(row, keepLogits);
      rec.top = top.map((i) => [i, row[i]]);
    }
    out.push(rec);
    if (s === 0) tFirst = performance.now() - t0;
    ids.push(token);
    feed = [token];
    if (token === cfg.eos_token_id && !forced) break;
  }
  const ms = performance.now() - t0;
  return { steps: out, ms, tFirst, tokPerSec: (out.length - 1) / ((ms - tFirst) / 1000) };
}
