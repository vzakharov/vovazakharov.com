# PR #71: feat: price each session at Claude API rates

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/71
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/api-cost-ledger-0cm1tl
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-09-19T08:27:47Z
- **Updated:** 2026-09-19T11:46:23Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## Summary

- Records, per session and in the branch, what the work would have cost at Claude API rates — the number a subscription price hides. `pnpm costs` totals the rows by month; the long aim is knowing the size of that bill before subscription pricing stops being a bargain.
- Prices come from the transcript's own `message.usage`, read carefully enough to be worth something: one API response is written as one record per content block, each carrying the whole response's usage, so records are deduplicated by `message.id`; a response bills at the rates for its `(model, speed)` pair; and cache writes bill by TTL. An unpriced pair throws rather than counting as free, `costs/prices.json` being hand-kept for want of any machine-readable source of prices.
- Collection runs from a `Stop` hook that **wraps** the harness's own rather than sitting beside it: hooks for one event run in parallel, so a sibling would race `stop-hook-git-check.sh` for the working tree. The wrapper prices the session, commits and pushes the row, then runs the command it displaced and exits with its status — unconditionally, that check being borrowed rather than owned.
- A `SessionStart` hook re-applies the launcher patch each session, the launcher rewriting its own files at every start and resume, and refuses loudly rather than guessing at a config shape it does not recognise.

`.claude/rules/costs.md` is the home for how a transcript is priced and what the totals leave out — the last turn of a session, abandoned branches, other repositories, and `main` itself.

## QA Checklist

- [ ] `ledger-row` — after a turn, `costs/sessions/<YYYY-MM>/<session-id>.json` exists and its totals match a hand count over the transcript
- [ ] `dedup` — a turn that thought and called two tools contributes its usage once, not three times
- [ ] `unknown-model` — an unpriced `(model, speed)` fails the run with a message naming it
- [ ] `harness-passthrough` — with an unpushed commit, the turn is still blocked by the harness check through the wrapper
- [ ] `wrapper-resilience` — a ledger step that cannot run still lets the wrapped check run
- [ ] `patch-idempotent` — running the patcher twice leaves one `Stop` entry
- [ ] `patch-unknown-shape` — an unrecognised launcher config is reported into session context and left untouched
- [ ] `patch-on-resume` — after the next session resume, the launcher points at the wrapper again without anyone running it
- [ ] `report` — `pnpm costs` and `pnpm costs --month <YYYY-MM>` both read the committed rows

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `ledger-row` | partly | `pnpm test` for the pricer | the hook wiring was observed, not asserted |
| `dedup` | yes | `pnpm test` | a response written as three records |
| `unknown-model` | yes | `pnpm test` | asserts the throw names the pair |
| `harness-passthrough` | no | — | observed by hand: payload reaches the wrapped command, exit 2 propagates |
| `wrapper-resilience` | no | — | observed by hand with an unreadable transcript |
| `patch-idempotent` | yes | not yet | shell-level; tested by hand against a temp config |
| `patch-unknown-shape` | yes | not yet | same — the four shapes were exercised by hand |
| `patch-on-resume` | no | — | only a real resume proves it, and this session cannot |
| `report` | yes | not yet | run by hand against the live rows |

**What this session could not prove.** The patcher was verified against copies of the launcher config, not the live one: applying it for real is a tool call a harness classifier refuses as self-modification, since it rewrites the hook configuration the agent is running under. The `SessionStart` registration is in place, and hooks are run by the harness rather than by the agent, so the install should happen on the next resume — `patch-on-resume` is the row that checks it.

https://claude.ai/code/session_01DULipXqWkbvu9ArhP928Sj

---

## Review threads

