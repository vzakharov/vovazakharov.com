> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

# Origami infrastructure: the folding engine as a tool, with paper physics

## Goal

Turn the pilot in `docs/remove-before-merging/origami-pilot-mwxvll/pilot/` into
a tool that lives in the repo, and teach it to say when a design cannot be
folded from ordinary paper. The operator's scope: «подготовить инфраструктуру»,
«чтобы не думать заранее о второстепенных вещах типа сайта и голоса» — so no
site, no router, no page, no copy.

Done means: an agent writes a model as a list of steps, runs one command, and
gets renders, a crease pattern, and a per-step report that flags the pilot's
basilisk neck (16 layers in a reverse fold) and passes the same model without
its third narrowing.

## Where it lives

A new app, `src/origami/`, beside the blog family rather than in it. Its parent
is a new abstract app, `scene`, which also becomes `mushrooms`' parent in place
of `kernel`:

```json
"scene": ["kernel"],
"mushrooms": ["scene"],
"origami": ["scene"],
```

`scene` is what the two share and the text sites do not: a canvas page an agent
drives in headless Chromium to look at it. It holds only `scripts/lib/cdp.ts`
for now (see "DRY notes"). Two children earn it under `check:masd`, whose
"insignificant app" check fires on an app with one; nothing mounts `origami`
yet, which that check allows.

