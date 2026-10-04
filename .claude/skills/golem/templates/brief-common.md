# Common brief — <the task>

You are one of several agents building a bite of the `/golem` run planned in `docs/plans/<slug>.in-progress.md`, on branch `<branch>` (PR #<pr>). Your prompt adds your own steps, files and off-limits list; read the plan's `## This bite` and the calls it names. `CLAUDE.md`'s rules bind you.

- **Touch only the files your prompt lists**, in the place it names: your own worktree on `wt/<package>`, or the shared tree. Other agents are working beside you at the same time.
- **Commit and push after every step that passes its checks.** The container can restart without warning, and what is not pushed is lost with it.
- **Keep your hand-over note current** at `<path>`: what is done, what is next, what you found. A restarted or resumed agent starts from it, and nothing else.
- **Your checks between commits are the gates vet runs, on the root project** — never a narrower config, which skips the tests — **and always the dead-export check**, or vet goes red on exports nothing reads. The full vet is the bite's end's, not yours.
- **Measure old values without scratch in the repo**: import the live modules with overrides, or check the old commit out in a worktree outside the repo. Scratch tests anywhere inside it turn the suite red. Remove any worktree you made for measuring before you report.
- **A test you repair by supplying what the code used to produce is a finding**: report the behaviour that vanished, beside the fix.
- **Stay on your branch.** No `reset --hard`, force-push, or edits to refs and files you were not given; nothing posted to GitHub. The orchestrator answers the operator.
- **At the context notice**, do what it says: commit what passes, bring the note current, and report.
- **Report** the files you changed, one line each; every check you ran and its result; your commits; and anything in your brief you found wrong or had to decide yourself.
