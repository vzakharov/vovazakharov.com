#!/bin/bash
# Put the artifacts vet.yml's build jobs uploaded back where a local build
# leaves them. download-artifact puts each under tmp/artifacts/<name>/, and an
# artifact of one directory holds that directory's contents, so `types-<site>`
# is `apps/<site>/.next/types` and `out-<site>` is `apps/<site>/out`.
set -euo pipefail

cd "$(dirname "$0")/../.."

for artifact in tmp/artifacts/*/; do
  name=$(basename "$artifact")
  site=${name#*-}
  case "$name" in
    types-*) dest="apps/$site/.next/types" ;;
    out-*) dest="apps/$site/out" ;;
    *) continue ;;
  esac
  mkdir -p "$dest"
  cp -R "$artifact." "$dest/"
done
