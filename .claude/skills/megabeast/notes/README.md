# megabeast — notes toward a skill

Not a skill yet: no `SKILL.md`, so nothing loads it. The working name is for
the skill that would run a whole elephant autonomously — plan, then per bite
`/go` → `/relay` review → `/relay /handle` → … → `/relay /finalize` — the
loop `docs/plans/mushroom-game-syama.*.md` § "How this elephant is eaten"
spelled out by hand for PR #57. Every session in that chain adds what it
found that would make the loop repeatable and better, at its end and before
its relay; the operator asked for it in these words:

> одна штука которую хочу чтобы ты держал, в том числе между сессиями --
> файлик будущего скилла, который будет это всё автоматизировать (рабочее
> название megabeast). Не сам скилл, а именно соображения с тем, что ты нашёл
> по пути, что помогло бы сделать этот процесс повторяемым и на лучшем уровне

> заполнять в конце каждой сессии перед релеем

A note already here that a later session sharpens gets rewritten in place,
not answered with a second one.

Each note: what happened, and what the skill should do about it.

A note goes in the file for its theme. A file nearing ~450 lines is
condensed first, and split along a seam only when condensing is not enough;
a new file gets a row here. The single file these replaced is recorded in
`.claude/skills/megabeast/notes.retired.md`.

| File                                             | Theme                                                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| [contract.md](contract.md)                       | The loop's contract: the plan as its home, standing rules, the model, operator input mid-run           |
| [pickup-and-relay.md](pickup-and-relay.md)       | Attaching a successor, the stale branch, the context budget, the depth cap, what a relay carries       |
| [subagents.md](subagents.md)                     | Orchestrating: briefs, waves over files, a subagent's context, pauses, container restarts, the tail    |
| [gates.md](gates.md)                             | Vet and the quick gates, the order of a bite's end, `/polish`'s scope, tooling traps                   |
| [play-run-and-frames.md](play-run-and-frames.md) | The play script, stepping and shooting, runtime state and sound, the orchestrator's own look at frames |
| [quality.md](quality.md)                         | Review practice, sweeps and what they measure, finding classes, design levers                          |
