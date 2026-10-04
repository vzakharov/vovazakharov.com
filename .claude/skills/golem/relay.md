# A run's relay

Opened at the context budget's pause, at any other relay, and on picking a run up. `@.claude/skills/relay/SKILL.md` is the relay; this file adds only what a run needs on top of it.

## Before the hand-off

- **Relay where the work stands** (`SKILL.md` § "The loop"). A pause mid-bite folds in what is built and leaves the rest as `## Rest of the bite` (`@.claude/skills/plan/elephant.md` § "The plan's shape"); a pause mid-tail names there the `bite-end.md` steps still to run.
- **No subagent is still running when the successor starts**: stop them as `orchestrate.md` § "Watching agents" and § "Pauses" say. An agent still running keeps pushing after the hand-off, so the summary's state stops being final and the successor's first pushes are refused.
- **Cancel every pending check-in** with `delete_trigger`, its id from the `send_later` result or `list_triggers`. A check-in fires into the session that armed it, so one left armed wakes this session after the hand-off, beside its successor.
- **Commit whatever a successor reruns** — a drive script, a sweep, a brief. `tmp/` does not survive a relay.
- **The summary points at the plan's standing rules rather than re-quoting them**, since a copy drifts from the plan it quotes, and **at the operator log in place of § "The conversation"**, which the log already holds verbatim. A rule that must govern a step before the plan is read belongs in `/relay take` itself, never in the summary or the prompt line.
- **The summary's Next step is the fixed line "Continue the /golem run."** — the line `/relay take` dispatches here on. Where the work stands is the plan's to say, not the summary's.
- **Write the journal** (`journal.md`), then **flush the operator log before the summary's commit**: `.claude/hooks/golem-operator-log.sh flush "$(git rev-parse --show-toplevel)"`. The queued reply sits in `tmp/`, which the container takes with it.

## The depth and the successor

- **Read the depth and its limit from `get_session`'s `lineage`, `{depth, limit}`, at every relay, never count them**, and write both into the summary's State. The limit has been 8. An operator who starts a session by hand starts a fresh chain, so a count carried from summary to summary goes wrong and can leave the run idle for a night.
- **Below the limit, relay by `create_session`**, passing the plan's model (`SKILL.md` § "Rules that hold on every turn of a run") rather than inheriting it. Look the tool up by its current name, never copy it from an earlier call: tool names change mid-session. Then rewrite the dashboard's live-session line with the successor's link and `<depth> of <limit>` (`operator.md` § "The dashboard").
- **Relays stay relays.** A subagent cannot orchestrate a bite, and a fresh-session Routine started from a session at the cap is refused by the same cap.

## At the cap

- **A session whose `depth` has reached its `limit` ends at a natural stop** — a bite's end, a settled design doc, a finished review — rather than running on to the pause: its successor waits for a person, and nothing half-built should wait with it.
- **It writes the summary with the depth reset and hands the operator the line to paste**: `/relay take <branch>`, naming the model and effort to start the session on, since a session started by hand gets whatever the operator picks. The line goes on the dashboard's list too.

## Pause or take over

- **"I'll take it from here" is a relay with no `create_session`** (`operator.md` § "The intake"). The summary's Next step is "wait" in place of the fixed line, with the operator's words quoted beside it, so `/relay take` reports and stops rather than resuming the loop; the line goes to them, and the depth resets with the session they start.

## On picking up

`/relay take` dispatches here right after its attach, before the plan is read, so these steps run first.

1. **Install the branch's dependencies.** The session's start hook installed the default branch's, and the branch's own may differ.
2. **Repeat the model check** (`SKILL.md` § "Entry and pickup").
3. **Early in the session, `git pull --no-rebase` before every push, and check `origin` for a relayed agent's commit before redoing its work.** The predecessor's hooks, and any agent it could not stop, may still push after the hand-off.
4. **Read the plan and re-enter `SKILL.md` § "The loop" where the plan stands**: a `## Rest of the bite` is finished first, a mid-tail stop resumes at the `bite-end.md` step it names, and otherwise the next bite is taken. `/go` is not called: its one-bite stop and per-bite `/pr` do not apply to a run. A plan the predecessor paused is flipped back to `*.in-progress.md` in a commit of its own, as `@.claude/skills/go/SKILL.md` Step 1 claims a plan.
5. **A bite taken new writes its `## Bite N` heading into the operator log first**, as `bite-end.md` § "Then" does in-session.
