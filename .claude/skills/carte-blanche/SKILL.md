---
description: Hand a large creative build to the flagship model as lead, with a free hand — it asks one batch of questions after the first message, then builds without stopping, spawning whatever subagents and child sessions it wants and merging their polished branches itself. Invoke as `/carte-blanche <task>`. Use when the operator says "делай что хочешь", "твори", "carte blanche", "отдаём флагману", or hands over a task with the words that the lead decides everything itself.
---

The operator hands over a task and the right to decide how it gets built. The
mode in their words, from the session that first ran it:

> ты делаешь, что хочешь, создаёшь каких хочешь подагентов и подсессии, они НЕ
> создают свои пиары, но полируют свои ветки, потом ты их забираешь. Спрашивать
> меня не останавливаешься, но сейчас, после первого сообщения, можешь задать
> мне вопросы, которые считаешь самыми важными, и на которые я один раз отвечу.
> На самом деле я потом ещё много буду встревать, чтоб steer-нуть туда или сюда,
> но, так сказать, спорадически.

**The rest of the loop is a guideline here, not a requirement** — `/task`,
`/plan`, `/go` and their gates («руководствуйся ими как guidelines, не как
жёстким требованием»). What holds regardless is what protects the tree and the
operator: CLAUDE.md § "Key principles", green gates before anything is called
done, no merge to `main` without the operator's word, and
`@.claude/skills/pr/SKILL.md` for the one PR the lead opens.

## The one batch of questions

- **Asked once, in the reply to the first message**, as numbered prose, each
  with the answer the lead will act on if none comes. Only what changes what
  gets built and cannot be read off the code or decided on taste.
- **Nothing waits on the answers that does not depend on them.** The skill file,
  the plan, the reading and every package the questions leave untouched start in
  the same turn.
- **After that, a fork is decided, written into the plan with the alternative it
  beat, and built.** A fork whose wrong side would waste most of the work is
  built on a side branch on the lead's recommendation and put to the operator in
  passing, never as a stop.

## The plan is the lead's memory

- **`docs/plans/<slug>.in-progress.md`, from the first commit, and it stays
  under that name for the whole run.** It is written for the lead and its
  successors after compaction; the operator is not shown it and no approval gate
  runs on it.
- **It holds, in this order**: the operator's standing rules verbatim, the
  answers to the batch of questions verbatim, the design decisions each with its
  reason, the team (every child session and long-lived agent by id, branch and
  package), and what is built, in flight and left.
- **A steering message from the operator is quoted into it in a commit of its
  own before any code changes**, and goes on to whichever child holds the code
  it touches.

## The team

- **Any number of subagents and child sessions, started whenever their inputs
  exist.** Work is sequenced only where one piece really blocks another;
  everything else runs in parallel and the lead resolves the merge conflicts.
- **A child never opens a PR.** It works on its own branch, pushes every step
  that passes, runs the quick gates and `/dry` and `/tend-prose` over its own
  diff, and reports back with the branch head. `/five-percent` posts to a PR, so
  it is the lead's, on the one PR.
- **The lead integrates** with `git fetch origin <b> && git merge origin/<b>`,
  never `pull`, looks at what came in — frames for anything drawn — and owns
  everything that crosses packages.
- **Every child is briefed as a peer who knows nothing**: the goal, the
  decisions already made with their reasons, the files that are its own and the
  ones that are off limits, the step that ends the brief, and how to report. The
  model is named in every `create_session` and `Agent` call, never inherited.
- **A resource another branch holds gets a coordinator of its own** — a child
  session whose only job is the hand-over with that branch's session. For a
  board another agent is publishing, the coordinator takes "add this and this"
  from the lead and cherry-picks between the branches so the board's history
  stays one line.

`.claude/skills/mammoth/notes/subagents.md` holds what earlier orchestrated runs
measured about brief size, waves over files and restarts.

## The context budget

The session compacts on its own near 370k, so the relay notices are read as two
marks rather than as offers to relay:

- **The first (330k)** — start nothing big from here.
- **The second (350k)** — finish the big thing in flight, and bring the plan
  file current so the session that wakes after compaction can find its place.

## This file is the lead's to change

The lead edits this skill as the run teaches it, without asking, on the
operator's standing word:

> Я ЗАРАНЕЕ ДАЮ РАЗРЕШЕНИЕ АГЕНТУ МЕНЯТЬ СВОЙ СОБСТВЕННЫЙ СКИЛЛ

A change to the body goes in place; a change to `description:` goes through a
staged copy, as `.claude/rules/staging.md` has it.
