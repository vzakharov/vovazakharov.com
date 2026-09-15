# PR #46: feat: sync the agent loop forward — /task, /polish, operator voice

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/46
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/update-muthur-k80c10
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-09-15T17:33:28Z
- **Updated:** 2026-09-15T17:36:25Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## Summary

- **The entry ladder routes on one question** — does the opening prompt ask for a change to this codebase? It does, and the work goes to the new `/task`, which makes the plan-or-not call itself; it does not, and the answer is the deliverable. This replaces the `plan or go:` opt-in, and `plan-or-go.md` retires with it.
- **`/issue` splits into transport and decision.** `/take-issue` exports and commits a thread and hands the number back, deciding nothing; `/issue` stays as a redirect. A new `.claude/hooks/prompt-issue-export.sh` does that export on `UserPromptSubmit` when a session's opening prompt ends in `#<N>`, so the thread is on disk before the agent reads the prompt.
- **The carve moves to `.claude/skills/plan/carving.md`**, loaded by `/plan` when work is beyond one PR and by `/go` to file what the plan proposed. Nothing is created at plan time — the plan file is already the gate.
- **`/polish` is the new home of `/dry` + `/tend-prose`**, with the scope resolution neither pass could do alone. `/go` Step 3 loads it, `/finalize` runs it ahead of its numbered steps, and the operator invokes it over work that took neither route. `polish:` joins the commit-type list as a branch-local type.
- **The session knows who it is talking to.** Startup is three hooks now — `gh-shim.sh`, `install-deps.sh`, `operator-voice.sh` — and the voice rule moves out of `/plainly` to `.claude/voice/`, with one entry file per handle. `check-skill-catalog.sh` widens from skill pointers to every `@`-reference into `.claude/` so CLAUDE.md's own imports are covered.
- **PR and issue exports stop growing without bound.** Review threads quote the reviewer's own line selection rather than GitHub's padding, the review section opens with a per-thread index, and past 400 rendered lines the bodies hoist into `threads/` and `comments.md`. `scripts/test_export_split.py` covers the layout and joins the vet fan-out.

Seven source commits triaged, six ported; the triage table with every verdict is below. `watermark.json` advances to `61715d0`.

## Triage

| Source commit | Verdict | Reasoning |
| --- | --- | --- |
| `d21aa0e` a comment body is text, not a path | take | The GitHub-comments section is identical here, and `-f body=@<file>` misfires the same way |
| `3c3ce16` name and greet the session's operator | translate | Taken whole; `install-deps.sh` ships upstream as a TODO stub and carries this project's `pnpm install --frozen-lockfile` instead |
| `2e673f4` make /handle dispatch to /go imperatively | take | Same wording, same failure mode |
| `1b24fe7` route the entry ladder, move the carve | translate | `carving.md` states the filing inline against `gh` and drops the dedupe pass, `/propose-issue` being declined here; the `/issue` redirect's no-number branch names `/task` for the same reason |
| `3af9da4` export the issue a prompt ends in | take | Hooks and `lib.sh` land verbatim |
| `5049066` split long exports into an index | translate (most) | The exporter and its new test land verbatim. The source's consolidation of its test lines into `check-muthur.sh` does not: that script keys on a catalog this repo declines, so it would exit 0 here and certify nothing — the two tests are named individually in this repo's own fan-out instead |
| `61715d0` extract the quality passes into /polish | take | Both passes and all three call sites are adopted here |

**Also declined**, recorded in `watermark.json` so the question does not come back: `scripts/check-muthur.sh`, for the reason `check-repo-identity.sh` already sits there. Every other `declined` entry was re-read and its condition still holds — `/propose-issue` in particular, this backlog still being one an operator reads in a sitting.

## QA Checklist

