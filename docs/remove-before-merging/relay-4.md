# Relay 4 — no-pick-omit

## Standing constraints

- «да, байты передавай без моего одобрения сам» — bites hand over to the next session without the operator's review; each bite's end relays on its own.

## The conversation

This session was started by relay 3 with `/relay take claude/no-pick-omit-ikbd3v`; no operator message arrived in it. The operator's own messages are in `docs/remove-before-merging/relay-1.md` § "The conversation".

The agent resumed the paused plan, took bite 3 (the layout and paint side of `src/pages/mushrooms/ui/scene/`, 34 files, ~66 sites), ran the meadow suite in 12 chunks (all green, 2275 tests), `/polish` and the `/pr` refresh (both in subagents), paused the plan and relayed. The context-budget warning came at ~200k mid-bite; the rest was judged to fit in under 100k, so the bite was finished rather than paused.

## Intent

Unchanged: ban `Pick`/`Omit` over the repo's own types so narrow types (and narrow zod schemas) are declared first and wide ones built from them. Not urgent; one PR, landed whole; no review between bites.

## Decisions

Relays 1–3 stand. Added in this session:

- **The bite split was by the type picked**, not by directory: bite 3 took every file whose sites pick layout/paint types (`MeadowLayout`, `Controls`, `Camera`, view's `Placed`, `Stand`, `Bake`, …); bite 4 takes the wiring (`Scened`, `MeadowSound`, `PerchHosts`, `Shown`, `Swell`, the classes) and `api/`.
- **`pnpm type-overlap` floor 2 forced more named combinations**: `ControlledScreen` (layout.ts, used by `gaitSpot` in place of its local `GaitScreen`), `Receding` (view.ts), `Tended` (game.ts). `HillsSunned` names the sky painters' `Sized & NearHilled & Sunned`.
- **`picker-rows.ts`'s `Floor` keeps `floor` inside a `Record<'floor', number>`**, as `Room` declared it before: `mushroom-patch.ts`'s `Held.floor` means something else (a least size), so a shared base would join two meanings.
- **`Spored` split** into `WithSpores & {scattered}`, since `Stand` takes the spores without the count.
- Unused-outside-file bases stay unexported per knip (`InsectScaled`, `WithPulled`, `GroundDeep`); export one when a bite-4 site needs it (`air-spots.ts` will need `InsectScaled`).

## Errors and dead ends

- A multi-file Python substitution script asserts each pattern before writing, but writes files in dict order, so a failed assertion mid-dict leaves earlier files written and later ones not; re-run only the remainder.
- `eslint --fix` reorders import specifiers, so a later exact-string match against an import line can miss; re-grep after fixing.

## State

- Branch `claude/no-pick-omit-ikbd3v`, head `89c2a53` before this summary's commit, pushed.
- Draft PR https://github.com/vzakharov/vovazakharov.com/pull/158, OPEN; body refreshed to three bites done; squash comment unchanged (still accurate).
- Plan `docs/plans/no-pick-omit.paused.md`; bite 3 folded into `## Eaten so far` with the bases a bite-4 site can take; `## Rest of the elephant` holds the last bite (~77 sites, 35 files in the override).
- Polish floor: `3e20091`.
- Estimate: this session 2.5 h senior developer (bite 3). Remainder handed on: 3 h senior developer — "the scene's wiring types (`Scened`, `MeadowSound`, `PerchHosts`, `Shown`) and its classes need decomposing into named bases, the class picks as `implements`-ed types, a naming judgement per type that a codemod cannot make".
- Nothing running, no PR subscription. The muthur sync offer was made; do not make it again.

## Pointers

- `docs/plans/no-pick-omit.paused.md` — contract, recipe, loop, the bases already declared.
- `docs/remove-before-merging/relay-1.md` — the operator's messages verbatim.
- `eslint/rules/no-pick-omit.ts`; `eslint.config.ts`'s override (35 files).
- Every site left: `npx eslint --rule '{"vova/no-pick-omit":"error"}' -f json src/pages/mushrooms/ui src/pages/mushrooms/api`.
- Checks: `pnpm -s typecheck`, `lint`, `type-overlap`, `knip`; meadow tests chunked (`split -n l/12` of `find src/pages/mushrooms -name '*.test.ts'`, two chunks per Bash call).
- Predecessor transcripts: https://claude.ai/code/session_0192xNGzta2VoCEMpJ3Q5ZTw (this one), https://claude.ai/code/session_01Jx3urgG9XBCWWxUzKbbUBb (relay 3), https://claude.ai/code/session_01RX1shpsr6SPcZs4je8rKoS (relay 2), https://claude.ai/code/session_014kf4pQVj4A1ZWtBJR9onxj (relay 1).

## Next step

`go` — resume the paused plan from `/go` Step 1 and take the last bite: the 35 files left in the override. It removes the override, runs the meadow suite, Steps 3–4, and moves the plan to `*.completed.md`. Then stop: `/finalize` is the operator's, and no further relay.
