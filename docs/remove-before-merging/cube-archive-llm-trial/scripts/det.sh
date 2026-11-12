#!/usr/bin/env bash
# Determinism matrix: every backend generates freely, then the native backends are
# re-run teacher-forced on the wasm reference's tokens so flips are counted per step.
set -euo pipefail
# onnxruntime-web refuses numThreads > 1 under Node, so threading is measured in Chromium only.
cd "$(dirname "$0")"
STEPS=100 N=6 node prep.mjs >/dev/null
for spec in "onnx-community_pythia-14m-ONNX model.onnx" "onnx-community_pythia-14m-ONNX model_quantized.onnx" "onnx-community_SmolLM2-135M-ONNX model_quantized.onnx"; do
  set -- $spec
  m=$1 f=$2 o=out/det.$1.$2
  node run-node.mjs web "$m" "$f" "$o.web1.json" 1 2>>out/det.err
  node run-node.mjs web "$m" "$f" "$o.web1b.json" 1 2>>out/det.err
  node run-browser.mjs "$m" "$f" "$o.chr1.json" 1 2>&1 | tail -1
  node run-browser.mjs "$m" "$f" "$o.chr4.json" 4 2>&1 | tail -1
  node run-node.mjs node "$m" "$f" "$o.nat1.json" 1 2>>out/det.err
  node run-node.mjs node "$m" "$f" "$o.nat4.json" 4 2>>out/det.err
  node run-node.mjs node "$m" "$f" "$o.nat1F.json" 1 "$o.web1.json" 2>>out/det.err
  for x in web1b chr1 chr4 nat1 nat4 nat1F; do
    echo "== $m $f: web1 vs $x"
    node compare.mjs "$o.web1.json" "$o.$x.json" | tail -2
  done
done
