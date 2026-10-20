# Relay 1 — Multi-App Sliced Design

## 1. Standing constraints

- «давай, пока обсуждаем, ничего не пересобирать, а просто обсуждать» — while
  the operator is discussing, do not rewrite the plan; discuss. (Superseded for
  the plan by the final go-ahead, but it is how this operator wants design
  discussions run.)

## 2. The conversation

1. **Operator** (dictated, condensed from a long voice message): proposes
   "Multi-App Sliced Design". FSD works for one app; this repo has several
   unlike apps in one `src/` (two card sites — vova and Late Stage Agentic, two
   quasi-blogs — Agentic Bible and Basilisk, Music, Mushrooms the game). Music
   and Mushrooms collapse into one `pages/` slice each because
   `insignificant-slice` is computed over the whole repo; music's routing page
   is really music's app layer. Idea: `src/` holds apps, concrete and abstract
   (`kernel` with its own `shared`, an abstract `blog` that Basilisk and Bible
   compose, `basilisk` with its own `entities/case`), imports only up the
   composition and only to lower ranks («мы не можем, например, из Basilisk
   Entities импортировать kernel features»), boundaries maybe generated. The
   one-page-app question (Mushrooms; "Claude Code Web is one page too — we
   would not put it all in one `pages/`") is deferred, maybe past the merge.
   Side question: does the harness say when a message is dictated?
   **Agent**: answered as rung 2; agreed with numbers (mushrooms 241 files,
   music 83); found `shared/content` importing the song schema and basilisk
   frontmatter; proposed the two-axis rule, `apps/`→`sites/`, an
   insignificant-app rule; said the harness does not flag dictation.
2. **Operator**: «так, ну мы же сейчас как-то без этого обходимся?» (same-layer
   cross-app import); can App Router live under `sites/`, named by full domain;
   wants the allow-config as a plain object (YAML tree); switch-theme and
   site-footer go to an abstract app between kernel and the ordinary ones, not
   kernel, because mushrooms does not use them. Then asks to weigh composition
   against an app-level single index (`from 'kernel'`).
   **Agent**: strict rule (strictly lower layer across apps); Next does not
   care about the parent dir name; recommended composition over a single index
   (path-based checkers lose the layer axis; `server-only` barrels).
3. **Operator**: should mushrooms render under the site layout?; name the
   between-app; phrase composition as «если вы наследники blog, то вы и сами
   blog»; side questions: is MASD a superset of FSD, was dropping "F" right,
   are we reinventing the wheel. **Agent**: found `dusk-view.ts` reading
   `data-mantine-color-scheme`; proposed `shell`; superset yes; prior art Nx
   tags, Nuxt Layers.
4. **Operator**: the toggle is visible a split second, «короче, убираем»;
   `shell` for now (also floated `website`, and something for "house style");
   likes the name MASD for pitching. **Agent**: explained a kept meadow wins
   over the scheme; offered `house`/`livery`.
5. **Operator**: «вообще не надо никаких "начальных сумерек"… ЦА игры, мягко
   скажем, другая», «сумерки или день — это игровая механика, а не вопрос
   преференции», «shell норм»; asked for an md capturing the one-page-app
   problem to start a later PR; «ну а так — давай делать слона». **Agent**:
   routed `/task` → plan, renamed the branch, ran the Steiger spike, wrote the
   draft plan, opened PR #169.
6. **Operator**: «начинаем всегда с дня»; asked to explain the site node;
   «1 — соответственно ещё обсуждаем, 234 — как рекомендовано». (2 = JSON
   graph file, 3 = the one-page-app write-up lives in child issue 5's body, 4 =
   `feat:` PR type with no scope.)
7. **Operator**: why not import all neighbours from the router? (`/plainly`);
   then «Приведи мне пример импортов которые не будут работать между vova и
   music». **Agent**: router can; showed the three sideways imports.
8. **Operator**: «ты как будто ищешь как решить симптом, а не проблему. а
   проблема — отсутствие множественной наследственности.» **Agent**: agreed;
   proposed a parents graph.
9. **Operator**: vova uses "something musical", not all of music — naming it
   is the subject of `writing/late-stage-agentic/ideas/rules-that-make-you-name-things.md`
   (branch `claude/no-pick-omit-ikbd3v`); «vovazakharov.com это просто домен и
   ап рутер, который говорит на каком урле что показывать. "Состит" — vova»;
   does not want a ban on same-named slices in different apps.
10. **Operator**: #82 (site-wide player) is distant future, maybe never;
    «MUSIC_ROUTE это возможно даже просто дело kernel-а»; still allow multiple
    inheritance, «"вот это у меня и блог и игра" — возможно когда-то рабочий
    вариант». **Agent**: confirmed vova takes only two addresses from music.
11. **Operator**: proposed the flat parents list; «нужно убедиться что ничто из
    того что написано выше не может композиться из того что написано ниже»;
    «собственно так и acyclic graph решается».
12. **Operator**: «окей, давай переписывай и сразу приступай (наверное в новой
    сессии). пасибо!» **Agent**: rewrote the plan, synced PR body and squash
    comment, relayed.

## 3. Intent

Land MASD's core on `main` as slice 1 of five, then the rest as separate PRs.
Ruled out: an app-level single index; per-site composition nodes; a ban on
same-named slices across apps; any colour-scheme influence on the game; the
`jukebox` abstract app (no need until #82).

## 4. Decisions

- **Composition, not dependency** — "an app that extends blog is blog". Beat:
  a single app-level index (loses the layer axis for path-based checkers;
  cannot hold the `server-only`/`node-safe` split).
- **Strict layer rule across apps** — same app or ancestor, strictly lower
  layer. Same-layer cross-app is sideways.
- **Parents graph, flat, parent above child = acyclicity.** Beat: nested
  tree (cannot express several parents), YAML anchors (alias values, not keys),
  nested arrays (meaning hangs on first mention).
- **Multiple parents allowed, unused today** — test on invented graphs.
- **Routers only route**, sitemap included. Beat: `src/sites/<domain>/`
  composition nodes — they treated a symptom; vova needs only addresses.
- **Addresses are kernel's** (`MUSIC_ROUTE` joins `COLLECTIONS`); the schema
  registry inverts, the address registry stays.
- **`shell`** — the abstract app with switch-theme, site-footer, ThemeCorner.
  Name provisional.
- **Mushrooms**: own root layout via route groups, no theme toggle, fresh
  meadow always opens at `FULL_DAY`.
- **JSON** for `src/masd.json` (no new dependency).
- **PR type** `feat:` with no scope, so the merge redeploys all four sites.
- **One-page-app problem** → the body of child issue 5, not a committed md.
- Terms: **MASD** (Multi-App Sliced Design); **insignificant app** (exactly
  one child, nothing of its own mounted); **kernel / shell / blog**.

## 5. Errors and dead ends

- The first Steiger spike ran under `tmp/` and reported nothing: Steiger
  skips gitignored paths. Spike in the scratchpad, run from the repo root.
- Deleting the old remote branch `claude/stoic-ritchie-7bn3oq` was refused
  (proxy 403); it lingers, no PR on it.
- The agent proposed site composition nodes and then a `jukebox` app; the
  operator called the first a symptom fix and the second premature.

## 6. State

- Branch `claude/multi-app-sliced-design-7bn3oq`, head `4c5f2b5` pushed.
- PR https://github.com/vzakharov/vovazakharov.com/pull/169 — draft, base
  `main`, title `feat: Multi-App Sliced Design — src/ as apps composed along a
graph`. Squash comment synced
  (`docs/remove-before-merging/squash-message.md`). Body has `Closes #<tbd>`.
- Plan `docs/plans/multi-app-sliced-design.draft.do-not-implement.md`, carrying
  the go-ahead below.
- Issues not filed yet: the parent and five children are filed by `/go` Step 1
  per `.claude/skills/plan/carving.md`.
- Estimate: this session 6 h senior architect. Remainder handed on:
  `--part 16 senior developer "Moving ~400 files across a new graph while
inverting the schema registry, splitting root layouts under static export and
writing a cross-app significance check is senior work: each step can break all
four builds."`

## 7. Pointers

- The plan — the whole design and slice 1's steps.
- `.claude/rules/fsd.md` — the conventions being replaced.
- `eslint.config.ts` lines 60–187 — the boundaries config to extend.
- `steiger.config.mjs`, `node_modules/@feature-sliced/steiger-plugin/dist/index.js`
  ~line 580 — `insignificant-slice` and why per-root runs miscount.
- `src/shared/content/collection-schemas.ts`, `documents.ts:301` — the
  registry to invert; `src/app/lib/sitemap.ts` — imports `pages/cv` and
  `pages/music`, moves to the routers.
- `src/pages/not-found/ui/not-found-page.tsx` — the only music use in vova
  beyond `MUSIC_ROUTE` on the home page: two addresses.
- `src/pages/mushrooms/ui/scene/dusk-view.ts:184`, `meadow-scene.ts:143`,
  `meadow-opening.ts:26` — the scheme read to drop.
- Predecessor transcript: https://claude.ai/code/session_01PsxS6oCuC2yVr6e8eSZAZe

## 8. Next step

`go` — the go-ahead for the draft plan, in the operator's words: «окей, давай
переписывай и сразу приступай (наверное в новой сессии). пасибо!»
