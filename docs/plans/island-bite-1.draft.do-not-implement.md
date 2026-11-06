> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) *before* touching code.

# Island, bite 1 — the thinnest descent

The contract is `docs/plans/world-game-zoltan-syama/bite-1.md`: what exists when
it is done, the calls it builds to, and how the member talks to the lead. This
file is the bite's gate and its record: `## Eaten so far` and
`## Rest of the bite` go here as the work runs, and a pause names what is built
and what is left.

The island's own plan, `docs/plans/world-game-zoltan-syama.in-progress.md`, is
the lead's, claimed by the lead's session; this bite never edits it, and its
standing constraints hold here too.

## DRY notes

- **The CDP driver is `scene`'s** (`src/scene/scripts/lib/cdp.ts`), shared with
  `pnpm play:mushrooms`; the island's play script adds only its own steps.
- **The tracer is one module**, run by the coastline script now and by the
  browser at star 7.
