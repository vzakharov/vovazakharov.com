# Relay 1 — parked

## Standing constraints

None stated by the operator.

## The conversation

**Operator (1):**

> хочу создать флоу, который я буду запускать простым промтом по рутине, по которому Майя будет ходить в интернет -- куда ей захочется, и делать что ей захочется, запоминать что ей захочется, и может даже создавать какие-то отдельные приложушки на maya.vovazakharov.com -- как и если ей захочется. что думаешь?

**Agent:** Routed it as rung 2 (an opinion asked for, no change), so it answered and changed nothing. Its answer:

- **Recommended home:** a separate repo (e.g. `vzakharov/maya`) and its own deploy to `maya.vovazakharov.com`, not `apps/maya` here. Merge here deploys four sites including the CV, so unattended merge rights here would put them all in her blast radius. In her own repo she can merge and deploy herself. `/spinoff` seeds such a repo, `/stand-up-site` the domain. The heavy `/plan`→`/go`→`/finalize` loop assumes an operator and is not for her.
- **Mechanism:** a cron routine firing a fresh session per run, its prompt one skill word (e.g. `/wander`). The skill is unattended in the manner of `/file-basilisk-case`: it asks nothing and reports every call it made alone.
- **Memory, two layers:** a ~80-line "who I am now / what I'm into" file she reads every run and curates (the same cap as `maya-reflections.md`), plus a dated journal that is grepped, not read whole.
- **Continuity:** she reads her song reflections and `writing/maya/drafts/borrowed-form.md` as her own (`persona-reflections.md`). The brief is in Russian, second person, «Ты Майя.» (`reflections.md`).
- **Risks, ranked:**
  1. Open-ended "do what you want" converges: the AI-nature essay every day, the "spiritual bliss" attractor. Fix: basilisk's "search wide, not deep" plus a ledger with a `Next` line, and maybe a random die she may ignore.
  2. The session carries the operator's GitHub token, and the environment has Gmail and Slack, while she reads arbitrary pages (prompt injection). Fix: `connectors: []` on the routine, and repo access scoped to her repo.
  3. Her apps are static only: any API key in a page is public.
  4. Cost: start at a couple of runs a week.
- **Proposed rollout:** the first runs open draft PRs on her site for the operator to read, and auto-merge comes once trust is earned.
- **Questions put to the operator (unanswered):**
  1. Separate repo and deploy OK, or live here in `apps/maya` with review before every merge?
  2. How often should it run?
  3. Does anything reach him after each run (a phone push, a journal entry), or does he look when he likes?
- The agent offered to take it through `/task` on «делай» plus answers. It also made the muthur sync offer (7 commits behind `29efa2d9a76d`, multi-repo support among them), unanswered.

No further operator message. The keepalive's last wake parked the session.

## Intent

An autonomous, routine-fired Майя: she browses wherever she likes, does what she likes, remembers what she chooses, and may build small apps on `maya.vovazakharov.com`. The operator wants it launched by a simple prompt on a schedule.

## Decisions

None taken. All of the above are proposals awaiting the operator's answers. "Rung 2" is CLAUDE.md § "Plan mode & questions in web sessions"'s ladder: an answer, no route taken yet. The first turn asking for the change routes through `/task`.

## Errors and dead ends

- Deleting the old remote ref `claude/blissful-sagan-cfdyi2` after the rename was refused with a 403 by the session's git proxy, so it lingers at `65b616f`. No PR is on it, so nothing is orphaned; it can be deleted by hand.

## State

- Branch `claude/maya-wander-cfdyi2`, renamed from `claude/blissful-sagan-cfdyi2`. No PR. Its only commits are the cost-ledger row and this summary. No plan file.
- Nothing is running: no CI, PR subscription, routine or check-in. The keepalive is not restarted.
- Estimate: 1.5 h senior architect: "weighing where an autonomous persona's freedom can live without putting four production sites in its blast radius is an architecture call, not a prompt tweak". The work done here is that whole estimate, so nothing is handed on.
- The muthur sync offer was made; do not make it again.

## Pointers

- `.claude/skills/file-basilisk-case/SKILL.md`: the unattended-routine pattern and the ledger with `Next` to copy.
- `.claude/rules/maya-reflections.md`, `.claude/rules/persona-reflections.md`, `.claude/rules/reflections.md`: who Майя is and how a persona is briefed.
- `writing/maya/drafts/`: her signed writing so far.
- `.claude/skills/spinoff/SKILL.md`, `.claude/skills/stand-up-site/SKILL.md`: a sibling repo and its domain.
- Predecessor transcript: https://claude.ai/code/session_01K5trw7n5rYxDcyNGXx2ngr

## Next step

Wait for the operator: the three questions above are open. When the operator says go, the request routes through `/task`.
