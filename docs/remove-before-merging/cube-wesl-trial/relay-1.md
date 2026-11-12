# Relay 1 — WESL trial (parked)

## Standing constraints

From the parent session's brief, which opened this session (as delivered, binding):

- "Commit and push only there, under that name, do not rename it." (branch `claude/cube-wesl-trial`)
- "MASD, the linters and the 400-line limit are not dodged: no re-export or line-squeezing to pass a gate, no lint suppression without the operator's yes."
- "`git pull` is blocked by a hook: fetch, then `merge --ff-only`. Never force-push."
- "A new dependency or build step is a toolchain change: CLAUDE.md § "Vetting" names its four sites. Report what the operator must add to the environment setup script."
- "`./scripts/vet.sh` green before the report."
- The brief also said "No PR of its own: skip /polish and /pr" — the operator later overrode this (see below): a PR now exists, polish ran.

## The conversation

1. **Parent session's brief** (session_01DaohkCiN9dqvTbQitKLW6y, delivered as the opening message, not an operator turn): trial the "No plan" route of moving cube shaders out of TS strings into `.wgsl` files with WESL `import`s, linked by a codegen script (no bundler plugin, no browser runtime), on floors 12 and 46 and every piece they reach; shared hexagonal lattice and `luma` into the kit; shader imports held to `.claude/rules/masd.md`, enforced in the linker via `eslint/masd-graph.ts`; byte-for-byte pin of the linked source; `pnpm shaders:cube` for every floor; report in Russian to Вова and via `send_message` to the parent, covering verdict, one moved file, what the MASD check catches/misses, the byte comparison, and which editor extension to use.
   - Agent: did all of it (see State), vet green, sent the report to the parent and in chat. Verdict: yes, move all 80 files, with our own linker rather than wesl-js.
2. **Parent's forward** (cross-session message): the parent relayed; send the report to session_01DaohkFooQx3YpuSjFHqR59 instead.
   - Agent: re-sent the same report there; told Вова the first copy went to the old parent before the forward was read.
