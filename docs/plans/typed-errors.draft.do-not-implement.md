> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

# Ban bare `new Error(…)` and migrate the repo to named error classes

Origin: thread T07 in #231's second review round. Base: `claude/unsquatted-site`
(#231), which owns `errorClass` and `fetchOk`; retarget to `main` once #231
merges. Nothing is pushed to `claude/unsquatted-site` itself.

## What exists

- `errorClass(name)` in `src/kernel/shared/lib/error-class.ts`, and
  `fetchOk(url, Failure, init)` in `fetch-ok.ts`, with four modules on #231
  already using them.
- **197 bare `new Error(` sites in 103 files** at `claude/unsquatted-site`
  `3ae6858` (the issue's "~185 in 97" predates #231's later commits): 13 in 8
  test files, 3 outside `src/` (`eslint/masd-graph.ts`,
  `scripts/type-overlap-check.ts`, `scripts/test-changed.test.ts`), the rest
  across every app — densest in `music/scripts`, `mushrooms/pages`,
  `mushrooms/entities`.
- Six copies of `error instanceof Error ? error : new Error(String(error))` —
  the cause-coercion `vova/no-uncaused-rethrow` forces, since a non-`Error`
  cause carries no stack. `fetch-ok.ts` is one of them.
- `src/kernel/shared/lib` is over Steiger's module threshold (18 of 15); #231's
  session is regrouping it, so the helpers' import path may move.

## Steps

1. **Pull #231's head first.** `git merge origin/claude/unsquatted-site` before
   touching anything, and again before the PR leaves draft. If the regrouping
   moved `error-class.ts`/`fetch-ok.ts`, every import below uses the new path.

2. **The rule.** `no-restricted-syntax` in `eslint/rule-groups/core.ts`, at
   `error`, with two selectors — `NewExpression[callee.name='Error']` and
   `CallExpression[callee.name='Error']` (`Error('x')` constructs too) — and a
   message naming `errorClass` and `fetchOk`. No custom rule: a selector says
   all of it, so a rule file and its test would be code with nothing to do. No
   `files`-scoped `off` anywhere, tests included. `extends Error` stays legal,
   so `errorClass` itself needs no exemption.

3. **`asError(value: unknown): Error`** beside `errorClass` in `error-class.ts`
   (no new module — the lib is over threshold): returns an `Error` as is,
   otherwise wraps `String(value)` in a module-local
   `NonErrorThrow = errorClass('NonErrorThrow')`. Replaces all six coercions,
   `fetchOk`'s included.

4. **`fetchOk` where a hand-rolled one stands.** The `fetch` + `!response.ok` +
   throw sites (`music/scripts/lib/scaffold-repository.ts:59` and the like) move
   onto `fetchOk`. A site whose check is more than `ok` (line 128 there also
   validates the byte count) keeps its own check after `fetchOk`, with its own
   class. A probe that _wants_ a non-2xx as data
   (`kernel/scripts/lib/print-origin.ts:98`,
   `unsquatted/.../check-domain.ts:53`) stays on plain `fetch` — those don't
   throw.

5. **The migration, one commit per app** (`kernel`, `blog`, `music`,
   `mushrooms`, `basilisk`, `maya`, `vova`, `bible`, `unsquatted`, then
   `scripts/`+`eslint/`), each passing `pnpm lint` on its own files before the
   next. Convention, applied at every site:
   - **A class names what failed, not where**: `CatalogueParseError`,
     `MissingTranslationError`, `UsageError` — `<Noun>Error`, module-local
     `const`, declared under the imports.
   - **One class per kind of failure in a module**, shared by every throw of
     that kind; two throws earn two classes only when a reader would tell them
     apart (a usage error vs. a malformed file).
   - **Exported only where a caller catches it by class** (`instanceof`), which
     today no caller does — so none are, and no class crosses a module.
   - **Messages stay as they are.** The class adds the _what_; rewording is out
     of scope.
   - **Tests**: a fixture error (`new Error('quota')` as a mocked rejection)
     gets a class named for what it stands in for (`QuotaError`). A test
     asserting on `.message` keeps passing; one asserting `instanceof Error`
     too.
   - `star-images.ts`'s one `new TypeError` stays — the ban is `Error`, and
     `TypeError` already names its kind.

6. **Gates.** `pnpm lint` and `pnpm test:all` locally, then `./scripts/vet.sh`
   once on the pushed head. `pnpm type-overlap` needs nothing: no type is added.

The migration is mechanical enough to fan out per app to subagents, each handed
the convention above verbatim and one app's file list; their diffs are read
before each commit, since naming consistency is the whole point.

## Open question

**1. The two `eslint/` and `scripts/` sites outside `src/`.**
`.claude/rules/eslint.md` keeps `eslint/` self-contained at runtime — helpers
are vendored (`eslint/from-entries.ts`), not imported from `src/`, because jiti
skips the `@/` alias.

- **(a) — recommended.** A relative import
  (`../src/kernel/shared/lib/error-class.ts`) from `eslint/masd-graph.ts`.
  `error-class.ts` has no imports of its own, so jiti never meets an `@/`; the
  rule's reason doesn't bite. Amend the rule's line to say what it actually
  guards: _a module reaching `@/` transitively_ is vendored, a leaf may be
  imported relatively. `scripts/` runs under tsx, which honours `@/`, so it
  imports normally either way.
- **(b)** Vendor `errorClass` into `eslint/` like `fromEntries`. Two copies of a
  nine-line function that drift silently — the duplication CLAUDE.md asks us not
  to write.

The plan is written with (a) in force.

## DRY notes

- **Reused**: `errorClass` and `fetchOk`, unchanged; `no-restricted-syntax`
  rather than a new rule file.
- **Extracted**: `asError` — six identical coercions become one, in the module
  that already owns error construction.
- **Deliberately duplicated**: error classes are per module. A shared catalogue
  (`UsageError` exported from one place, say) would couple a dozen CLIs to one
  module for a one-line declaration, and the class's name is the only thing
  they'd share — not worth an import edge across the MASD graph.
- **Not extracted**: the per-site checks that go beyond `response.ok` stay at
  their sites; `fetchOk` does one thing.
