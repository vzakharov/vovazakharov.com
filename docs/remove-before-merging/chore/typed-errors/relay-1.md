# Relay 1 — ban bare `new Error`, planned and parked

Parked by the cache keepalive's last wake, not by the operator: the plan was
published and the session sat idle waiting for a go-ahead.

## 1. Standing constraints

From the operator's `/task` prompt, verbatim:

- «В саму `claude/unsquatted-site` не пушь: её ведёт другая сессия.»
- «без scoped `off` и без lint-suppression»
- «прежде чем трогать хелперы, подтяни её свежий head» — `src/kernel/shared/lib`
  is over Steiger's threshold (18 of 15) and #231's session is regrouping it.

## 2. The conversation

**Operator** (`/task`):

> Ввести ESLint-правило, запрещающее голый `new Error(…)`, и перевести на него
> весь репозиторий — сегодня это около 185 мест в 97 файлах. Каждое место
> бросает класс ошибки, сделанный через `errorClass(name)` из
> `src/kernel/shared/lib/error-class.ts` (а сетевые — через
> `fetchOk(url, ErrorClass, init)` из `fetch-ok.ts`), без scoped `off` и без
> lint-suppression. Оба хелпера пока есть только в ветке
> `claude/unsquatted-site` (PR #231, ещё не смержен; тред T07 в его втором
> раунде ревью — откуда задача и пришла), поэтому работай в новой ветке от неё,
> PR — с базой `claude/unsquatted-site`, а после мержа #231 перенацель его на
> `main`. В саму `claude/unsquatted-site` не пушь: её ведёт другая сессия.
> Учти, что `src/kernel/shared/lib` уже над порогом Steiger (18 модулей при 15)
> — та сессия перегруппировывает его, так что прежде чем трогать хелперы,
> подтяни её свежий head.

**Agent**: routed it to outcome 1 (plan and hand off), because the work is about
a day while the plan reads in minutes, and one fork is the operator's to make.
Branched `chore/typed-errors` off `origin/claude/unsquatted-site` at `3ae6858`,
wrote the draft plan, and opened draft PR #234 against `claude/unsquatted-site`
with the squash proposal posted. Asked one question, with (a) recommended and
written into the plan, and also made the muthur-sync offer. (verbatim in Last
agent turn)

## 3. Intent

Make named error classes the only way to throw, repo-wide, enforced by lint with
no exemptions. This continues T07 from #231's second review round. #234 merges
into #231's branch and retargets to `main` after #231 lands.

## 4. Decisions

- **Plan before code**: the scale (197 sites, naming judgement at each) is what
  sent it to the gate.
- **`no-restricted-syntax` over a custom `vova/` rule**: a selector says the
  whole rule, so a rule file and its test would be dead weight. Two selectors:
  `new Error` and the call form `Error(…)`.
- **`asError(unknown)` in `error-class.ts`, not a new module**: it replaces six
  coercions, and a new module would push the lib further over Steiger's
  threshold.
- **Per-module classes, not a shared catalogue**: a shared `UsageError` would add
  import edges across the MASD graph just to share a name.
- **`TypeError` in `star-images.ts` stays**: the ban covers `Error` only.
- **Open question 1**, with (a) in force: `eslint/masd-graph.ts` imports
  `error-class.ts` relatively, and the self-containment line in
  `.claude/rules/eslint.md` narrows to modules that reach `@/` transitively. The
  alternative (b), vendoring a copy, was rejected as silent duplication.

## 5. Errors and dead ends

None.

## 6. State

- Branch `chore/typed-errors`, head `7103aaf`, fully pushed. A commit carrying
  this file follows it.
- PR #234: draft, base `claude/unsquatted-site`. The squash proposal comment is
  posted and tracked at
  `docs/remove-before-merging/chore/typed-errors/squash-message.md`.