3. **Operator:** «Сделаешь ревью борду?»
   - Agent: built and published a review board (no PR existed, so it diffs against `main` and includes #275's changes); rewrote `docs/remove-before-merging/review-focus.json` for the trial, carrying #275's still-valid items (dropped `reflection-shader.ts`, unchanged vs `main` so the collector refuses it — the item was already broken on #275; dropped the `core.ts` duplicate-hexagon item, resolved). No sticky comment since there was no PR.
4. **Operator:** «Сделай PR. Тут падает ревью борда на телефоне, буду смотреть через гх. Только Полиш прогони если ещё нет»
   - Agent: ran `/polish` in a subagent (scoped against `origin/claude/cube-review-perf`).
5. **Operator (mid-turn):** «Пиар из родителя, не мейна»
   - Agent: confirmed the PR targets `claude/cube-review-perf`. After polish, removed a `/* eslint-disable no-console */` it had added in `scripts/shaders-codegen.ts` without the operator's yes (now writes via `process.stderr`), updated #275's todo paths, vet green, opened draft PR #276 into `claude/cube-review-perf`, posted the squash proposal. Relayed polish's three five-percent alternatives (verbatim in Last agent turn).

## Intent

Вова wants to judge whether moving all ~80 cube shader files from TS strings to `.wgsl` + WESL imports is worth it, with proof the picture does not change. He reviews on GitHub (the review board crashes on his phone). TypeGPU was already rejected (see `docs/remove-before-merging/cube-review-perf/todo.md` § 0).

## Decisions

- **Own linker, not wesl-js 0.7.31**: wesl-js `link()` reorders (imports after root), reprints (`fn helper2() {}` → `fn helper2() { }`), drops unreachable functions, and cannot coexist with pieces still written as TS strings — the byte pin would be impossible.
- **Generated `<stem>.shader.ts` committed beside each `.wgsl`**, one `wgsl(...)` call over the existing `assemble()`; codegen exits 1 when it wrote (like `styles:codegen`), deletes orphans, writes nothing on errors. Five-percent alternative 3 (gitignore and generate pre-build) is open for the operator.
- **Export names**: UPPER_SNAKE of the stem; a numbered floor file gets `_SHADER` (`BATHROOM_SHADER`) to dodge `vova/no-export-namesake`. `home.wgsl` was renamed `dwelling.wgsl`/`DWELLING` because `HOME` collides with floor 66.
- **CORE stays TS** (`kit/lib/core.ts`): it interpolates constants; `.wgsl` files import it, the linker loading the TS piece dynamically to read its declarations.
- **`masd:clusters` gate change**: `foldTwins` in `scripts/masd-clusters.ts` folds a generated `x.shader.ts` with a sibling `x.ts` into that file. Alternative: a `// masd-disable cluster` marker per floor, needing the operator's yes. Flagged to the operator as a call to overrule; no answer yet.
- **Micrograph's `${vec3f(AIR)}`** became the literal `vec3f(0.0015, 0.0015, 0.0015)` — duplicates the TS constant; reported as a drift risk.
- **Type-overlap fixes**: `Named = WithFile & kernel Named & {module}`, `Declaring` in `module.ts`, `Entered` in `placement.ts`, `Module.body` renamed `shipped` (collided with blog's `ProseSource.body`).

## Errors and dead ends

- Bash hook blocks `cat`/`sed`/`git pull`: use Read/Write, `git fetch` + `merge --ff-only`.
- knip failed on an exported-but-unused `Entry` type → made private.
- The review-board collector reads the focus file from HEAD: commit before building. It falls back to `main` as base when the branch has no PR.

## State

- Branch `claude/cube-wesl-trial`, clean, pushed; head `49a4c787 docs: add squash proposal for pr #276` (plus this relay commit).
- PR #276, draft, base `claude/cube-review-perf` (head of #275): https://github.com/vzakharov/vovazakharov.com/pull/276 — squash proposal posted as a comment, tracked at `docs/remove-before-merging/cube-wesl-trial/squash-message.md`.
- Last `./scripts/vet.sh`: green on the commit before the squash-file commit. `pnpm shaders:cube`: 66 of 66 compile.
- No PR subscription, no scheduled check-ins. Keepalive watcher has exited.
- Five-percent review not posted on the PR: it ran before #276 existed and lives only in this container's `tmp/five-percent.md` (gone in a new container); its three points are in Last agent turn.
- Estimate unchanged: the whole job was done here (10 h senior graphics-programmer + 2 h senior architect).

### Watches

https://claude.ai/artifact/PSHRvqMjUtVGe8v3UcN5gU

(The review board, built against `main` with no PR; stopped. Not rebuilt for #276 since the operator reviews on GitHub.)

## Pointers

- Linker: `scripts/lib/wesl/{module,placement,checks,link,render}.ts`, entry `scripts/shaders-codegen.ts`, tests `scripts/shaders-codegen.test.ts`.
- Pin test: `src/cube/entities/theme/shaders-pin.test.ts`.
- Moved files: `src/cube/entities/theme/kit/lib/*.wgsl`, `dwelling/lib/dwelling.wgsl`, `laboratory/lib/specimen.wgsl`, `dwelling/config/12-bathroom.wgsl`, `laboratory/config/46-micrograph.wgsl`.
- `wesl.toml` at the root (editor: wgsl-analyzer VS Code extension).
- #275's todo: `docs/remove-before-merging/cube-review-perf/todo.md`.
- Parent session now: session_01DaohkFooQx3YpuSjFHqR59.
- This session's transcript: https://claude.ai/code/session_01DaohkFq25hfQsRjURtiG1H

## Next step

Wait for the operator. Open for him: review of #276 on GitHub; whether to keep the `masd:clusters` fold or use markers; the three five-percent alternatives (pin test lifetime, MASD checked twice, committed generated files).

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Полиш закончился. В `shaders-codegen.ts` нашлось моё `eslint-disable` без твоего «да». Убираю его: вывод пойдёт через `process.stdout`/`process.stderr`, подавление не понадобится.

Now fix the stale paths in #275's todo, then commit, push, vet, PR.

Vet is green. Now the PR, into `claude/cube-review-perf`.

Step 6: the squash proposal.

PR открыт, предложение для squash опубликовано, доску к PR не привязываю. Отчитываюсь.

https://github.com/vzakharov/vovazakharov.com/pull/276

Вова, открыл черновой PR в `claude/cube-review-perf` (ветка #275), не в `main`. Заголовок: `feat(cube): link floors 12 and 46 from .wgsl files with WESL imports`. Предложенный текст для squash висит комментарием на PR. После полиша vet зелёный.

**Что сделал полиш:**
- **`/dry`:** `render.ts` теперь получает имя `.shader.ts` из уже готовой функции `generatedOf`. pin-тест берёт китовский тип `Wgsl`, а не повторяет его руками трижды.
- **`/tend-prose`:** поправил шапку `shaders-codegen.ts`. Там было «байт в байт», а код срезает голову файла и обрезает пробелы по краям. Ещё убрал вводный комментарий из `honeycomb.wgsl`: он называл двух пользователей решётки, хотя их четыре.
- **Мой промах, исправлен:** в `shaders-codegen.ts` стояло `eslint-disable no-console`, а твоего «да» на него не было. Теперь скрипт пишет в stderr через `process.stderr`, подавление убрано.
- **Заодно:** в todo из #275 обновил пути на переименованные файлы. Пункт про двойной шестиугольник заменил пунктом про оставшуюся копию `luma` в edge.

**Три альтернативы от `/five-percent`, все необязательные.** Полиш шёл, пока PR ещё не было, поэтому ревью на PR нет. Оно лежит файлом `tmp/five-percent.md`.
1. **pin-тест останется навсегда.** После мерджа любая правка шейдера уронит его, и придётся вслепую обновлять хэши. Можно убрать его, когда переезд закончится.
2. **Правила MASD проверяются дважды.** Часть того, что проверяет линкер, уже ловят boundaries, tsc и `check:cycles` на сгенерированном `.shader.ts`. Цена упрощения: ошибка всплывёт в сгенерированном файле, а не в `.wgsl`.
3. **Сгенерированные `.shader.ts` лежат в репозитории.** Когда переедут все этажи, это около 10,5 тыс. строк дублей, и каждая правка шейдера будет видна в диффе дважды. Можно не коммитить их, а генерировать перед build, test и dev, но тогда этот шаг надо вписать везде, где запускается код.

На PR доски нет. Старая доска, которую я публиковал раньше, сравнивает с `main`, а не с базой PR. Раз смотришь через GitHub, я её не пересобирал.
```
