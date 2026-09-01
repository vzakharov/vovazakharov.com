---
description: ESLint severity policy — error/off only, never warn; how to grandfather
paths:
  - eslint.config.ts
  - eslint/**
---

# ESLint Conventions

- **Severity is `error` or `off` — never `warn`.** If a rule is worth having, it
  blocks the merge (`./scripts/vet.sh`); a warning is a rule nobody enforces
  (LLMs and humans alike treat warnings as negotiable and let them accumulate).
  Do not add a `'warn'` severity to any rule, in the base rule groups
  (`eslint/rule-groups/*.ts`) or a scoped override in `eslint.config.ts`. The
  header of `eslint.config.ts` states the same policy as the config's own
  contract.

- **Grandfather with a scoped `off`, not a `warn`.** When landing a new rule
  that pre-existing code violates, don't soften it to `warn` repo-wide. Add a
  scoped override block in `eslint.config.ts` that turns the rule `off` for the
  named files, with a comment saying _why_ each entry is exempt and (if the
  exemption is temporary) the tracking issue for folding it back under the rule.
  This keeps the rule at `error` everywhere else, so it still catches any new
  violation the moment it's added.

- **A permanent exemption gets a rationale, a temporary one gets an issue.**
  Some call sites are legitimately outside a rule's premise (a file that must
  augment a library type through an `interface`, a page with no locale for an
  i18n rule to protect). Those stay `off` permanently — document the invariant
  in the block comment. A migration backlog stays `off` too, but its comment
  names the issue that tracks emptying it.

- **Rule severities live in `eslint/rule-groups/*.ts`** via
  `withSeverity('error', [...])` / `withSeverity('off', [...])`; per-file
  exceptions live in the scoped-override blocks of `eslint.config.ts`. Keep the
  two concerns in their respective places.

- **Rule files import relatively, never through `@/`.** ESLint loads the config
  with jiti, which does not apply the TypeScript path alias. `eslint/` is
  therefore self-contained in its runtime helpers: anything a rule needs from
  elsewhere is vendored into the tree (`eslint/from-entries.ts`) rather than
  imported from `lib/`. Shared _base types_ are the exception — the type-overlap
  gate allows a member exactly one declaration repo-wide, so a base the catalog
  already homes is re-exported from `lib/typings.ts` through a relative path
  (`eslint/rules/estree-mixins.ts`) instead of being redeclared here.

- **Some rules turn `off` because `tsconfig.json` already covers them.**
  `no-unused-vars` delegates to `noUnusedLocals`/`noUnusedParameters`,
  `consistent-return` to `noImplicitReturns`, `dot-notation` to
  `noPropertyAccessFromIndexSignature`. Removing one of those compiler flags
  silently opens a coverage gap that no lint run reports.
