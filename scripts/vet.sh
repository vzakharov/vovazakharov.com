#!/bin/bash
# Vet: the fast checks the agent runs before pushing review-ready work.
#
# See CLAUDE.md → Vetting for the contract and for why this list is what it is.
set -euo pipefail

cd "$(dirname "$0")/.."

pnpm typecheck
# Not `pnpm lint` — it carries --fix, and vetting must not mutate the tree.
pnpm exec eslint .
pnpm format:check
# Stands in for a test suite; also what deploy.yml runs, so green vet = green deploy.
pnpm build