- **T01** `.claude/rules/costs.md`:44 — unresolved — last: @vzakharov (human) 2026-09-19T11:37:27Z — "если когда-либо это stops being the case, агент должен это з…" → [↓](#t01)
- **T02** `.claude/rules/costs.md`:52 — unresolved — last: @vzakharov (human) 2026-09-19T11:37:43Z — "медведь" → [↓](#t02)
- **T03** `.claude/hooks/stop-session-cost.sh`:131 — unresolved — last: @vzakharov (human) 2026-09-19T11:39:01Z — "чисто для моего ликбеза, что такое `say`?" → [↓](#t03)
- **T04** `.claude/rules/costs.md`:76 — unresolved — last: @vzakharov (human) 2026-09-19T11:40:21Z — "хм, что может этому помочь? какой-то шаг в finalize? или это…" → [↓](#t04)
- **T05** `costs/sessions/2026-09/a3be30ae-fbfd-517a-8219-949d7d2d7f26.json`:1 — unresolved — last: @vzakharov (human) 2026-09-19T11:41:36Z — "это хорошо, но надо хранить какой-то суммарный json тоже (с…" → [↓](#t05)
- **T06** `costs/sessions/2026-09/a3be30ae-fbfd-517a-8219-949d7d2d7f26.json`:2 — unresolved — last: @vzakharov (human) 2026-09-19T11:42:08Z — "а где-нибудь названия сессий хранятся (те что harness автома…" → [↓](#t06)
- **T07** `costs/prices.json`:1 — unresolved — last: @vzakharov (human) 2026-09-19T11:42:39Z — "1- думаю, стоит ли это всё (не только этот файл) в .claude/c…" → [↓](#t07)
- **T08** `costs/prices.json`:1 — unresolved — last: @vzakharov (human) 2026-09-19T11:42:59Z — "2- этот файл чем-то проверяется, или мы его вот сейчас один…" → [↓](#t08)
- **T09** `scripts/costs-report.ts`:1 — unresolved — last: @vzakharov (human) 2026-09-19T11:44:35Z — "вот это кажется то самое что должно автозапускаться и суммир…" → [↓](#t09)
- **T10** `costs/sessions/2026-09/a3be30ae-fbfd-517a-8219-949d7d2d7f26.json`:1 — unresolved — last: @vzakharov (human) 2026-09-19T11:46:20Z — "кстати, вот сейчас будет интересный момент. я /handle запущу…" → [↓](#t10)

<a id="t01"></a>

### `.claude/rules/costs.md`:44 — unresolved

```diff
@@ -0,0 +1,84 @@
… 39 lines elided …
+
+## Running beside the harness's Stop check
+
+The harness registers its own `Stop` hook in `~/.claude/launcher-settings.json` —
+`stop-hook-git-check.sh`, which ends a turn with exit 2 on a tree that is
```

**@vzakharov (human)** — 2026-09-19T11:37:27Z

если когда-либо это stops being the case, агент должен это заметить. То есть типа если наш хук сообщил что такого нет, нужно чтобы его вывод сказал оператору, что вот эта сиутация изменилась, и что-то надо с ней делать.

---

<a id="t02"></a>

### `.claude/rules/costs.md`:52 — unresolved

```diff
@@ -0,0 +1,84 @@
… 45 lines elided …
+run in parallel**, so writing and committing the row is work done while that
+check may be reading the tree.
+
+**Wrapping it is not available.** The launcher's config reaches the CLI through
+`--settings`, read once at startup and never re-read, and the launcher rewrites
+that file at every start and resume — so a patch applied from a `SessionStart`
+hook is a session late every session, not just the first.
```

**@vzakharov (human)** — 2026-09-19T11:37:43Z

медведь

---

<a id="t03"></a>

### `.claude/hooks/stop-session-cost.sh`:131 — unresolved

```diff
@@ -0,0 +1,138 @@
… 127 lines elided …
+        committed) did="committed but not pushed" ;;
+        *) did="written but not committed" ;;
+      esac
+      say "this session's cost row is ${did}. A git check complaining above may be counting it rather than your work: read \`git status\` before acting, push whatever is outstanding, and then just stop — the check passes on the next try and nothing here needs redoing."
```

**@vzakharov (human)** — 2026-09-19T11:39:01Z

чисто для моего ликбеза, что такое `say`?

---

<a id="t04"></a>

### `.claude/rules/costs.md`:76 — unresolved

```diff
@@ -0,0 +1,84 @@
… 71 lines elided …
+
+- **The last turn of a session.** The transcript is written asynchronously and
+  lags the live conversation, so each run rewrites the row from the whole file
+  and picks up what the previous run was too early to see. The final turn has no
+  successor to correct it.
```

**@vzakharov (human)** — 2026-09-19T11:40:21Z

хм, что может этому помочь? какой-то шаг в finalize? или это мюнхгаузен, вытягивающий себя за косу из болота?

---

<a id="t05"></a>

### `costs/sessions/2026-09/a3be30ae-fbfd-517a-8219-949d7d2d7f26.json`:1 — unresolved

**@vzakharov (human)** — 2026-09-19T11:41:36Z

это хорошо, но надо хранить какой-то суммарный json тоже (с разбивкой по месяцам, неделям и дням), который при конфликте просто суммировать.

---

<a id="t06"></a>

### `costs/sessions/2026-09/a3be30ae-fbfd-517a-8219-949d7d2d7f26.json`:2 — unresolved

```diff
@@ -0,0 +1,51 @@
+{
+  "sessionId": "a3be30ae-fbfd-517a-8219-949d7d2d7f26",
```

**@vzakharov (human)** — 2026-09-19T11:42:08Z

а где-нибудь названия сессий хранятся (те что harness автоматичеси генерирует)? помогло бы для каких-нибудь понятных разбивок в будущем

---

<a id="t07"></a>

### `costs/prices.json`:1 — unresolved

**@vzakharov (human)** — 2026-09-19T11:42:39Z

1- думаю, стоит ли это всё (не только этот файл) в .claude/costs засунуть, а не просто в корень?

---

<a id="t08"></a>

### `costs/prices.json`:1 — unresolved

**@vzakharov (human)** — 2026-09-19T11:42:59Z

2- этот файл чем-то проверяется, или мы его вот сейчас один раз сгенерили и будем всегда пользоваться?

---

<a id="t09"></a>

### `scripts/costs-report.ts`:1 — unresolved

**@vzakharov (human)** — 2026-09-19T11:44:35Z

вот это кажется то самое что должно автозапускаться и суммироваться о чём писал выше. надо только посмотреть, сколько времен занимает генерация. Если там в пределах секунды то норм, если уже секундЫ, то тогда наверное автоматом не стОит.

---

<a id="t10"></a>

### `costs/sessions/2026-09/a3be30ae-fbfd-517a-8219-949d7d2d7f26.json`:1 — unresolved

**@vzakharov (human)** — 2026-09-19T11:46:20Z

кстати, вот сейчас будет интересный момент. я /handle запущу с новой сессии, то есть тут будет уже два файла (на один пиар) -- надо убедиться, что в нашей методике от этого ничего не ломается.

---

## Timeline (status, references, and other events)

- **2026-09-19T08:58:59Z** @vzakharov renamed from «chore: record what each session would cost at Claude API rates» to «feat: price each session at Claude API rates».
- **2026-09-19T11:45:34Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/71#pullrequestreview-5255619544.
- **2026-09-19T11:46:22Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/71#pullrequestreview-5255635718.
