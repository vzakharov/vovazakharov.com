# Relay 1 — masd/sites-by-domain (slice 2 of MASD), open question on short site ids

This is the first relay on the bite branch. The elephant's own relays 1–8 live in
`docs/remove-before-merging/multi-app-sliced-design-7bn3oq/` (moved there in
this session); relay-8 there is what this session started from.

## Standing constraints

None beyond the repo's rules. The muthur sync offer was made in an earlier
session; do not make it again.

The operator: «мы на этом пиаре тестируем и потом, _если_ понравится переносим в
базу» — loop-infrastructure changes are tried here first, never pushed to
vzakharov/muthur from this work.

## The conversation

1. **Operator** (relay 8's handoff): `/relay take claude/multi-app-sliced-design-7bn3oq — start slice 2 of MASD (sites named by domain) as its own bite with go, on a new branch and PR based on the elephant's branch.`
   - Agent made `masd/sites-by-domain` off the elephant's branch, wrote the bite
     into the plan, `git mv apps/<id>` → `sites/<domain>/`, repointed paths,
     made the domain the site id everywhere (SITE*IDS, NEXT_PUBLIC_SITE,
     SITE_CONFIGS keys, collections' `site`, package.json `build:<domain>`
     etc.), derived `url` from the id, rewrote the deploy gate (secret names
     spelled outright: LSA*/BIBLE\_/BASILISK_PAGES_DEPLOY_KEY), built all four
     sites, vet clean but for the known `fsd.md` citation, followed `masd.md`
     onto `compare/fsd-vs-masd` (c833c96), polished in a subagent, paused the
     plan, opened draft PR #178 against the elephant's branch. Squash proposal
     posted by hand because `squash-message.md` was the elephant's.
2. **Operator**: «не понял, зачем/почему?» (about squash scopes becoming
   domains). Agent: the gate matched scopes against site ids, which became
   domains; offered both / short only / domains only.
3. **Operator**: «у нас не так много символов в названии позволено чтобы
   тратить их на полные домены, можно же сделать соответстие коротких имён
   доменам?» — Agent added a short→domain map in the gate, restored short
   scopes in docs (24b36b2).
4. **Operator**: «не надо» (to a domain also working in a scope) — gate and
   manual picker take short names only (24b20b2).
5. **Operator**: «надо придумать как адаптировать скилл (и возможно другие если
   applicable) если такой "мультипиарный" слон у нас станет стандартным. типа
   может совать в подпапки папки remove-before-merging» — Agent proposed
   per-branch subfolders and asked muthur-or-here.
6. **Operator**: «что такое <бит>?» and «нет -- как говорил раньше, мы на этом
   пиаре тестируем и потом, _если_ понравится переносим в базу» — Agent
   explained "bite", implemented on #178 (c74d08c): `scripts/working-dir.sh`,
   squash-message / relay / finalize / elephant.md / tend-prose follow; a
   bite's /finalize skips the staged swap, step 3's sweeps and cost rows, and
   sweeps only its own subfolder; elephant's files moved into its subfolder.
7. **Operator** (screenshot, 544 files): asked whether that is real. Agent: 452
   pure renames, ~80 real edits.
8. **Operator**: asked whether the subfolder name is programmatic. Agent: yes,
   via the script; risks: hand-written paths, branch renames. Offered a vet
   check for stray root files — **unanswered**.
9. **Operator** (screenshot of tend-prose diff): «что ли обычный вариант, без
   подпапки <branch>, уходит насовсем?» — Agent: yes, every branch uses a
   subfolder; offered all-branches vs bites-only.
10. **Operator**: «может и пусть будет у всех. а как будет вести себя всё это в
    случае конфликта…?» — Agent: same last segment on ancestor branches
    silently collides; proposed full branch name.
11. **Operator**: «> claude/pleiada-koperin-call-2wmkkj / значит переносить, а
    может ипросто автоматом / на полное имя -- да, за исключением префикса
    `claude/`, который автоматически всегда даётся» — Agent: working-dir.sh
    uses the full name less `claude/`; `/branch-rename` moves the folder
    automatically (5d1d689). The quoted branch name was not explained by the
    operator; the agent read it as an example of a renamed auto-branch.
12. **Operator** (mid-turn, at the context pause): «а ещё, ты меня убьёшь, но
    что-то мне не нравится переименование подпапок `sites/` в полные названия
    сайтов, как-то прям многоэтажно получается когда при любом пуке нужно
    упоминать `vovazakharov.com` полностью. что думаешь?» — answered in the
    relay report (below), not yet acted on.

## Intent

Eat MASD bite by bite; this bite is slice 2. The operator now doubts the domain
names in `sites/` and in every command, and is testing per-branch working
folders on this PR before any muthur port.

## Decisions

- **Bite** = a slice of the elephant as its own PR whose base is the elephant's
  branch (`claude/multi-app-sliced-design-7bn3oq`, #169).
- Squash scopes name a site by its **short** name (`vova`, `lsa`, `bible`,
  `basilisk`); the gate maps to domains; domains in a scope are not accepted.
- Every branch keeps squash draft and relays in
  `docs/remove-before-merging/<branch less claude/>/`.
- **Agent's view on Q12** (given in the report): the slice's purpose — routers
  out of `apps/` so the word "app" means only `src/` apps — is met by `sites/`
  alone. Short ids (`sites/vova/`, `pnpm dev:vova`, `NEXT_PUBLIC_SITE=vova`)
  keep commands short; the domain lives once, in the site config's `url` (or
  in a short→domain map). That means reverting most of 08f53ed (the id
  rename) but keeping the `sites/` move, the url derivation idea as a map, the
  gate's explicit secret names, and the working-dir work. Awaiting the
  operator's answer.

## Errors and dead ends

- A python slice of the plan using `s.index("## Rest of the elephant")` hit the
  earlier backticked mention and duplicated text; fixed by matching
  `"\n## Rest of the elephant\n"`.
- YAML parses `on:` as `True` when extracting the gate script for testing.
- Vet's one failure is the live CLAUDE.md citing `fsd.md`, expected until the
  elephant's `/finalize`.

## State

- Branch `masd/sites-by-domain`, draft PR #178
  https://github.com/vzakharov/vovazakharov.com/pull/178, base
  `claude/multi-app-sliced-design-7bn3oq`. Head 5d1d689 before this summary.
- Plan: `docs/plans/multi-app-sliced-design.paused.md` (slice 2 folded in;
  edits there need updating if Q12 changes the ids).
- Squash draft: `docs/remove-before-merging/masd/sites-by-domain/squash-message.md`,
  mirrored in the PR comment #issuecomment-6297948270.
- `compare/fsd-vs-masd` at c833c96, current with `masd.md`.
- Estimate for this session: 8 h senior developer + 1 h middle qa (slice 2,
  per-branch working folders). Any id revert is the successor's to size.

## Pointers

- `scripts/working-dir.sh`, `.claude/skills/finalize/SKILL.md` (bite rules in
  the swap paragraph, step 3, step 6 sweep), `.claude/skills/branch-rename/SKILL.md`
  § "The working directory moves with the branch".
- `.github/workflows/deploy.yml` gate, `scripts/publish-site.sh`,
  `src/kernel/shared/config/{site-ids,site-config}.ts`, `scripts/in-site.sh`.
- This session: https://claude.ai/code/session_01SAnhHoejqRs4UoE55PNWtU

## Next step

Wait for the operator's answer to Q12 («что думаешь?» on full domain names in
`sites/` and commands). If they agree to short ids, revert the id half of
08f53ed on this branch (short `SITE_IDS`, `sites/<short>/`, short package.json
entries, `in-site.sh`, gate/preview/publish-site follow, a short→domain map for
`url` and receivers), update the plan's slice-2 entry and the PR body, and
follow `masd.md` onto `compare/fsd-vs-masd`. Also still open: whether to add a
vet check that nothing sits loose in `docs/remove-before-merging/`'s root.