- Plan: `docs/plans/typed-errors.draft.do-not-implement.md`, with no go-ahead
  given. `docs/plans/unsquatted-review-2.in-progress.md` is #231's own plan,
  inherited from the base: it is not this branch's, so leave it alone.
- No subscription, CI or check-in is pending.
- Estimate: this session booked `1 h senior developer` for the plan's convention
  calls. Remainder for the successor:
  `--part 8 middle developer "197 throw sites in 103 files each need a class named for what failed — mechanical in bulk, but naming is per-site judgement a junior would get inconsistent" --part 0.5 senior developer "asError and the eslint/ import-boundary amendment touch repo-wide conventions"`.

## 7. Pointers

- The plan: `docs/plans/typed-errors.draft.do-not-implement.md`. Steps, the
  naming convention and DRY notes are all there.
- The helpers: `src/kernel/shared/lib/error-class.ts` and `fetch-ok.ts`. Their
  paths may move after #231's regrouping, so check after merging
  `origin/claude/unsquatted-site`.
- Site count: `git grep -c 'new Error(' -- '*.ts' '*.tsx'`.
- This session's transcript: https://claude.ai/code/session_01DaohkEqmhWKawGUCbW9brg

## 8. Next step

Wait for the operator. The plan awaits a go-ahead and an answer to question 1;
silence on 1 means (a) stands. The muthur-sync offer was made; do not make it
again.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

````text
Вова, черновой PR #234 открыт. Осталось выложить предложение для squash, и на этом остановлюсь.

Вова, я написал план и на этом остановился, код не трогал. Причина: исправить 197 мест — работа примерно на день, а прочитать план — на пять минут, плюс есть одна развилка, которую решаешь ты. Если хочешь, чтобы я начинал сразу, скажи «поехали».

**Что выяснилось:**
- **Мест больше, чем было в задаче:** сейчас 197 в 103 файлах, а не 185 в 97 — #231 успел добавить новые. 13 из них в тестах, 3 вне `src/`.
- **Правило — это готовое `no-restricted-syntax` с двумя селекторами:** на `new Error(…)` и на `Error(…)`, потому что вызов без `new` тоже создаёт ошибку. Отдельный файл правила не нужен. Никаких исключений, тесты тоже под правилом.
- **Нашлось шесть копий `error instanceof Error ? error : new Error(String(error))`.** Их заставляет писать `vova/no-uncaused-rethrow`. Предлагаю заменить их одним `asError(unknown)`, который будет жить в том же `error-class.ts`. Нового модуля не будет, так что порог Steiger не задеваю.
- **Классы ошибок объявляются в каждом модуле свои и называются по тому, что сломалось.** Тексты сообщений не меняются. Единственный `new TypeError` остаётся: он и так говорит, что за ошибка.
- **Прежде чем трогать хелперы, подтяну свежую голову #231.** В `claude/unsquatted-site` не пушу.

**Вопрос (план уже написан под вариант «a»):**

1. `eslint/masd-graph.ts` должен импортировать `errorClass`, но `.claude/rules/eslint.md` требует, чтобы `eslint/` ничего не тянул из `src/`.
   - **(a), рекомендую:** импортировать по относительному пути. В `error-class.ts` нет ни одного импорта, поэтому jiti не наткнётся на алиас `@/`, ради которого это правило и написано. Само правило в `eslint.md` сужу до того, что оно на самом деле защищает.
   - **(b):** скопировать функцию в `eslint/`. Тогда будут две копии, которые рано или поздно молча разойдутся.

Предложение для squash уже висит комментарием в PR. После мержа #231 перенацелю PR на `main`.

https://github.com/vzakharov/vovazakharov.com/pull/234

Чтобы запустить реализацию, открой новую сессию с командой ниже или просто скажи здесь «поехали»:

```
/go chore/typed-errors
```

И ещё: `vzakharov/muthur` ушёл на 5 коммитов вперёд с прошлой синхронизации. Если хочешь, запущу отдельную сессию `/update-muthur`, чтобы она их подтянула.
````
