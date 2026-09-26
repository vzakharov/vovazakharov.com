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

## The loop's contract

- **The loop lived in the plan, and that worked.** Writing the cycle into the
  plan as its own section made every successor read it on attach, with no
  extra file to load. The skill should write that section itself, from its
  own template, rather than relying on the planning session to write it.
- **Standing constraints travel verbatim, or they stop applying.** The relay
  summary's § 1 carried the operator's rules (never merge, the frozen
  five-percent file, ask only about the unrecoverable) word for word, and the
  plan repeated them. The skill should keep one home for them, the plan, and
  have each relay point at it rather than re-quote it, so a rule the operator
  adds mid-run gets written down once.
- **An operator message that arrives mid-run is a contract change.** This
  file exists because of one. The skill needs a step for it: write the
  message into the plan's standing rules, and into the relay's § 1 if a relay
  is pending, before going on with the bite.

## Friction found

- **`elephant.md` and `/go` disagree about vet.** "A bite leaves `vet` green"
  (`plan/elephant.md` § "A bite") against "do not run `./scripts/vet.sh` per
  commit; that is `/finalize`'s job" (`go/SKILL.md` Step 2). An autonomous
  loop has no operator review between bites to catch a red tree, so the
  skill should run vet once at each bite's end, before `/polish`.
- **The successor starts on the target branch already.** `create_session`
  with `source_revision` checks out the branch, so `/from-branch` Steps 2–4
  (drop the auto-branch) are a no-op every time. The skill can say so and
  skip them.
- **The context threshold is not measurable from inside a session.** The
  loop says a `/handle` session takes the next bite "when its context is
  still under ~140k tokens", but an agent can't read its own context size;
  only the context-budget hook's notice reports it. The skill should key the
  decision on that notice (none yet → take the bite) rather than on a number.
- **MCP tool names change mid-session** (a server reconnects under another
  id). Relay and `create_session` calls have to be looked up by the current
  name, never taken from an earlier call in the transcript.
- **`gh pr edit` fails** on GitHub's Projects-classic GraphQL deprecation;
  `gh api -X PATCH repos/<o>/<r>/pulls/<n> -F body=@<file>` works. The skill's
  PR steps should use the REST form directly.

## Quality levers

- **Spike the engine's risky seam before writing the plan's bite.** Reading
  Phaser 4's `ScaleManager` showed that `Scale.RESIZE` sizes the canvas in CSS
  pixels and ignores `devicePixelRatio`, which would blur every retina
  tablet — the primary device. An hour of research before bite 1 surfaced
  nothing like this; ten minutes in `node_modules` did. The skill should
  point bite 1 at the dependency's source for its core seam (sizing, input,
  lifecycle) before any drawing code is written.
