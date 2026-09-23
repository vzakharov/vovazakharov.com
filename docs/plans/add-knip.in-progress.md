# Add knip

Add [knip](https://knip.dev) as a devDependency, give it a config that knows how this repo is entered, fix what it finds, and make it a vet check — so an unused file, export, type or dependency fails `./scripts/vet.sh` the way an unused local already fails `tsc`.

## What a probe found

`pnpm dlx knip@6.38.0` against a spike config in `tmp/` (no source touched):

- **Bare, with no config, it is noise**: 50 "unused files", every route and script among them. Its Next plugin looks for `app/` at the repo root, and the three routers sit under `apps/*/app/`. It also cannot see scripts that `package.json` reaches through `scripts/in-site.sh`.
- **With the entries spelled out, it finds this:**

| Kind                          | Findings                                                                                                                                                                                                   |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Files                         | `src/shared/i18n/request.ts` (a false positive, since `createNextIntlPlugin` names it by string) and `src/app/lib/index.ts` (a barrel nobody enters by: every router imports `@/app/lib/sitemap` directly) |
| devDependencies               | `@steiger/toolkit`, `eslint-plugin-jsx-a11y`, `eslint-plugin-react`, `typescript-eslint`                                                                                                                   |
| Exports, dead everywhere      | 11: barrel re-exports nobody imports (`shared/content`, `shared/config`, `pages/cv`, `pages/music`) and `MUSIC_PROJECTS`/`SITE_IDS` at their source                                                        |
| Exports used only in own file | 10: `SONG_STATUSES`, `costOf`, `isTypeLiteral` and others: `export` on a name only its own module reads                                                                                                    |
| Types, dead everywhere        | 11, the same barrels plus `shared/seo`, `shared/ui`                                                                                                                                                        |
| Types used only in own file   | 13                                                                                                                                                                                                         |

None of the four devDependencies is imported anywhere. `@steiger/toolkit` has its reason in the commit that added it (f00deba): the steiger plugin's shipped declarations import it, so without it every type they carry reads as `any`. The three ESLint plugins are both installed and registered by `eslint-config-next`: `eslint.config.ts` registers only `boundaries` and `simple-import-sort` itself. The lockfile resolves each to a single copy (`typescript-eslint@8.69.0`, `eslint-plugin-react@7.37.5`, `eslint-plugin-jsx-a11y@6.10.2`), which the direct entry and config-next share. So the direct entries change nothing today. They would not rescue the ruleset if config-next dropped a plugin, because nothing here registers it. Their version floor (`^8.69` against config-next's `^8.46`) only matters on a downgrade, and `pnpm update` never makes one.

## Steps

1. **Install.** `pnpm add -D knip`, pinned to the caret of the current major.
2. **`knip.ts` at the root**, typed with `satisfies KnipConfig` so `tsc` checks it, commented the way `eslint.config.ts` is:
   - `entry`: `scripts/*.ts`, `steiger.config.mjs`, `src/shared/i18n/request.ts`, each with its reason: a string reference, or a runner knip has no plugin for.
   - `next.entry`: `apps/*/next.config.ts` and the App Router file conventions under `apps/*/app/**`.
   - `project`: `**/*.{ts,tsx,mjs}`. SCSS stays out. knip follows no `@use`, so including it would only report partials as orphans.
   - `ignoreDependencies`: `@steiger/toolkit` alone, with its reason (types only) in a comment on the entry.
   - No `ignoreExportsUsedInFile`, per question 2.
3. **Drop the three ESLint plugins from `package.json`** (`pnpm remove -D`), per question 1. `pnpm exec eslint .` passing unchanged is the proof that config-next supplies them.
4. **Route the sitemap through its barrel.** The three `apps/*/app/sitemap.ts` import `@/app/lib`, as the layouts already import `@/app/ui`, so `src/app/lib/index.ts` is the entry it claims to be. Deleting the barrel instead would break the rule that the app layer is entered by public API.
5. **Clear the findings.** Drop dead re-exports from their barrels. Delete a dead declaration outright where nothing reads it. Remove `export` from names only their own file reads. No `@public`/`@internal` JSDoc tags, since those are suppressions in all but name.
6. **Vet.** Add `knip='pnpm knip'` to the fan-out in `scripts/vet.sh`, where "fourteen" becomes "fifteen". knip reads source and `package.json` only and writes nothing, so it overlaps the rest safely. Script: `"knip": "knip"`, which is check-only by default. `--fix` exists, and vet must never call it, for the same reason vet never calls `pnpm lint`.
7. **CLAUDE.md § "Vetting".** One line in the command block, and one bullet in the list below it (whose count becomes fifteen). The bullet says what the gate holds, that it reads source only, and that an entry it misses is fixed in `knip.ts` rather than by exempting the file.
8. **Vet green**, then `/polish`, then hand back to `/pr`.

Squash type: `chore:`. Nothing the sites serve changes, so the gate rightly skips the deploy.

## Questions

Each recommended option is already in force in the steps above. Answer tersely ("1a, 2a"). Silence keeps the recommendations.

1. **The three ESLint plugins knip calls unused.**
   - **a) (recommended)** Remove them from `package.json`. The installed copies stay the same, and no exemption is needed.
   - b) Keep them, and exempt them in `knip.ts`. That is a suppression, which CLAUDE.md wants your say-so for, and all it protects is a version floor that nothing ever pushes below.
   - `@steiger/toolkit` gets an exemption either way. Its reason is on record, and no code change removes it.
2. **Exports used only in their own file.**
   - **a) (recommended)** Report them, and drop the `export`. An export is a promise to other modules, and a promise nobody takes up is what knip exists to find.
   - b) Set `ignoreExportsUsedInFile: true`. That makes about 23 fewer edits, but also a weaker gate from day one.

## DRY notes

- **Reused:** `scripts/run-parallel.sh` as the fan-out, the `pnpm <check>` script-name convention, and `eslint.config.ts`'s commented-config form for `knip.ts`.
- **Deliberately not shared:** `knip.ts`'s entry list repeats facts that `package.json` scripts and `apps/site-next-config.ts` already state (which scripts run, where `request.ts` is). Deriving it from them would mean parsing `in-site.sh` argument forms. knip itself reports an entry that goes missing (the file shows up as unused), so drift fails vet rather than going silent. A duplicate that the gate checks is cheaper than a parser.
- **Overlap with `noUnusedLocals`:** none. `tsc` sees a module's unused locals, and knip sees the exports and files between modules. Each covers what the other cannot.
