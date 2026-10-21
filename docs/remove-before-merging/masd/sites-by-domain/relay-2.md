# Relay 2 — masd/sites-by-domain (slice 2 of MASD), parked

`relay-1.md` beside this file is what this session started from.

## Standing constraints

The muthur sync offer was made; do not make it again.

The operator, carried from relay 1: «мы на этом пиаре тестируем и потом, _если_
понравится переносим в базу» — loop-infrastructure changes are tried here first,
never pushed to vzakharov/muthur from this work.

## The conversation

1. **Operator**: `/relay take masd/sites-by-domain — дождаться ответа Вовы,
вернуть ли короткие id сайтов вместо доменов в sites/ и командах.`
   - Agent attached, read relay 1, and put two questions: (1) revert the site
     ids to short ones while keeping the `apps/` → `sites/` move; (2) add a vet
     check that nothing sits loose in `docs/remove-before-merging/`'s root.
2. **Operator**: «да»
   - Agent read it as yes to (1): reverted 08f53ed, renamed `sites/<domain>` →
     `sites/<short>`, repointed paths (7a454bb), updated the plan's slice-2
     entry, PR title/body and squash proposal.
3. **Operator** (mid-turn), quoting question 2: «поясни попроще»
   - Agent explained: an agent writing a draft to the root instead of the
     branch's subfolder leaves a file `/finalize` never sweeps, so it reaches
     `main`; the check fails vet on any file in that root, ~10 lines. Asked
     whether to add it — **unanswered**.

## Intent

Slice 2 of MASD: routers out of `apps/` so "app" means only a `src/` app, with
short site ids everywhere they are typed.

## Decisions

- **Short site ids** (`vova`, `lsa`, `bible`, `basilisk`) for `sites/<id>/`,
  `SITE_IDS`, `NEXT_PUBLIC_SITE`, pnpm entries, squash scope, deploy picker,
  `preview.yml`; each domain once, in the site config's `url`. Beat
  domain-as-id because every command had to spell out the domain.
- Deploy gate, secret-name derivation (`ascii_upcase + "_PAGES_DEPLOY_KEY"`)
  and `publish-site.sh`'s id→repository map are back to the base's own code;
  the short→domain map of relay 1 is gone with the domain ids.
- `sites/site-next-config.ts` keeps its `siteDir` naming.
- Branch name `masd/sites-by-domain` is now a misnomer, kept because renaming a
  PR's head closes the PR.

## Errors and dead ends

- `git checkout --theirs` on whole conflicted files during the revert also
  undid later commits (squash-message's working-dir logic, scripts' `sites/`
  paths, content.md wording); caught before commit and restored from HEAD, then
  re-applied the domain→short substitutions.

## State

- Branch `masd/sites-by-domain`, draft PR #178
  https://github.com/vzakharov/vovazakharov.com/pull/178, base
  `claude/multi-app-sliced-design-7bn3oq`, MERGEABLE. Head 2068c63 before this
  summary. No CI runs on PRs.
- Plan: `docs/plans/multi-app-sliced-design.paused.md`.
- Squash draft: `docs/remove-before-merging/masd/sites-by-domain/squash-message.md`,
  mirrored in PR comment #issuecomment-6297948270 (updated).
- Vet: green except the known live-CLAUDE.md `fsd.md` citation.
- `compare/fsd-vs-masd` untouched: `masd.md` did not change.
- Estimate for this session: 3 h senior developer. The vet check, if wanted, is
  the successor's to size.

## Pointers

- `scripts/working-dir.sh`, `scripts/vet.sh` (where a root-loose check would go).
- `src/kernel/shared/config/{site-ids,site-config}.ts`, `.github/workflows/deploy.yml`.
- This session: https://claude.ai/code/session_011wspwkFLepc9BFhLwtpw5D

## Next step

Wait for the operator's answer on question 2 (the vet check for loose files in
`docs/remove-before-merging/`'s root). On yes, add it to `scripts/vet.sh`.
