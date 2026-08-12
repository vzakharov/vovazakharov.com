#!/bin/bash
# Vet: the fast checks the agent runs before pushing review-ready work.
#
# See CLAUDE.md → Vetting for the contract.
#
# There is no test suite here, so `pnpm build` is the only end-to-end check —
# it is also exactly what deploy.yml runs on main, so a green vet means a
# green deploy.
set -euo pipefail

cd "$(dirname "$0")/.."

pnpm typecheck
# Not `pnpm lint` — that script carries --fix, which would mutate the working
# tree during what must stay a read-only check.
pnpm exec eslint .
pnpm format:check
pnpm build
