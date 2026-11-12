// node tmp/llm/compare.mjs <ref.json> <other.json>
// Per address: the first step whose logits are not bit-identical, the first step whose
// token differs, and — when <other> was teacher-forced on <ref>'s tokens — how many
// steps <other> would have sampled a different token, with the largest top-logit gap.
import fs from 'node:fs';

const [a, b] = process.argv.slice(2).map((f) => JSON.parse(fs.readFileSync(f, 'utf8')));
let identical = 0;
let total = 0;
let flips = 0;
let maxDiff = 0;
const minMargins = [];
for (const ra of a.results) {
  const rb = b.results.find((r) => r.seed === ra.seed);
  if (!rb) continue;
  const n = Math.min(ra.steps.length, rb.steps.length);
  let firstDigest = -1;
  let firstToken = -1;
  let f = 0;
  for (let i = 0; i < n; i++) {
    const sa = ra.steps[i];
    const sb = rb.steps[i];
    total++;
    if (sa.digest === sb.digest) identical++;
    else if (firstDigest < 0) firstDigest = i;
    if (sa.token !== sb.token && firstToken < 0) firstToken = i;
    if (sa.wouldPick !== sb.wouldPick) f++;
    if (sa.top && sb.top && sa.token === sb.token) {
      const mb = new Map(sb.top);
      for (const [id, v] of sa.top) if (mb.has(id)) maxDiff = Math.max(maxDiff, Math.abs(v - mb.get(id)));
    }
    if (sa.margin !== undefined) minMargins.push(sa.margin);
  }
  flips += f;
  console.log(`${ra.seed.padEnd(14)} steps ${n}  first non-identical logits @${firstDigest}  first token divergence @${firstToken}  sampling flips ${f}`);
}
minMargins.sort((x, y) => x - y);
console.log(`\n${a.backend}/${a.threads} vs ${b.backend}/${b.threads}: bit-identical logits on ${identical}/${total} steps; flips ${flips}; max |dlogit| (top-8, shared context) ${maxDiff.toExponential(2)}`);
if (minMargins.length) {
  const q = (p) => minMargins[Math.floor(p * (minMargins.length - 1))].toExponential(2);
  console.log(`ref sampling margin (prob units): min ${q(0)}  p1 ${q(0.01)}  p5 ${q(0.05)}  median ${q(0.5)}`);
}
