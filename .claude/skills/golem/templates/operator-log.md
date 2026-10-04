# Operator log — <the task>

The run's whole conversation with the operator, verbatim and in order (`.claude/skills/golem/operator.md` § "The operator log"). `.claude/hooks/golem-operator-log.sh` appends the chat: `**Operator** · <time> · <session link>` for each message, `**Run** · <time>` for the reply. `scripts/golem-log-pr.sh` appends the PR's comments as `**Operator on the PR** · <time> · [<where>](<link>)`, with a hidden key that keeps a re-run from logging one twice. Each entry's text is quoted below its line. A bite's start writes its `## Bite N` heading; bite 0 is the plan, up to the go-ahead.

## Bite 0

**Operator** · <YYYY-MM-DDTHH:MM:SSZ> · [session](https://claude.ai/code/session_<id>)

> <the opening `/golem` message, verbatim>

**Run** · <YYYY-MM-DDTHH:MM:SSZ>

> <the gate's reply, verbatim>