- **`src/origami/shared/fold/`** — the engine and the physics, pure TypeScript,
  no DOM, no Node APIs. A segment rather than an entity because nothing here is
  UI; it is the model a future player page will import as is. `index.ts` is its
  public API, which is browser-safe and Node-safe at once.
  - `geometry.ts` — vectors, 2D affine, 4×4 helpers, convex split, overlap,
    shared segment (the pilot's lines 7–130).
  - `state.ts` — `Piece`, `FoldState`, `square()`, `where()`, `layers()`.
  - `fold.ts` — `fold()` with its step schema as a type: line, moving point,
    selection, `dir`, `angle`, `tag`, `lower`/`upper`.
  - `crease-pattern.ts` — `creasePattern()` and an SVG writer.
  - `snapshot.ts` — `snapshot()`, taking the paper so layer offsets are the real
    thickness scaled to the sheet instead of the pilot's fixed `eps`.
  - `paper.ts` — paper presets (below).
  - `physics.ts` — the step report (below).
- **`src/origami/scripts/`** — the agent's tooling, outside the layers as every
  app's scripts are.
  - `fold-model.ts` — the one entry:
    `pnpm origami <model> [--paper <preset>] [--views "az,el;…"] [--seq] [--no-render]`.
    Writes to `tmp/origami/<model>/`: PNGs, `model.json`, `crease-pattern.svg`,
    `report.md`. Exits non-zero when the report has an error-level finding, so
    an agent cannot read a pretty render past an unfoldable step.
  - `lib/render-page.ts` — the three.js scene (the pilot's `render.html`),
    bundled by esbuild into a staged page, the way `build-mushroom-artifact.ts`
    bundles the game.
  - `lib/render.ts` — drives headless Chromium over CDP: loads the page, hands
    it each snapshot and view, screenshots, and fails on any page error or
    console error rather than writing a blank PNG.
- **`src/origami/shared/designs/`** — the models, one file each, starting with
  `basilisk.ts`: the pilot sketch, its parameters typed options instead of env
  vars. A segment of its own because the CLI, the physics tests and a future
  player page all read it, and a segment is what all three may enter; a model in
  `scripts/` would be out of a test's and a page's reach. The models are data
  the engine folds, so `designs` imports `fold` and never the reverse.

## Paper physics

The pilot's engine models zero thickness and perfect accuracy, so it was happy
where hands give up. The report adds three measurements per step, against a
paper preset.

**Paper presets** (`paper.ts`): `kami-15` (150 mm, 0.07 mm — the default, being
what "ordinary paper" means for this project), `copy-a4-square` (210 mm, 0.10
mm), `tissue-foil-35` (350 mm, 0.05 mm, the fallback the previous session kept
in reserve). A preset is a name, a side and a thickness; the thresholds below
are per fold kind, not per paper.

**Per step:**

1. **Layers bent** — how many layers the crease goes through: sample the fold
   line inside the moving flap and count, at each sample, the moving pieces
   hinged on the line there; take the maximum. A reverse fold reports each half
   and their sum, since both halves turn at once.
2. **Thickness** — the deepest stack anywhere after the step (`layers()`), times
   the paper thickness, in mm; and the deepest stack at the crease.
3. **Creep against flap width** — bending `n` layers through 180° shifts the
   outermost against the innermost by about `π·n·t`; report it beside the flap's
   width along the crease (the moving set's chord on the fold line).
4. **Sharpness** — the smallest angle at a flap tip after the step, and how far
   a 1 mm error at the base moves that tip (`1 / tan(θ/2)` mm per mm). The
   basilisk's 5.6° needle amplifies about 20×.

**Findings**, each `warn` or `error` with the numbers that tripped it:

- a valley or mountain fold bending more than 16 layers — `warn`; more than 32 —
  `error`;
- a reverse fold bending more than 8 layers per half — `error` (the previous
  session's budget for ordinary paper; it is what catches the neck);
- creep over 15% of the flap width — `warn`; over 30% — `error`;
- a tip under 10° — `warn`.

The thresholds are named constants in `physics.ts`, each beside the reason it
has that value. They are starting calibrations from folding practice, not
measurements, and the report says so in its header; tuning them is expected once
real models are folded by hand.

Shaping folds (`angle` ≠ 180) are 3D posing on the finished model and are
reported as layer counts only.

## Tests

`node:test` beside each module in `shared/fold/`, run by `pnpm test:all` like
every other pure function under `src/`:

- `fold.test.ts` — a square folded in half is two pieces, two layers, area
  conserved; a book fold then a flap fold moves only the flap; a crease pattern
  of a waterbomb base has the known M/V assignment.
- `physics.test.ts` — the basilisk at default parameters gets an `error` on the
  neck's reverse fold naming 16 layers; with `third: false` it has no `error`.
  It sits in `shared/designs/` beside the model it reads, so it pins the physics
  against the one real model there is.

The renderer has no test: `pnpm build` is not involved (nothing mounts it), and
a screenshot is looked at, not asserted. `pnpm origami basilisk` is its check.

## Dependencies

- `three` and `@types/three` as dev dependencies, pinned. The pilot used
  0.170.0; take the current release at implementation time.
- No Playwright: the repo keeps none, and drives Chromium over CDP itself.

This is a dependency, not a toolchain change: `pnpm install` covers it in
`install-deps.sh`, CI and the environment alike, so none of the four toolchain
sites needs editing.

## Cleanup

The pilot copy under `docs/remove-before-merging/` goes when `/finalize` sweeps
that directory, as it does every branch's. Nothing here deletes it early: the
relay summaries beside it point into it.

## DRY notes

- **`cdp.ts` moves from `src/mushrooms/scripts/lib/` to
  `src/scene/scripts/lib/`**, its one consumer (`play-mushrooms.ts`) re-pointed.
  `origami` cannot import from `mushrooms` (neither is the other's ancestor),
  and a copy would be a second WebSocket client to keep in step. Not `kernel`:
  every site inherits kernel, and none of the text sites drives a page — the
  operator's call on the PR. No meadow test imports it, so the move does not
  touch the game's tests.
- **`findChromium`** (`kernel/scripts/lib/chromium.ts`) is reused as is.
- **The esbuild bundling** follows `build-mushroom-artifact.ts` but is not
  extracted from it: that script inlines Phaser assets into one artifact file,
  this one bundles a page for a screenshot, and what they share is one `build()`
  call — a helper over it would be thinner than its own arguments.
- **`og-render.ts`'s `--screenshot` path** is not reused: it cannot report a
  page error, and a WebGL page that fails renders a blank PNG that exits 0.
- **The pilot's `inspect.mjs`** is not ported as a script: `model.json` already
  carries every piece in world coordinates.
- **Within the engine**, the pilot's two "former top first, restack" loops in
  `fold()` become one `restack(group, base, step)` helper; the rest of the port
  is a typed translation, not a redesign.

## Out of scope

The site, its routing and domain, the voice, an animated step player, and new
fold kinds (crimp, squash, petal) — the previous session listed those as the
engine's next gaps, but they are design work this infrastructure makes possible,
not part of it. Redesigning the basilisk within the budget is the first use of
the tool, not the tool.
