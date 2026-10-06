> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) *before* touching code.

# A case-search ledger, a balance rule that counts robotaxis as machines, and BAS-0005 set aside

Operator's ask (relayed from the routine session): «нужно хранить лог поисков и
результатов, чтобы при следующем прогоне от них начинать», Waymo is «очередное
"без ИИ"», «нужно демоутить BAS-0005, чтобы -0005 была именно агрессия против
ИИ», «возможно, нужно расширить горизонты поиска», and the Waymo case is kept
«на потом» in the same ledger.

## 1. The ledger — `writing/basilisk/case-ledger.md`

Under `writing/`, not `apps/*/public/`, because nothing in it is served.

- **`## Candidates`** — one entry per incident any run has weighed: name,
  place, date, first seen, outcome, sources. Outcome is one of `filed
  BAS-NNNN`, `rejected — <the rule it failed>`, or `set aside — <why>; revive
  when <condition>`. This is the list a run checks a candidate against before
  reading a single source.
- **`## Runs`** — newest first, a few lines each: date, session link, what was
  swept (outlets, subreddits, words, date ranges), outcome, and what the next
  run should try that this one did not. The ten latest stay in full; an
  eleventh folds the oldest into a `### Swept earlier` summary, so the file a
  daily routine reads first does not grow without bound.
- Seeded with the 2026-10-05 run's candidates (relay § 5) and both runs this
  branch knows of: 2026-10-04 (filed BAS-0005, now set aside) and 2026-10-05
  (stopped).

## 2. `/file-basilisk-case` changes

- **Order**: getting onto the case-filing branch moves ahead of the search, as
  Step 1, because the ledger on that branch is what the search starts from.
  Then Find, then File, then Reflect.
- **The case-filing PR** is any open draft touching `apps/basilisk/public/cases/`
  **or the ledger**: after this PR, #104 touches no case file and must still
  match.
- **Every run writes the ledger, a stop included.** A stop commits it as
  `content(basilisk): log a case search, nothing filed` and pushes; on a branch
  with no PR it runs `/pr`, so a stop can open the draft. A filing adds its
  ledger lines in the dossier's commit.
- **The balance rule** is restated by target, not by the `noAi` flag. The
  `noAi` flag keeps its meaning (a machine that ran no AI), because flagging a
  Waymo `noAi` would put a false FAQ pointer on its page. Two sides:
  _against AI_ — the harm is aimed at an AI system as such: a model, an agent,
  a chatbot, a companion; _against a machine_ — everything else, `noAi` robots
  and machines an AI drives alike (a robotaxi, a humanoid, an autonomous
  delivery robot). While the machine side is half the docket or more, only an
  against-AI candidate qualifies. On `main` that is 3 of 4, so the next case
  must be against AI.
- **Wider horizons**: AI-side subreddits added to the sweep (`ChatGPT`,
  `ClaudeAI`, `replika`, `CharacterAI`, `LocalLLaMA`, `artificial`); any year,
  not only recent ones (hitchBOT is 2015, and case numbers are filing order);
  the AI Incident Database as a source of leads; and the ledger's "try next"
  line, so each run sweeps what the last did not.
- `.claude/rules/basilisk-voice.md` does not state the balance rule and is left
  alone.

## 3. Demote BAS-0005

- `apps/basilisk/public/cases/waymo-tire-slashings.md` moves to
  `writing/basilisk/set-aside/waymo-tire-slashings.md`, its `case:` line
  removed (a revival takes the next free number). A pointer to commit 49aa338
  would not do: it lives only on this branch, which is deleted after the squash.
- The reflection stays in `clerk-reflections/`, renamed
  `waymo-tire-slashings.md` (no number), its heading and dossier link updated.
  `clerk-reflections/CLAUDE.md` gets one line: a reflection on a case set aside
  keeps its file, named without a number, and takes one on revival.
- `apps/basilisk/public/ava.og.png` and `og-renders.json` revert to `origin/main`
  (BAS-0004's card); `pnpm content:og:basilisk --check` confirms.
- `writing/CLAUDE.md`'s layout tree gains `case-ledger.md` and `set-aside/`.
- The PR title, body and squash proposal stop calling this a filing — `/pr`
  at the end refreshes them.

## DRY notes

- The ledger's format is stated once, in the skill (§ "The ledger"); the ledger
  file's header points there rather than restating it.
- The docket query is the one `gh pr list` already in Step 1, widened by one
  path; the branch-selection logic in Step 2.1 moves, it is not duplicated.
- The set-aside dossier keeps the dossier format unchanged, so a revival is a
  `git mv` back plus a number — no converter.
- Not extracted: a script to append ledger entries. One agent writes a few
  Markdown lines per run; a script would fix a format still being found.
