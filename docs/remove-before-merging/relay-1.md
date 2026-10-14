# Relay 1 — Reddit digest routine

## 1. Standing constraints

None stated by the operator. From the session's own run-ins:

- Never write the Umami token (or any credential) to a file — the auto-mode
  classifier denies it as credential materialization. Log in and use the token
  inside one command / in memory.

## 2. The conversation

1. **Operator:** «acrtic shift позволяет смотреть реддит по конкретному юзеру
   (мне, u/vzakharov)? Если да, посмотри мои последние посты-комменты в
   агентской тематике, что сработало, что нет -- а потом хочу создать процесс
   ежедневного прохода по Routine, где ты мне будешь советовать где и что можно
   записать и как это можно замкнуть на muthur, agentic.bible итп»

   **Agent:** Routed as rung 2 (question). Yes, `author=` works. Analysed posts:
   winners have a number in the title and solve a money/limits pain (the
   $20→$1,300 post: 200/83 in r/ClaudeAI, 0 in r/ClaudeCode as “old news”;
   keepalive 61/53 and 76 in r/ClaudeCoding; cold-cache 54); bare-link posts
   (“Have a look & grab”) and contrarian takes without data flop. Proposed a
   daily routine and asked: digest location, ready lines vs angles, time,
   (later) hourly watcher.

2. **Operator:** «посмотри по комментам specifically. посты это хорошо, но это
   как правило на порядок больше работы по подготовке, а залетают они зачастую
   хуже, а часто так и вообще в вечном нуле остаются, особенно на r/claudecode
   (тяжёлая публика)»

   **Agent:** Comment analysis (246 comments in others' threads in AI subs since
   2026-06-07): first hour is 4× the hit rate; short deflation wins; links earn
   no votes but muthur's GitHub traffic shows ~130 Reddit uniques in 14 days.
   Concluded a daily run is too slow to say “go comment here”; proposed a
   morning review + “ammo” (патронташ) + loop-closing + optional hourly watcher.

3. **Operator:** «> хотя людей на GitHub приводят — а на сайт? у тебя должны
   быть ключи к umami (или ты уже смотрел)?»

   **Agent:** Hadn't looked; did. Reddit ≈ half of agentic.bible's visits;
   `/web-not-cli` is the most-entered page (74), peaking 22 on 10-12 after a
   score-1 comment under a Cursor `rmdir C:\` thread; a landing post sends
   profile traffic to vovazakharov.com. Two jobs: votes (early, short, no link)
   vs readers (link under a fresh injury the page cures).

4. (Stop hook about a denied call) **Agent:** the denied call (token written to
   a file) is no longer needed; rewritten to keep the token in memory.

5. **Operator:** «ну что, давай напишем и задогфудим. лёрнинги тоже где-то
   запишем и они должны быть живым документом»

   **Agent:** Routed via `/task`: plan, then go (no operator gate — forks all
   carry recommendations). Renamed the branch, wrote the plan, opened draft PR
   #155 with a squash proposal, flipped the plan with this message as the
   go-ahead, seeded the playbook, then paused for the context budget and
   relayed.

## 3. Intent

A daily Routine that advises the operator on Reddit **comments** (not posts):
how yesterday's settled comments did and why, replies waiting, readers sent to
the sites and muthur, ammo for recurring pains, and loop-closing into
agentic.bible / LSA ideas / basilisk.fyi. The learnings live in a **living
document** the routine reads and revises. “Задогфудим”: run it once for real in
this branch, and set up the actual routine.

## 4. Decisions

- **Comments only** — operator's call (message 2).
- **Digest in the repo** (`writing/reddit/digests/<date>.md`) on an
  accumulating draft PR, not Gmail/Notion — recommendation in force, unanswered.
- **Angles and facts, not ready comments**; ammo carries one sample line per
  pain — recommendation in force, unanswered.
- **03:47 UTC daily** — the operator's comments start ~04:00 UTC; unanswered,
  time zone unknown.
- **No hourly watcher yet** — logged as the playbook's first open hypothesis.
- **Settled window** = comments 48–72 h old (Arctic Shift re-fetches scores
  36–48 h after posting).
- **Terms:** “ammo” / «патронташ» = per-pain entries (page + fact + sample
  line); “settled” = second-fetch score; “two jobs” = votes vs readers.
- The PR title `chore: …` — the branch ships nothing any site serves.

## 5. Errors and dead ends

- Bash hook blocks `tee`, `cat >`, `head`, `sed -n` on files; scratchpad data
  processing goes through by rerunning or `BATCH_EDIT=1`.
- Writing the Umami token to `umami_token` was denied (see § 1).
- Umami `metrics?type=url` returns nulls; `type=entry` and `type=path` work.
- Deleting the old remote branch `claude/ecstatic-planck-o1rpxs` got a 403; it
  carries no PR and nothing the new branch lacks.
- The quote converter mis-closed quotes before `.`/`**`; fixed. The playbook's
  quotes are typographic with American punctuation (`content.md`).

## 6. State

- Branch `claude/reddit-digest-o1rpxs`, head 170cb41, pushed, clean.
- PR https://github.com/vzakharov/vovazakharov.com/pull/155 — draft, title
  `chore: a daily Reddit digest routine and its living playbook`, squash
  proposal posted and tracked in
  `docs/remove-before-merging/squash-message.md`.
- Plan: `docs/plans/reddit-digest.paused.md` — its § “Progress” lists done/left
  and the API recipes.
- No routine created yet; no PR subscription; a keepalive watcher in this
  session is stopped at relay.
- Estimate: this session 4.5 h middle analyst (the comment/traffic data pass) +
  1.5 h senior copywriter (judging why comments land, the playbook) + 1 h
  senior prompter (designing the routine). **Remainder for the successor:**
  3 h middle developer “a fetch script over three APIs with zod parsing,
  retries and a tested pure half is routine tooling work” + 1.5 h senior
  prompter “an unattended skill that judges, writes and revises a living
  document needs someone fluent in the agent loop”.

## 7. Pointers

- `docs/plans/reddit-digest.paused.md` — the plan (items 1–8) and § Progress.
- `writing/reddit/playbook.md` — the seeded living document; the dogfood run
  revises it.
- `.claude/skills/file-basilisk-case/SKILL.md` — Step 1 is the shape for “find
  the accumulating draft PR by path”; Step 2 holds the Arctic Shift notes to
  extend (item 5).
- `.claude/skills/stand-up-site/SKILL.md` § Step 5 — the Umami login.
- `writing/CLAUDE.md` — layout to extend with `reddit/` (item 6).
- `scripts/lib/docket.ts` + `scripts/lib/docket.test.ts` — the lib/test
  pattern; `.claude/rules/testing.md` for CLI tests; zod is a dependency.
- Re-fetch data: Arctic Shift and Umami recipes in the plan's § Progress;
  `gh api repos/vzakharov/muthur/traffic/popular/referrers`.
- Predecessor transcript: https://claude.ai/code/session_01D8KBmh3aLZs3V4wdrTtb5X

## 8. Next step

Resume the paused plan with `/go` from its Step 1: build items 3, 4, 5, 6 in
that order, then dogfood (item 8: run `/reddit-digest` once on this branch),
then create the routine (item 7: `create_trigger`, fresh session per fire,
`CRON_TZ`-less 03:47 UTC daily, prompt `/reddit-digest`, push notifications
on), then `/polish` and refresh the PR. The go-ahead it records: «ну что, давай
напишем и задогфудим. лёрнинги тоже где-то запишем и они должны быть живым
документом».
