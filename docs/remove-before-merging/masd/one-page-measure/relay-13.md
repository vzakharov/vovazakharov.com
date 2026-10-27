# Relay 13 — masd/one-page-measure

## Standing constraints

None stated in this session beyond the repository's own rules.

## The conversation

1. **Operator:** `/from-branch masd/one-page-measure`, with a screenshot of
   relay 12's last reply. That reply asked two questions: (1) which other
   namesakes are intentional, since `vova/no-export-namesake`'s exemption list
   holds only `messages`; (2) whether to replace the in-place repo-root
   computations with `src/kernel/scripts/lib/repo-root.ts` in
   `play-mushrooms.ts`, and in `generate-styles.ts` and `check-mantine-styles.ts`
   by a relative `.ts` import, because bare Node runs those two and follows no
   `@/`. It proposed leaving `scripts/lint-fsd.ts` alone.
   - Mid-turn the operator added: «запускает голый Node, а он не понимает @/ (без
     tsx в нём не работают алиасы путей). так пусть запускает tsx»
   - **Agent:** attached to the branch and moved both style scripts to tsx with
     `REPO_ROOT` imported by alias; `play-mushrooms.ts` now imports `REPO_ROOT`
     too (c75eea84). It asked again about namesakes, and asked whether the other
     bare-Node entries should move to tsx too.
