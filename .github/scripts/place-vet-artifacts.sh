#!/bin/bash
# Put the exports vet.yml's build jobs uploaded back where a local build leaves
# them. download-artifact puts each under tmp/artifacts/<name>/, and an artifact
# of one directory holds that directory's contents, so `out-<site>` is
# `sites/<site>/out`.
set -euo pipefail

cd "$(dirname "$0")/../.."

for artifact in tmp/artifacts/out-*/; do
  site=$(basename "$artifact")
  site=${site#out-}
  mkdir -p "sites/$site/out"
  cp -R "$artifact." "sites/$site/out/"
done
