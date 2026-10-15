# PR #158: chore: ban Pick and Omit over the repo's own types

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/158
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/no-pick-omit-ikbd3v
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-14T21:38:14Z
- **Updated:** 2026-10-15T20:50:16Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 2

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `scripts/lib/mushroom-probe-answers.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-15T05:29:17Z — "давай вот такой хелпер возьмём (пока только хелпер): https:/…" → [↓](#t01)
- **T02** `src/pages/mushrooms/model/bee-genes.ts`:23 — unresolved — last: @vzakharov (human) 2026-10-15T05:30:36Z — "ну и названьице 🙈 (это просто коммент, менять не надо)" → [↓](#t02)

---

## Body

> **Elephant, landed whole across several sessions — complete.** All four bites are done: bite 1 (the rule, its test, and every site outside `src/pages/mushrooms/`), bite 2 (all 27 files under `src/pages/mushrooms/model/`), bite 3 (the 34 files of `src/pages/mushrooms/ui/scene/` that lay out and paint the meadow) and bite 4 (the rest of the meadow, which also deleted the temporary grandfather override from `eslint.config.ts`). No `Pick`/`Omit` over a repo type remains, and the rule is `error` over the whole tree with no exemption.

## Summary

- Adds `vova/no-pick-omit` (`eslint/rules/no-pick-omit.ts`), which rejects `Pick<X, …>` and `Omit<X, …>` wherever `X` resolves — through ESLint's scope manager, no type information — to a type this repo declares: in-file, a relative or `@/` import, a namespace member, an `import()` of a repo path, or a `typeof` inside a library generic. The narrow type is declared first and the wide one intersects it; carving the subset out of the wide type names it without giving it a home.
- A schema-inferred type follows the same order one level down: a narrow zod schema first, the full one `.extend`s it. The case and song frontmatter schemas gain such narrow schemas; `build:vova` and `build:basilisk` pass on them.
- Library and DOM types (`Location`, `AnchorProps`) and type parameters (`pick<T, K>()`) are exempt — nothing there can be declared narrow first. The rule's `node:test` suite (the first for a `vova/` rule) runs it over ESLint's `Linter` with the TypeScript parser, now a direct dev dependency.
- Every site outside the meadow moves to a named narrow base: `ProseSource` / `FileInCollection` / `ServedMarkdown` under `ContentDocument`, `UnlinkedRssItem`, the metadata's `Addresses`, `TextLinkBaseProps`, `WithAvatar`, the song frontmatter's narrow parts, the player's `Playing` / `QueuePositions` / `Cursored`, the case's `Docketed`, and the probe and run-clock types. **Cost:** `LaunchButtons` now receives `Messages['music']` whole, since `Messages` is the catalogue JSON with no narrower type — about 3 KB more in the music index's RSC payload.
- The meadow (`src/pages/mushrooms/`) moves the same way. In the model, `Leg`, `Sight`, `MushroomShape` and `Meadow` split into named parts (`Route`/`Leaving`/`OutFirst`, `FlowersSeen`/`Placed`/`Sheltered`, `Stemmed`/`StemShaped`/`Capped`/`Tilted`, `Unkept`/`KeptMeadow`); in the scene, `MeadowLayout` becomes an intersection of the bases its sites take, the scene's classes (`MeadowSound`, `MapView`, `FlowerBed`, `MushroomBed`, …) implement the narrow types their callers used to pick, and the wiring types (`Scened`, `PerchHosts`, `MeadowKeeping`, `Opening`) intersect named bases. `src/shared/typings` gains `WithWidth` and `WithHeight`, so `Sized` is `WithWidth & WithHeight`. The meadow test suite passes in full (2275 tests).

## QA Checklist

- [ ] `new-pick` — add `type T = Pick<Leg, 'from'>` over an in-file `Leg` to any file; `pnpm lint` fails on it with a message naming the target and the narrow-first fix.
- [ ] `new-omit` — same with `Omit<…>` over a type imported through `@/`; `pnpm lint` fails.
- [ ] `schema` — `Pick<z.infer<typeof Runs>[number], 'from'>` over a repo schema fails; the migrated `entities/case` reads its narrow type off a narrow schema.
- [ ] `library` — `Pick<Location, 'hash'>` and `Omit<AnchorProps, 'inherit'>` pass.
- [ ] `type-param` — `pick<T, K>()` in `src/shared/lib/collections.ts` passes untouched.
- [ ] `no-exemption` — `eslint.config.ts` carries no `off` override for `vova/no-pick-omit`, and `pnpm lint` passes over the whole tree, the meadow included.
- [ ] `sites` — vova (home, documents, music index and song pages) and basilisk (case pages) build and render as before.
- [ ] `launch-buttons` — on the music index the launch buttons show the same labels as on `main`.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `new-pick` | unit | ✅ | `no-pick-omit.test.ts` — in-file type flagged; message names target and fix |
| `new-omit` | unit | ✅ | same file, `@/` import with `Omit` |
| `schema` | unit | ✅ | same file, `typeof` inside a library generic |
| `library` | unit | ✅ | same file, package type and lib global left alone |
| `type-param` | unit | ✅ | same file, type parameter left alone |
| `no-exemption` | integration | ✅ | `pnpm lint` in vet, over the whole tree |
| `sites` | e2e | ✅ | `pnpm build` per site in vet renders every route |
| `launch-buttons` | manual-only | — | visual check that the labels are unchanged |

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01NaViw3RyrPyYGWGysGNfsQ

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-14T21:38:33Z — "Proposed squash body: ``` A narrow type is declared first an…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-14T21:38:33Z

