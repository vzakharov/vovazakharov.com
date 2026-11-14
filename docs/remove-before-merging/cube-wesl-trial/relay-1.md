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
6. _(After the park, the operator came back through the review board.)_ **Board comments** (all sent to Claude, all replied to in their threads on https://claude.ai/artifact/PSHRvqMjUtVGe8v3UcN5gU):
   - on `scripts/masd-clusters.ts`: «а то если расширить и сделать любое `.\w+.` исключающим? тогда и тесты и шейдеры подпадут. но подумай хорошенько» — Agent: tried it, same verdict (0 clusters); tests are already out via `isTest`, barrels' hyphenated suffixes don't match; argued to keep it narrow and proposed folding by the "Generated from … by `pnpm shaders:codegen`" header instead of a suffix. **Asked "Делать?" — awaiting answer.**
   - on `12-bathroom.wgsl`: «почему-то нет подсветки кода у нас» / «на борде имею в виду» — Agent: added a WGSL/WESL highlight.js grammar to the board (d6ce7c09), rebuilt and republished.
   - on `12-bathroom.wgsl`: «и какой-то форматтер надо поставить и линтер, если такие в природе существуют» — Agent: found prettier-plugin-wgsl 0.1.14; trying it was denied by auto mode; no real WGSL linter on npm (naga, Tint via `pnpm shaders:cube`, wgsl-analyzer validate). Proposed: formatter after checking it on WESL imports; no linter.
   - on `light.wgsl` R34: «не сейчас, но на подумать: не требовать ли чтобы все численные значения задавались константами?» — Agent: name a number when it repeats, derives from another or is a unit (12.0 / 43200u / 48u there); not salts or art knobs; no lint rule.
7. **Operator:** «эй эй мэйт», quoting the agent's line that the denied formatter run was not checked — Agent: admitted it owed a permission line at the denial (CLAUDE.md § "Key principles") and gave it (below).
8. **Operator:** «то есть по твоему легче самому написать форматтер чем дать мне строку для разрешения?» — Agent: no formatter was written; the board's syntax highlighting answered a separate comment; the permission line is in chat.
9. **Board, `46-micrograph.wgsl`:** «тайпгенить необходимые константы и импортить?» / «тьфу, кодгенить» — Agent: the mechanism exists (a TS piece imported from `.wgsl`, as CORE); asked whether to do AIR now. **Operator: «ага»** — Agent: `laboratory/config/micrograph-air.ts` (`MICROGRAPH_AIR`, `MICROGRAPH_AIR_WGSL`); the linker maps `_` in a WESL path to the kebab-case file's `-` (9c2b6b71).
10. **Board, `shaders-pin.test.ts`:** «тока это надо удалить после того как все перенесём и убедимся» — Agent: agreed, noted in #275's todo § 0 (527efc58).
11. **Board, `light.wgsl` R34:** questioned the three naming criteria («разные вещи с одним значением?», «выводится из другого — это как?», «как проверять?») — Agent: they are one rule, "name it when changing it means changing something else", a review call no checker makes. Then «а сколько … соотношение» — Agent: ~3–5 % of 686 literals in the 11 moved files. Then **«нет, давай уже править как предложил. а подход тогда в привязанных к .wgsl .rules-ах написать»** — Agent: `TICK_RATE`/`HOUR_TICKS`/`SPELL_TICKS` in `light.wgsl`, `HEX_ROW` in `honeycomb.wgsl` (imported by the bathroom), `kit/lib/math.wgsl` with `PI`; rule `.claude/rules/wgsl.md` scoped to `**/*.wgsl` (7f96e47f).
12. **Board, `12-bathroom.wgsl` (formatter):** «какие-то пляски с бубнами. а для wesl ничего нет?» — Agent: no WESL formatter exists on npm; found wgsl-linter 0.5.0; the operator authorized a trial run; it mangles `::` in imports, never wraps lines, and its lint flags every imported name. **Operator: «ок пусть будет только prettier»**, then in chat **«а, про форматтер в divergence.md (с muthur) записать надо»** — Agent: `scripts/prettier-wesl.ts`, a local Prettier plugin over prettier-plugin-wgsl that keeps the import head as written; all `.wgsl` formatted; divergence.md records it (130b3825).

## Intent

Вова wants to judge whether moving all ~80 cube shader files from TS strings to `.wgsl` + WESL imports is worth it, with proof the picture does not change. He reviews on GitHub (the review board crashes on his phone). TypeGPU was already rejected (see `docs/remove-before-merging/cube-review-perf/todo.md` § 0).

## Decisions

- **Own linker, not wesl-js 0.7.31**: wesl-js `link()` reorders (imports after root), reprints (`fn helper2() {}` → `fn helper2() { }`), drops unreachable functions, and cannot coexist with pieces still written as TS strings — the byte pin would be impossible.
- **Generated `<stem>.shader.ts` committed beside each `.wgsl`**, one `wgsl(...)` call over the existing `assemble()`; codegen exits 1 when it wrote (like `styles:codegen`), deletes orphans, writes nothing on errors. Five-percent alternative 3 (gitignore and generate pre-build) is open for the operator.
- **Export names**: UPPER_SNAKE of the stem; a numbered floor file gets `_SHADER` (`BATHROOM_SHADER`) to dodge `vova/no-export-namesake`. `home.wgsl` was renamed `dwelling.wgsl`/`DWELLING` because `HOME` collides with floor 66.
- **CORE stays TS** (`kit/lib/core.ts`): it interpolates constants; `.wgsl` files import it, the linker loading the TS piece dynamically to read its declarations.
- **`masd:clusters` gate change**: `foldTwins` in `scripts/masd-clusters.ts` folds a generated `x.shader.ts` with a sibling `x.ts` into that file. Alternative: a `// masd-disable cluster` marker per floor, needing the operator's yes. Flagged to the operator as a call to overrule; no answer yet.
- **Micrograph's air** lives in the TS piece `micrograph-air.ts`, read by the theme and imported by the shader as `AIR`.
- **The pin test compares tokens, not bytes**: layout belongs to Prettier, so `tokens()` drops whitespace, trailing commas and a struct's `};`. The `BEFORE` hashes were retaken from f763b784 (the commit before the move) under that normalization. Every named difference (kit moves, AIR, named numbers) is undone by text first. It is scaffolding, to be deleted once all files have moved.
- **Type-overlap fixes**: `Named = WithFile & kernel Named & {module}`, `Declaring` in `module.ts`, `Entered` in `placement.ts`, `Module.body` renamed `shipped` (collided with blog's `ProseSource.body`).

## Errors and dead ends

- Bash hook blocks `cat`/`sed`/`git pull`: use Read/Write, `git fetch` + `merge --ff-only`.
- knip failed on an exported-but-unused `Entry` type → made private.
- The review-board collector reads the focus file from HEAD: commit before building. It falls back to `main` as base when the branch has no PR.

## State

- Branch `claude/cube-wesl-trial`, pushed; head `130b3825 chore: format .wgsl with Prettier through a WESL-aware plugin` (plus this summary's commit). Vet not yet re-run since 7de078cb.
- PR #276, draft, base `claude/cube-review-perf` (head of #275): https://github.com/vzakharov/vovazakharov.com/pull/276 — squash proposal posted as a comment, tracked at `docs/remove-before-merging/cube-wesl-trial/squash-message.md`; the review board's sticky comment posted on it.
- `docs/remove-before-merging/review-focus.json` now holds trial items only (the collector refuses files unchanged against the PR base); #275's own items (`reflection.ts`, `reflection-shader.ts`, `core.ts`) are gone from it on this branch — the parent restores them when it merges #276.
- `.claude/artifacts/vet.sh`'s prettier step calls `../../scripts/prettier.sh`, which does not exist; pre-existing, not touched.
- Last `./scripts/vet.sh`: green on the commit before the squash-file commit. `pnpm shaders:cube`: 66 of 66 compile.
- No PR subscription, no scheduled check-ins. Keepalive watcher has exited.
- Five-percent review not posted on the PR: it ran before #276 existed and lives only in this container's `tmp/five-percent.md` (gone in a new container); its three points are in Last agent turn.
- Estimate unchanged: the whole job was done here (10 h senior graphics-programmer + 2 h senior architect).

### Watches

https://claude.ai/artifact/PSHRvqMjUtVGe8v3UcN5gU

(The review board, rebuilt against #276's base and republished as version 2; its watch was stopped at the park and not restarted, but comments sent to Claude from it still reached this session.)

## Pointers

- Linker: `scripts/lib/wesl/{module,placement,checks,link,render}.ts`, entry `scripts/shaders-codegen.ts`, tests `scripts/shaders-codegen.test.ts`.
- Pin test: `src/cube/entities/theme/shaders-pin.test.ts`.
- Moved files: `src/cube/entities/theme/kit/lib/*.wgsl`, `dwelling/lib/dwelling.wgsl`, `laboratory/lib/specimen.wgsl`, `dwelling/config/12-bathroom.wgsl`, `laboratory/config/46-micrograph.wgsl`.
- `wesl.toml` at the root (editor: wgsl-analyzer VS Code extension).
- #275's todo: `docs/remove-before-merging/cube-review-perf/todo.md`.
- Parent session now: session_01DaohkFooQx3YpuSjFHqR59.
- This session's transcript: https://claude.ai/code/session_01DaohkFq25hfQsRjURtiG1H

## Next step

Run `./scripts/vet.sh` on the pushed head, then wait for the operator. Open:

- the twin fold in `masd-clusters.ts`: the operator rejected folding by the generated header («не, это хуже»), so the `.shader.ts` suffix stays; the agent asked whether he wanted the wide `\.\w+\.` fold instead — open (board thread on `masd-clusters.ts`);
- review of #276; the `masd:clusters` fold vs markers; the three five-percent alternatives (pin test lifetime, MASD checked twice, committed generated files).

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
