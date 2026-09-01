> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) *before* touching code.

# Adopt the `playgramai/playgramapp` linting ruleset

## Goal

Replace this repo's 30-line `eslint.config.mjs` with the explicit, auditable ruleset
`playgramapp` runs — *every rule listed as `error` or `off`, never `warn`, each `off`
carrying its rationale* — scaled down to what a static-export marketing/CV site actually
has. The custom rules (upstream's `playgram/*`; `vova/*` here — see "Decisions") are
triaged individually: ported where the premise
survives the move, dropped where it doesn't.

## Why this is cheap here

The whole source tree is **796 lines across 12 TS/TSX files** (`app/`, `components/`,
`hooks/`, `i18n/`, `lib/`). A ruleset that would be a multi-week migration in a large
codebase is a single pass here, which is the argument for taking the strict version rather
than a softened one.

## Starting point

| | this repo | `playgramapp` |
|---|---|---|
| ESLint | `^9` | `10.0.3` |
| Config | `eslint.config.mjs`, 30 lines | `eslint.config.ts` + `eslint/` (rule groups, 30 custom rules) |
| Presets | `next/core-web-vitals`, `next/typescript`, `prettier` | + `@eslint-react`, `unicorn`, `react-compiler`, `jsx-a11y` (all 39), `simple-import-sort`, `boundaries`, `drizzle` |
| Type-aware linting | no | yes (`projectService: true`) |
| Prettier | run **through** ESLint (`eslint-plugin-prettier`) *and* standalone | standalone only; `eslint-config-prettier` just disables conflicts |
| `tsconfig` strictness | `strict` only | `strict` + 13 extra flags |

## Scope

### Adopted

- **The philosophy and the file layout.** `eslint.config.ts` (TypeScript, loaded via
  `jiti`) as the orchestrator; the rule set split into `eslint/rule-groups/*.ts` by plugin
  family; the `withSeverity(severity, [names])` helper so same-severity rules read as a
  list; `satisfies Linter.RulesRecord` on every group.
- **`core`, `typescript`, `next`, `jsx-a11y`, `unicorn`, `react` rule groups**, essentially
  verbatim — these are project-agnostic. Each `off` keeps its rationale comment.
- **Type-aware linting** (`parserOptions.projectService: true`), which is what makes the
  ~35 highest-value `@typescript-eslint` rules (`no-floating-promises`, the `no-unsafe-*`
  family, `strict-boolean-expressions`) available at all.
- **`@eslint-react/eslint-plugin`** (`recommended-type-checked`) plus its two
  `disable-conflict-*` configs, and **`eslint-plugin-react-compiler`**.
- **`simple-import-sort`**, with the group list re-mapped from FSD layers to this repo's
  actual directories.
- **`.claude/rules/eslint.md`** — the severity policy (`error` or `off`, never `warn`;
  grandfather with a scoped `off`, never a softened severity). This is the rule that keeps
  the ruleset from decaying, so it ports with the config.
- **The `tsconfig.json` strictness flags**, because several rule-group `off`s are
  *delegations* to them and become silent coverage gaps without them
  (`@typescript-eslint/no-unused-vars` → `noUnusedLocals`/`noUnusedParameters`,
  `consistent-return` → `noImplicitReturns`, `dot-notation` →
  `noPropertyAccessFromIndexSignature`).

### Excluded, with reasons

| Not adopted | Why |
|---|---|
| `eslint-plugin-boundaries` + `eslint/boundaries.ts` | Enforces FSD layer imports. This repo has no FSD layers — `app/`, `components/`, `lib/` is flat. |
| `eslint-plugin-drizzle` | No ORM, no database. |
| Steiger | FSD file-structure validator; same reason as `boundaries`. |
| Stylelint (`stylelint.config.mjs`, `stylelint/rules/`) | Their setup is `stylelint-config-standard-scss` for SCSS-authored CSS modules. This repo's only stylesheet is `app/globals.css`, a Tailwind 4 entry — `@theme`/`@apply`/`@custom-variant` at-rules that standard Stylelint flags as unknown. Adopting it would be net-negative config churn for one file. |
| `eslint/no-install-scripts.ts`, `eslint/bare-node-deploy.ts` | Guard modules that run under bare `node` with no install (their nightly CI tools, Railway pre-deploy gates). Nothing here runs that way. |
| The ESLint 10 workarounds | The pinned `react` version override and the manual `{ plugins: { react: reactPlugin } }` re-registration exist because `eslint-config-next` ships an `eslint-plugin-react` that breaks under ESLint 10 (`getFilename()`/`getSourceCode()` removed — vercel/next.js#89764). On ESLint 9 the spread registers cleanly, so both workarounds are dropped rather than copied. |
| Their scoped-override blocks | Every one of them exempts infrastructure this repo doesn't have (Mantine wrappers, safe-action internals, `db-url.ts`, worker threads, the two grandfathering backlogs). New overrides get written from this repo's own violations instead. |

## Custom-rule triage

Thirty upstream `playgram/*` rules, re-namespaced to `vova/*` on the way in. The test
applied to each: **does the premise survive in a
static-export site with no database, no server actions, no Zod, no Mantine, and no test
suite?**

### Port (9)

| Rule | Why it survives |
|---|---|
| `no-default-true` | Boolean params must default off (invert `enabled=true` → `disabled=false`). Pure language convention. |
| `no-redundant-type-alias` | `type A = B` that only renames a named type. Generic TS; its one `@/shared/typings` import is a type-only `{ type: string }` helper to inline. |
| `no-redundant-property-copy` | Prefer destructuring over `key: source.key`. Generic. |
| `no-redundant-defaulted-param-type` | Drops a named annotation on a fully-defaulted destructured param when types prove it redundant. Type-aware, generic. |
| `no-inline-object-param-type` | Inline object type literals in params must be extracted to a named alias. Generic TS; the largest port (5 files, ~800 lines) and the one with real ongoing value as the CV/case-study components grow. |
| `no-split-jsx-spreads` | Multiple `{...{ prop }}` spreads on one element belong in one. Generic JSX. |
| `prefer-shorthand-spread` | `{...{ prop }}` over `prop={prop}`. Generic JSX; pairs with the rule above and with `no-split-jsx-spreads`'s shared `jsx-reserved-attrs` helper. |
| `no-uncaused-rethrow` | `throw new X(…)` in a `catch` must carry the caught error as `{ cause }`. The *check* is generic; only the autofix is coupled (it injects `toError` from `@/shared/logging`, which doesn't exist here). Port the check, reduce the suggestion to the `cause`-threading fix without the import injection. |
| `no-hardcoded-strings` | Flags string literals on user-facing JSX props (`title`, `label`, `alt`, `aria-label`, …). Their target is a slice's `config/texts.ts`; ours is next-intl. The rule body is convention-agnostic — only the diagnostic message names `texts.ts`. Re-point the message at `messages/*.json` + `useTranslations`. This is the one rule with a *direct* bug to catch here: a hardcoded English string silently defeats the `ru` locale. |

Supporting helpers that come along because ported rules import them: `estree-mixins.ts`,
`jsx-reserved-attrs.ts`, `type-services.ts`.

### Drop (21)

- **Database / ORM** — `enforce-rls`, `no-spread-matches`, `prefer-matches`,
  `db-test-timeout`. No Drizzle, no Postgres, no tests.
- **Server actions** — `safe-action-required`, `safe-action-name-matches-const`,
  `no-direct-safe-action-call`, `no-subaction-server-export`,
  `server-actions-barrel-use-server`. `output: 'export'` makes server actions
  *unrepresentable*, not merely unused — these can never fire.
- **Mantine** — `no-direct-mantine-button-import`,
  `no-autosize-textarea-styles-input-height`. This repo is Tailwind.
- **Their module conventions** — `prefer-isnil-isempty`, `prefer-omit-undefined` (both
  autofix to `@/shared/*` helpers that don't exist here), `no-zod-parse-typed-input` (no
  Zod), `texts-literals-only` (self-scopes to a `texts.ts` we don't have),
  `no-hardcoded-breakpoint-strings` (their `BREAKPOINTS` module; Tailwind owns breakpoints
  here).
- **Their runtime shape** — `no-next-url-clone-redirect` (no middleware, no server —
  verified: no `middleware.ts` anywhere), `sorted-by-sort-order` (their LLM model
  catalog), `shortcut-description-title-case` (their Command Palette).

The two rules worth revisiting later rather than never: `prefer-isnil-isempty` and
`prefer-omit-undefined` become portable the moment this repo grows a shared-helpers module.
Noted here so the decision is findable, not re-derived.

## Implementation

1. **Dependencies.** Add `@eslint-react/eslint-plugin`, `eslint-plugin-unicorn`,
   `eslint-plugin-react-compiler`, `eslint-plugin-simple-import-sort`,
   `eslint-plugin-jsx-a11y`, `eslint-plugin-react`, `typescript-eslint`, `jiti`. Drop
   `eslint-plugin-prettier` (see the open question). Keep `eslint-config-prettier`.
2. **`tsconfig.json`** — add `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`,
   `noPropertyAccessFromIndexSignature`, `noUncheckedIndexedAccess`,
   `noFallthroughCasesInSwitch`, `noImplicitOverride`, `allowUnusedLabels: false`,
   `allowUnreachableCode: false`, `forceConsistentCasingInFileNames`,
   `verbatimModuleSyntax`, `noUncheckedSideEffectImports`, `erasableSyntaxOnly`. Skip
   `exactOptionalPropertyTypes` (the source skips it too — library props are typed
   `prop?: string`, not `prop?: string | undefined`) and `allowImportingTsExtensions` (it
   exists there for a bare-`node` migrate script).
3. **`eslint/rule-groups/`** — port `core`, `typescript`, `next`, `jsx-a11y`, `unicorn`,
   `react`, `import-sort` (drop its `drizzle/*` half, re-map the import groups),
   `rule-severity`, plus `vova.ts` (upstream `playgram.ts`) carrying the ported custom
   rules at `error` with their one-line rationale each. `rule-severity.ts` imports their
   `fromEntries`; vendor a local dependency-free copy under `eslint/` rather than pulling
   `src/shared/collections`.
4. **`eslint/rules/`** — port the 9 rules above plus the 3 helpers, inlining the type-only
   `@/shared/typings` imports and de-coupling `no-uncaused-rethrow`'s autofix. Rule
   filenames are unchanged; only the plugin namespace differs.
5. **`eslint.config.ts`** — the orchestrator: preset spreads, plugin registration (the
   custom rules under the `vova` key), merged rule set, `globalIgnores`. Delete
   `eslint.config.mjs`.
6. **Fix the violations.** Expected, from reading the tree:
   - `unicorn/filename-case` over the eight PascalCase files — the kebab-case renames
     under "Decisions", each with its importers updated.
   - `i18n/request.ts`: `(await import(\`../messages/${locale}.json\`)).default` is `any`,
     so `no-unsafe-assignment`/`no-unsafe-return` fire. Fix by typing the catalog against
     `en.json` rather than casting.
   - `@typescript-eslint/consistent-type-imports` (inline `fixStyle`) and
     `simple-import-sort/imports` will rewrite most import blocks — both autofixable.
   - `jsx-a11y` at full strength (39 rules vs. the 6 `eslint-config-next` enables at warn)
     over `LocalePicker`/`ThemeToggle`.
7. **`.claude/rules/eslint.md`** — port the severity policy, re-pointing its
   `docs/decisions/linting-and-formatting.md` reference (this repo has no `docs/decisions/`)
   at the config header instead. Its `paths:` globs become `eslint.config.ts`, `eslint/**`.
8. **`CLAUDE.md`** — the Vetting section names `pnpm exec eslint .`; note that the config is
   now TypeScript and that `eslint/` is itself linted. Add `eslint/` to the repository-layout
   table.
9. **Vet** (`./scripts/vet.sh`) and iterate to green.

## Decisions

**The project-local rules are namespaced `vova/`, not `playgram/`.** The plugin key in
`eslint.config.ts` is `vova`, so every ported rule is `vova/no-default-true`,
`vova/no-hardcoded-strings`, and so on — in the rule group, in the config, and in the
diagnostics ESLint prints. The upstream name is an artifact of the repo the rules came
from and carries no meaning here; `vova` names this site's author, which is what a
personal site's own rules are. It reads distinctly against the installed plugins around
it (`@typescript-eslint/`, `unicorn/`, `jsx-a11y/`), so a violation's origin is obvious
from the rule name alone. The rule-group file is `eslint/rule-groups/vova.ts`, exporting
`vovaRules`.

**Filenames go kebab-case.** `unicorn/filename-case` stays on at `error`, and the eight
PascalCase files rename to match: `Card.tsx` → `card.tsx`, `ThemeToggle.tsx` →
`theme-toggle.tsx`, `HomePage.tsx` → `home-page.tsx`, `RootLayout.tsx` → `root-layout.tsx`,
`CVPage.tsx` → `cv-page.tsx`, `LocalePicker.tsx` → `locale-picker.tsx`, `ThemeProvider.tsx`
→ `theme-provider.tsx`, `useMounted.ts` → `use-mounted.ts`, with their importers updated.
Use `git mv` so history follows. Next's own reserved filenames (`page.tsx`, `layout.tsx`)
are already kebab-compatible and unaffected. *Rejected: exempting PascalCase via
`cases: { kebabCase: true, pascalCase: true }`, or disabling the rule — both keep the
current names but forfeit the parity that is the point of the adoption, on eight files
whose rename is mechanical.*

**`trailingComma` becomes `"all"`**, matching the source and Prettier 3's own default. The
resulting reformat is part of the same pass.

**`no-console` is `error` with no exemptions.** There are zero `console.*` calls in `app/`,
`components/`, `hooks/`, `i18n/` and `lib/` today, so it costs nothing, and a static export
has no server-side logging destination to route to. `next dev` does not run ESLint, so
`console.log` still works while developing. No `scripts/**` exemption is needed — this
repo's `scripts/` is shell and Python, already outside ESLint's reach.

## Open question

**Prettier: drop `eslint-plugin-prettier`?** Formatting is currently checked twice — inside
`eslint .` as a `prettier/prettier` rule, and again by `pnpm format:check`, which `vet.sh`
runs. `playgramapp` keeps only `eslint-config-prettier` (which is purely a list of `off`s
disabling rules that fight Prettier, and stays either way) and lets Prettier run as its own
binary.

  - **(a) Drop `eslint-plugin-prettier`.** — **Recommended**, and written into the plan as
    the operative choice. It collapses a doubled failure into one, keeps ESLint's output
    about correctness rather than whitespace — which matters far more once the rule count
    goes from ~30 to several hundred including the type-aware ones — and drops a Prettier
    pass over every file from every lint run. Coverage is unchanged: `format:check` was
    always the check doing the work. The usual cost is editor feedback, and it does not
    apply here: `.vscode/settings.json` already sets `formatOnSave` with
    `esbenp.prettier-vscode` as the default formatter for every language in the project,
    with ESLint wired separately to `source.fixAll.eslint`. Prettier is already the
    editor's formatter. The one real change is that `pnpm lint` (`eslint . --fix`) stops
    reformatting as a side effect; `pnpm format` is that command.
  - (b) Keep it, accepting the duplicate check and the formatting noise in ESLint output.

## DRY notes

- **Genuinely shared, so reused rather than re-derived:** the `withSeverity` helper and the
  `rule-groups/` split are the source's own de-duplication of "severity repeated on every
  line" and "one 900-line config" — both port as-is and are the reason the rule set stays
  readable. `estree-mixins.ts`, `jsx-reserved-attrs.ts` and `type-services.ts` are ported
  once and shared by the rules that need them, exactly as upstream.
- **`fromEntries` is vendored, not imported.** `rule-severity.ts` upstream reaches into
  `src/shared/collections/from-entries`. This repo has no such module, and creating a
  `lib/collections/` for one 3-line generic consumed solely by ESLint config would be an
  abstraction with exactly one caller in a place the app never reaches. A local
  `eslint/from-entries.ts` keeps the ESLint tree self-contained — which is also what makes
  the "rule files use relative imports, never `@/`" constraint hold trivially here.
- **Deliberate near-duplication in the rule-group files.** `core.ts` and `typescript.ts`
  both name rules like `no-loop-func` — one turning the core rule `off`, the other enabling
  the `@typescript-eslint` replacement. That pairing *is* the audit trail the config's
  philosophy promises; collapsing it into a generated "core rule → TS replacement" map
  would hide the rationale comments that are the whole point. Keep both lines.
- **No shared abstraction over the ported rules.** Each is an independent `Rule.RuleModule`.
  They superficially rhyme (all walk an AST, all report), but their only real commonality is
  the ESLint rule interface itself — factoring a "base rule" over them would invent a
  framework to save nothing.
- **The excluded-rules table is not carried as dead config.** Dropped rules are recorded in
  this plan's prose only; they do not ship as commented-out entries in `rule-groups/`, which
  would be a second, drifting inventory alongside the real one.