[https://github.com/vzakharov/vovazakharov.com/pull/158#issuecomment-6179067479](https://github.com/vzakharov/vovazakharov.com/pull/158#issuecomment-6179067479)

Proposed squash body:

```
A narrow type is declared first and the wide one is built from it, so
carving a subset back out of a wide type with Pick or Omit is the wrong
order: the subset gets a name but no home. A type inferred from a schema
follows the same order one level down — the narrow schema comes first
and the full one extends it.

vova/no-pick-omit rejects Pick<X, …> and Omit<X, …> wherever X resolves,
through ESLint's scope manager and without type information, to a type
this repo declares, a schema-inferred one included. Library and DOM
types and type parameters are exempt, since nothing there can be
declared narrow first. Its node:test suite runs it over ESLint's Linter
with the TypeScript parser, now a direct dev dependency.

The whole tree, the mushroom meadow included, moves to named narrow
bases that the wide types intersect, and the case and song frontmatter
schemas gain narrow schemas their full ones extend; the rule is error
everywhere, with no grandfathered files. LaunchButtons takes the music
messages whole, since the catalogue JSON has no narrower type, at about
3 KB more in the music index's RSC payload.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `scripts/lib/mushroom-probe-answers.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-15T05:29:17Z — "давай вот такой хелпер возьмём (пока только хелпер): https:/…" → [↓](#t01)
- **T02** `src/pages/mushrooms/model/bee-genes.ts`:23 — unresolved — last: @vzakharov (human) 2026-10-15T05:30:36Z — "ну и названьице 🙈 (это просто коммент, менять не надо)" → [↓](#t02)

<a id="t01"></a>

### `scripts/lib/mushroom-probe-answers.ts`:1 — unresolved

**@vzakharov (human)** — 2026-10-15T05:29:17Z

давай вот такой хелпер возьмём (пока только хелпер): https://github.com/Playgramai/playgramapp/blob/cfcbc00372eb13222e3b7167a74cd3b032e978a2/src/shared/typings/compose-schemas.ts

---

<a id="t02"></a>

### `src/pages/mushrooms/model/bee-genes.ts`:23 — unresolved

```diff
@@ -19,18 +19,21 @@ export const BEE_YELLOWS = ['lemon', 'gold', 'amber', 'honey'] as const;
… 2 lines elided …
 export type BeeGenes = Buzzing &
-  OfKind<'bee'> & {
+  OfKind<'bee'> &
+  BeeHeaded & {
```

**@vzakharov (human)** — 2026-10-15T05:30:36Z

ну и названьице 🙈 

(это просто коммент, менять не надо)

---

## Timeline (status, references, and other events)

- **2026-10-15T20:49:47Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/158#pullrequestreview-5528553602.
