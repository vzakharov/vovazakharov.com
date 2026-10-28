# PR #223: refactor: #170 every script under tsx, through public APIs

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/223
- **Author:** @vzakharov (agent)
- **Base ← Head:** claude/multi-app-sliced-design-7bn3oq ← masd/scripts-under-tsx
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-28T03:44:02Z
- **Updated:** 2026-10-28T04:07:41Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 1

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `eslint/masd-boundaries.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-28T04:05:35Z — "кажется, WET" → [↓](#t01)

---

## Body

## Summary

- **No script is exempt from the import boundaries any more.** The temporary `boundaries/dependencies` block in `eslint.config.ts` is gone. It was hiding 137 imports where scripts read a slice's internal files directly; each now goes through the slice's public API (`index.node-safe.ts`), and that file exports whatever the script needs.
- **New `index.node-safe.ts` files where a slice had none:** the game page, basilisk's home memo, the CV's lib, and shell's colour tokens and breakpoints. They let a script read what it needs without loading a page component, Phaser or a stylesheet. kernel's node-safe config also exports `siteConfig` now.
- **Scripts' own tests may import `index.test-only.ts`**, as every layer's tests already can. This is one new rule in `eslint/masd-boundaries.ts`, needed for `veer-report.test.ts`.
- **`readCatalogueNames` is reached through a new `music/shared/catalogue/index.server-only.ts`.** It reads `node:fs`, so it can't go in the node-safe file that client components import. The ordinary `index.ts` needs to know the site when it loads, and `pnpm music:untold` runs from the repository root with none. It is now the one module behind a server-only file without `import 'server-only'`, and `masd.md` says so. **Open question for the operator:** the alternative is to run `music:untold` through `in-site.sh vova`. That changes the working directory, so every root-relative path in the script would have to change too.
- **Every script runs under `tsx`.** `lint:fsd`, `check:masd` and `check:i18n-payload` move off bare `node`, the `masd-check` test launches the script through `tsx` too, and the comments explaining bare Node's limits are gone. `personas/tools/` stays on bare Node because those tools belong to Майя.

## QA Checklist

- [ ] `untold` — `pnpm music:untold` from the repository root prints `music-untold: current`
- [ ] `codegen` — `pnpm styles:codegen` exits 0 and leaves `styles/` unchanged
- [ ] `og-check` — `pnpm content:og vova --check` and `pnpm content:og basilisk --check` pass (the CV and basilisk cards read through the new barrels)
- [ ] `cv-pdf` — `pnpm content:pdf vova --cv-pages --from-out` after a vova build prints every CV edition within the ceiling
- [ ] `masd` — `pnpm check:masd` and `pnpm lint:fsd` pass under `tsx`
- [ ] `boundaries` — `pnpm lint:check` passes with no script exempted
- [ ] `meadow` — `VET_MEADOW=1 ./scripts/vet.sh` is green (the game's barrels gained exports)

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `untold` | integration | ✅ | `src/music/scripts/vet-songs.sh` runs it in vet when a song moves |
| `codegen` | integration | ✅ | vet runs the codegen and fails on a rewrite |
| `og-check` | integration | ✅ | vet's per-site `content:og --check` |
| `cv-pdf` | e2e | ✅ | vet's CV page-ceiling check, when the CV changed |
| `masd` | integration | ✅ | vet runs both; `scripts/masd-check.test.ts` drives the real script under `tsx` |
| `boundaries` | integration | ✅ | vet's lint shards |
| `meadow` | e2e | ✅ (on request) | only when `VET_MEADOW=1` asks |

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-28T03:44:25Z — "Proposed squash body: ``` The last bite of the multi-app spl…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-28T03:44:25Z

[https://github.com/vzakharov/vovazakharov.com/pull/223#issuecomment-6460114128](https://github.com/vzakharov/vovazakharov.com/pull/223#issuecomment-6460114128)

Proposed squash body:

```
The last bite of the multi-app split before #169 merges: the scripts
that still reached into slices' internals, exempted from the import
boundaries until each app was cut, now enter every layer through a
public API, and the exemption block in eslint.config.ts is gone.

Each script takes what it reads from the slice's index.node-safe.ts,
which gains the names; the game page, basilisk's home memo, the CV's
lib and shell's colour tokens and breakpoints get one, so no script
loads a page component, Phaser or a stylesheet. A script's own tests
may take a slice's index.test-only.ts, as every layer's tests can.
readCatalogueNames sits behind a new index.server-only.ts in music's
catalogue: it reads node:fs, which the node-safe barrel client code
enters must not reach, and the ordinary barrel resolves the site on
import, which pnpm music:untold, run with none, cannot.

Every script runs under tsx: lint:fsd, check:masd and
check:i18n-payload leave bare node, and masd.md says every script runs
under tsx. personas/tools stays on bare node, being Майя's.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `eslint/masd-boundaries.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-28T04:05:35Z — "кажется, WET" → [↓](#t01)

<a id="t01"></a>

### `eslint/masd-boundaries.ts`:1 — unresolved

**@vzakharov (human)** — 2026-10-28T04:05:35Z

кажется, WET

---

## Timeline (status, references, and other events)

- **2026-10-28T03:44:26Z** @vzakharov renamed from «refactor: #170 every script under tsx, entering its layers through public APIs» to «refactor: #170 every script under tsx, through public APIs».
- **2026-10-28T04:07:41Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/223#pullrequestreview-5677663367.
