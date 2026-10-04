The loop section that opens a run's plan, right under its title (`start.md`). Copy the block, fill the `<…>`, and drop the example rule and call.

```markdown
## How this run is eaten

This plan is a `/golem` run — open `.claude/skills/golem/SKILL.md`, whose table says which of its files the current step needs.

1. Each bite is taken into `## This bite`, its calls settled before any brief, built by subagents, and seen working by the run's own means.
2. Each bite ends in the tail (`bite-end.md`): the operator's comments taken in, the gates, the review, the fold into this plan, the dashboard.
3. The session goes on into the next bite while it has room; the context budget's pause relays, wherever the work stands.
4. The last bite ends in `/finalize` without `and merge`.

- **Model:** `<model id>`, passed to every `create_session` and `Agent` call, never inherited.
- **Bite size:** counted in work packages, one agent's step each, before a bite is taken; more than two sequential packages is two bites.
- **Relay depth:** read from `get_session`'s `lineage` at every relay, never counted (`relay.md`).
- **Beside this file in `docs/plans/<slug>/`:** `decisions.md` (the calls), `operator-log.md`, `ideas.md` once an idea arrives, and one `bite-<nn>.md` per bite folded.

### Standing rules

The operator's rules, verbatim, each with where it was said. This is their one home: a relay points here and never re-quotes them, and a rule added mid-run is written here once.

- «<the operator's words>» — <link to the log entry or comment>

### Calls

The run's calls live in `decisions.md`, in the order they were made, each a paragraph of its own whose number is escaped, so the formatter does not renumber them into one list:

1\. **<the call>** <why, and what it overturns if anything>.
```