- [ ] `vet` — `./scripts/vet.sh` is green (run on this branch: all fourteen fan-out checks plus the build).
- [ ] `operator-voice` — `bash .claude/hooks/operator-voice.sh` names the operator and prints their entry (verified: resolves @vzakharov from the session token).
- [ ] `issue-export-hook` — a payload whose prompt ends in a real `#<N>` writes the export and emits context; one ending in nothing, or in a number that will not fetch, exits 0 without failing the turn (both verified).
- [ ] `exporter` — `python3 scripts/export-github-item.py <n>` writes a PR export whose review section opens with a thread index (verified against PR #42).
- [ ] `closure` — `bash scripts/check-skill-catalog.sh` passes, including CLAUDE.md's `@.claude/voice/voice.md` import.
- [ ] `settings` — a fresh session starts all three SessionStart hooks and all three UserPromptSubmit hooks without error.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `vet` | yes | yes | `scripts/vet.sh` |
| `operator-voice` | yes | no | needs a live `gh` token; run by hand |
| `issue-export-hook` | yes | no | no test file yet; a candidate if the hook grows |
| `exporter` | yes | yes | `scripts/test_export_split.py`, 25 tests |
| `closure` | yes | yes | `scripts/check-skill-catalog.sh`, in the fan-out |
| `settings` | no | no | observable only on a real session start |

---

## Comments

- **C01** @vzakharov (agent) — 2026-09-15T17:34:10Z — "Proposed squash title/body: ``` chore: rework the loop's ent…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-09-15T17:34:10Z

[https://github.com/vzakharov/vovazakharov.com/pull/46#issuecomment-5684993020](https://github.com/vzakharov/vovazakharov.com/pull/46#issuecomment-5684993020)

Proposed squash title/body:

```
chore: rework the loop's entry and quality passes, name the operator (pr #46)
```

```
The repo this one vendors its agent loop from moved, and four of its
changes are structural here. A new session's opening prompt now routes
on one question — does it ask for a change to this codebase? — rather
than defaulting to /plan, and the work goes to /task, which judges for
itself whether a plan is needed and whether that plan has to reach the
operator. The `plan or go:` opt-in it replaces retires with its page.

/issue splits along the seam it always had. /take-issue exports a
thread onto the branch and decides nothing; /issue stays as a redirect;
and a UserPromptSubmit hook does that export before the agent reads a
prompt ending in `#<N>`, so a session launched at an issue starts
holding it. The carve that /issue used to own moves to plan/carving.md,
loaded only by a plan that needs it — and, filing nothing until the
go-ahead flips the plan file, it makes untracked work splittable for
the first time.

The two quality passes get a home of their own in /polish, which
resolves the scope neither /dry nor /tend-prose could resolve alone:
both bottom out at unpushed work, so both read nothing on a branch
someone else wrote. /go and /finalize call it, the operator calls it
over work that reached neither, and a branch-local `polish:` commit
marks how far the last run got. Sessions also know who they are talking
to: startup is three hooks now, and the voice rule they serve moves out
of /plainly to .claude/voice/, one entry file per handle.

Underneath, PR and issue exports stop growing without bound — threads
quote the reviewer's own line selection, an index opens the review
section, and long exports hoist their bodies into sibling files — and
the reference check widens from skill pointers to every @-reference
into .claude/, which is what covers CLAUDE.md's own imports.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `scripts/vet.sh`:74 — unresolved — last: @vzakharov (human) 2026-09-15T17:36:20Z — "aren't these muthur-specific tests that are not supposed to…" → [↓](#t01)

<a id="t01"></a>

### `scripts/vet.sh`:74 — unresolved

```diff
@@ -70,7 +70,8 @@ scripts/run-parallel.sh \
… 1 line elided …
   notes='scripts/check-notes-length.sh' \
   skills='scripts/check-skill-catalog.sh' \
-  export='cd scripts && python3 test_authorship.py' || status=1
+  export-authorship='cd scripts && python3 test_authorship.py' \
+  export-split='cd scripts && python3 test_export_split.py' || status=1
```

**@vzakharov (human)** — 2026-09-15T17:36:20Z

aren't these muthur-specific tests that are not supposed to run for adopters?

---

## Timeline (status, references, and other events)

- **2026-09-15T17:33:30Z** @vzakharov — _mentioned_
- **2026-09-15T17:33:30Z** @vzakharov — _subscribed_
- **2026-09-15T17:36:25Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/46#pullrequestreview-5213628299.
