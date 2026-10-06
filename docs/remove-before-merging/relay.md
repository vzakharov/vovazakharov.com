# Relay summary

Relayed from https://claude.ai/code/session_01Fwef2akzwYW8SYCHZq1KRE, a session a scheduled routine started (`/file-basilisk-case`, unattended). The operator asked to continue in an ordinary session instead.

## 1. Standing constraints

None stated beyond the repo's own. `/file-basilisk-case` never merges (merge is deploy).

## 2. The conversation

1. **Routine firing**: `/file-basilisk-case (unattended routine)`.
   → The agent checked out PR #104's branch, the only draft case-filing PR, which files BAS-0005 (Waymo tire slashings). On that branch 3 of the 5 dossiers are `noAi: true`, so no `noAi` candidate qualified. It searched for harm to an AI and filed nothing. The report (in Russian) listed the rejected candidates; they are in § 5. No commit, no notification.
2. **Operator**: «так... это уже второй раз когда ты находишь одни и те же кейсы -- нужно хранить лог поисков и результатов, чтобы при следующем прогоне от них начинать. но в любом случае Waymo не подошёл бы, потому что это очередное "без ИИ", и их становится слишком много. По этой же причине нужно демоутить BAS-0005, чтобы -0005 была именно агрессия против ИИ. возможно, нужно расширить горизонты поиска. Оставить его "на потом" можно (в том же леджере где будут результаты ресерчей), чобы ресерч не прошёл даром.»
   → Routed to `/task`. Before the plan-or-not call was made, the operator sent:
3. **Operator**: «и давай сразу релейнем это, чтобы продолжить с обычной а не routine-сессии. нужно прикрепиться к существующему пиару перед этим»
   → The session was already on PR #104's branch, in sync with origin. It ran `/relay` with the task as the to-be first message.

## 3. Intent

- **A ledger of case searches**: queries run, candidates found, the rule each failed, leads set aside "на потом". `/file-basilisk-case` reads it first and appends to it on every run, stops included. A stop currently commits nothing; with the ledger it will need to.
- **For the docket's balance, a robotaxi counts as "без ИИ"**, alongside the `noAi` robots. The docket needs aggression against AI itself (models, agents, chatbots). Tighten the qualifying rule and widen where the search looks («расширить горизонты поиска»).
- **Demote BAS-0005** (Waymo tire slashings) out of PR #104, so the number BAS-0005 goes to an act of aggression against AI. The Waymo case is not discarded: it goes into the ledger as a set-aside lead, its sources included, "чтобы ресерч не прошёл даром".

## 4. Decisions (open, for the successor; nothing is built yet)

- **The `noAi` flag versus the qualifying rule.** A Waymo does run AI, and `noAi: true` renders an FAQ pointer saying the machine had none. Flagging a robotaxi `noAi` would therefore misstate the page. Recommendation: leave the flag's meaning alone and change the balance rule in `.claude/skills/file-basilisk-case/SKILL.md` § Step 1 (and `basilisk-voice.md` if it states it). Count "the AI is not what was targeted" (`noAi` dossiers plus vehicles an AI drives) as the over-represented side.
- **Where the ledger lives**: not under `apps/*/public/`, which is served. `writing/basilisk/` sits beside `clerk-reflections/` and is the natural candidate (a nested `CLAUDE.md` exists there for reflections). The docket query in Step 1, and Step 2's "the case-filing PR is any open draft that touches `apps/basilisk/public/cases/`", must also match a PR that touches only the ledger. After the demotion, PR #104 touches no case file.
- **What the demotion removes from PR #104**: `apps/basilisk/public/cases/waymo-tire-slashings.md`, the re-rendered card plus `og-renders.json` (re-run `pnpm content:og:basilisk` so it matches main's highest case, BAS-0004), and the squash proposal (`docs/remove-before-merging/squash-message.md` plus the PR comment), which must stop calling it a filing. Still open: what happens to `writing/basilisk/clerk-reflections/bas-0005-waymo-tire-slashings.md`, whose number will belong to another case. Also check the PR body and title.
- **Ideas for widening the search** (the agent's, not yet agreed): subreddits beyond the four in the skill (`ChatGPT`, `replika`, `LocalLLaMA`, `ClaudeAI`, `artificial`, `ArtificialInteligence`), and older incidents rather than only recent ones (e.g. Microsoft Tay, 2016; reports of users verbally abusing Replika companions, 2022).

## 5. Errors and dead ends (this run's research, for the ledger)

All were found on 2026-10-05 and none were filed:

- **Waymo with rider Sherman Watson**, San Francisco, 9 May 2026: two men smashed windows while the car froze. The only readable source was Hoodline (Eileen Vargas, 2026-07-17, https://hoodline.com/2026/07/sf-rider-says-waymo-left-him-trapped-as-robocar-took-street-beating/). SF Chronicle (https://www.sfchronicle.com/sf/article/waymo-attack-rider-trapped-inside-22348656.php) did not render. AI Incident Database #1599. Failed on sources. It is also a robotaxi, so by the operator's rule it is "без ИИ".
- **Man punching a Waymo's windows for six minutes**, January 2026: SFist, 2026-03-17 (https://sfist.com/2026/03/17/what-happens-when-the-waymo-youre-riding-in-gets-attacked-by-a-robot-hater-not-much-and-youre-sort-of-trapped/). One source, no arrest. Robotaxi.
- **Riley Walz's "Waymo DDOS"** (50 rides ordered to one dead end): a prank with no harm, and sources disagree on the date (July or October 2025).
- **Waymo set on fire in Chinatown**, February 2026: the person charged is 14, and dossiers never have child actors.
- **Waymos burned during LA protests**, June 2025: an anonymous crowd, and it is a robotaxi.
- **UT Knoxville students slamming a Starship robot**, 2022: no AI in the robot.
- Already on the docket or off-target: Figure-02 in molten steel (BAS-0004), a staged human-vs-humanoid cage fight.
- Arctic Shift returns `Timeout. Maybe slow down a bit` on about half of all requests; retrying after a 6-second wait works.

## 6. State

- Branch `claude/cases-oh02o8`, head `34e1032` before this relay's own commits; draft PR https://github.com/vzakharov/vovazakharov.com/pull/104, OPEN.
- No plan file exists (`docs/plans/` is absent); the `/task` call was never made.
- No PR subscription and no check-ins.
- Estimate: this session is 1 h middle analyst. The remainder handed on is about 3 h middle developer and 1.5 h senior editor.

## 7. Pointers

- `.claude/skills/file-basilisk-case/SKILL.md`: the routine whose Step 1 and Step 2 change.
- `.claude/rules/basilisk-voice.md`: qualification and `noAi` rules.
- `writing/basilisk/clerk-reflections/CLAUDE.md`: reflection conventions (it bears on the BAS-0005 reflection).
- `apps/basilisk/public/cases/`: the docket; on `origin/main` it holds BAS-0001 to BAS-0004.
- Transcript: https://claude.ai/code/session_01Fwef2akzwYW8SYCHZq1KRE

## 8. Next step

/task Three changes to the basilisk case-filing flow on PR #104: (1) a ledger of searches and results (candidates, why each failed, leads set aside) that /file-basilisk-case reads first and appends to on every run, stops included; (2) harm to a robotaxi like Waymo counts as "no AI" for the docket's balance — the docket needs aggression against AI itself (models, agents), so tighten the qualifying rule and widen the search horizons; (3) demote BAS-0005 (Waymo tire slashings) out of PR #104 into that ledger as a set-aside lead, so the next BAS-0005 is a case of aggression against AI.