2. **Operator:** «про тёзок хз, а про messages я ответил в треде. на tsx
   переводить по мере того как нужны будут алиасы; можно сделать линтерное
   правило (кажется даже мы уже делали) про это»
   - **Agent:** misread it and added `vova/no-alias-under-bare-node`, which
     flagged a `@/` value import in a bare-Node file (87e30682). It also replied
     on the `messages` thread
     (https://github.com/vzakharov/vovazakharov.com/pull/216#discussion_r4388394708):
     the apps hold one `messages` each, except `maya`, which has two (`pages/home/i18n`
     and `pages/whisper/i18n`). Without the exemption the rule flags that pair,
     and renaming them would break `i18n.md`'s convention, so the reply
     recommended keeping the exemption.
3. **Operator:** «> 'vova/no-alias-under-bare-node', // … чё-то ты не то сделал.
   что bare Node не может бы и без линтера ловили; речь была, наоборот, о том,
   что как только bare Node файлу требуется что-то, что лежит за семью
   двуточиями (образно выражаясь), мы переводим его на tsx и алиас»
   - **Agent:** reverted the rule and removed `no-relative-escape`'s bare-Node
     exemption. It moved the eight entries that reached across to tsx, aliased
     their 32 imports, added `runTsxScript` for their tests, and rewrote the
     stale bare-Node headers (25698055). (verbatim in Last agent turn)

## Intent

The operator wants every relative import that leaves its home (slice,
segmented layer or app `scripts/`) to be an error with no exemption. A script
bare Node runs stays on bare Node until it needs something past its home, and
then its entry moves to tsx and it uses the alias. The operator ruled out a
lint rule for alias imports under bare Node, because a run would catch those
anyway.

## Decisions

- **Exemption removed rather than a new rule.** The operator's correction. The
  rejected alternative was 87e30682's `no-alias-under-bare-node`.
- **Only the eight entries that reached across moved to tsx.** That is "по мере
  того как нужны будут алиасы". The remaining bare-Node entries are
  `check:i18n-payload`, `lint:fsd`, `check:masd`, `random-words` and
  `whisper-lexicon`. Their `.ts` extensions on in-home relative imports stay.
- **`runTsxScript` lives in `src/kernel/scripts/lib/tsx-script.ts`.** It is a
  production module, not a `*.test-kit.ts`, because a kit may be imported only
  by its own slice's tests and the callers are in blog and music. It passes
  `--tsconfig` explicitly, because the tests' cwd is a temp tree where tsx would
  find no alias.
- **Headers.** Where "bare Node runs this" was the stated reason, it became
  "runs outside any bundler", which still justifies no `server-only`. Where the
  reason vanished entirely, the clause was dropped (og-canvas, og-render,
  locales, cv-card, `feedRoutes`' locales argument). The code shaped by those
  reasons (extensions, `feedRoutes` taking locales) was left unchanged.
- **The `messages` exemption stays** pending the operator's answer on the
  thread. The operator said «про тёзок хз»: no other intentional namesakes were
  named.
- `scripts/lint-fsd.ts`'s local root computation is untouched, per relay 12's
  proposal, and the operator did not object.

## Errors and dead ends

- 87e30682 (`no-alias-under-bare-node`) solved the wrong problem; it is reverted
  inside 25698055. Node's type stripping erases only a whole `import type` /
  `export type`, and `import { type X }` survives as `import {}`. This was
  verified on Node 24 and no longer matters.
- Linting by `--stdin` crashes `simple-import-sort` under type-aware lint. To
  check a rule on a real file, edit the file temporarily and revert it.
- The auto-branch delete failed with `stale info`: the auto-branch was never
  pushed.

## State

- Branch `masd/one-page-measure`, PR
  https://github.com/vzakharov/vovazakharov.com/pull/216 (draft, MERGEABLE,
  base `claude/multi-app-sliced-design-7bn3oq`). Last code commit 25698055;
  the head before this relay is 396b7726 (cost row).
- Verified at 25698055: full `lint:check`, `typecheck` and `knip` are green;
  `pnpm test` passed 2708/2708. All eight moved scripts ran under tsx
  (`content:drawings maya --check`, `content:mermaid --check` included).
  `vet.sh` was not run; it is for `/finalize`.
- Nothing running: no PR subscription, no check-in, and the keepalive is stopped.
- Estimate for this session: `--part 4 middle developer "moving eight scripts
to tsx touches their tests' launch, a lint rule's contract and the headers of
twenty modules that state why they are shaped as they are, each needing a
true-or-false call rather than a find-and-replace"`. No remainder handed on.
- The muthur sync offer was made; do not make it again.

## Pointers

- `eslint/rules/no-relative-escape.ts` and its test: the rule with no exemption.
- `src/kernel/scripts/lib/tsx-script.ts`: `runTsxScript`.
- `.claude/rules/masd.md` § "Traps" (`@/` points at `src/`) and
  `.claude/rules/content.md`: where the tsx rule is stated.
- `eslint/rules/no-export-namesake.ts`: `CONVENTIONAL` holds the `messages`
  exemption.
- Thread: `python3 scripts/export-github-item.py 216` for the PR export.
- This session's transcript: https://claude.ai/code/session_01DaohkCtV7EtB46TSW8uFeJ

## Next step

Wait for the operator. The pending items are their answer on the `messages`
thread (keep the exemption, or rename maya's two catalogues and drop it) and
any follow-up on 25698055.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages,
usually unneeded but harmless; the reply proper is usually its last
paragraphs.

```text
Понял: дело не в том, чтобы ловить алиас в bare-Node файле, а в том, чтобы bare-Node файл вообще не получал исключения на дальние относительные импорты. Первое и так видно при падении, а нужно второе: как только такому файлу понадобилось что-то за пределами его слайса, он переезжает на tsx и алиас. Сначала смотрю, сколько таких импортов уже лежит в дереве.

Промахнулся: HEAD оказался автоматическим коммитом стоимости сессии, а не моим правилом. Откатываю этот откат.

Теперь само правило: убираю исключение, `eslint/bare-node.ts` больше не нужен.

Правило правлено. Теперь его тест, комментарий в `vova.ts` и удаление `bare-node.ts`.

Линт и типы чистые. Гоняю тесты, которых касается правка, и сами переведённые скрипты.

Ещё живут под голым Node десять файлов, а упоминаний «bare Node» около двадцати. Прохожу каждое.

Линт, типы и knip чистые, форматирование поправлено. Прогоняю тесты, до которых дотягивается ветка.

2708 тестов из 2708 прошли. Коммичу и пушу.

Вова, переделал. Я понял тебя наоборот: правило ловило импорт по алиасу в скрипте голого Node, а такое и так падает при первом запуске. Теперь всё как ты сказал: у голого Node больше нет права на дальние относительные импорты. Скрипт, которому понадобилось что-то за пределами его слайса, переходит на tsx и алиас. Коммит 25698055 запушен, в нём же откат моего правила.

- **Правило.** `vova/no-relative-escape` больше не делает исключения для голого Node. Ошибка подсказывает алиас и добавляет, что скрипт голого Node сначала переводится на `tsx`. `eslint/bare-node.ts`, который вычислял список исключений, удалён.
- **Скрипты.** Восемь из них уже дотягивались за семь двуточий: `check:prose-quotes`, три проверки песен, `content:mermaid`, `content:drawings`, `translation:stamp` и `music:untold`. Они переехали на tsx, а их 32 дальних импорта стали алиасами. Под голым Node остались только те, кому дальнее не нужно: `check:i18n-payload`, `lint:fsd`, `check:masd` и два скрипта из `personas/tools`.
- **Тесты этих скриптов** запускают их из временной папки, а оттуда tsx не находит `tsconfig` с алиасом. Поэтому запуск вынесен в `runTsxScript` в `src/kernel/scripts/lib/tsx-script.ts`, и он передаёт `tsconfig` репо явно. Пять тестов вызывают его вместо `process.execPath`.
- **Комментарии.** Примерно в двадцати модулях было написано «Bare Node runs this file…» как причина того, почему файл устроен так, а не иначе. Где это стало неправдой, оставил только то, что по-прежнему верно: модуль запускается вне бандлера, поэтому в нём нет `server-only`. `masd.md` и `content.md` теперь формулируют правило про tsx.

Проверено: все восемь скриптов отрабатывают под tsx, включая `content:drawings maya --check` и `content:mermaid --check`. Весь линт, tsc и knip зелёные, 2708 тестов из 2708 прошли. `vet.sh` оставил для `/finalize`.

Про тёзок ничего не трогал: исключение для `messages` стоит, как было. Почему оно нужно (из-за пары в `maya`), я ответил в треде.
```
