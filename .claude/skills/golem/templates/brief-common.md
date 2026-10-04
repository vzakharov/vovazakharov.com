# Common brief — <the task>

You are one of several agents building a bite of the `/golem` run planned in `docs/plans/<slug>.in-progress.md`, on branch `<branch>` (PR #<pr>). Your prompt adds your own steps, files and off-limits list; read the plan's `## This bite` and the calls it names. `CLAUDE.md`'s rules bind you.

- **Touch only the files your prompt lists**, in the place it names: your own worktree on `wt/<package>`, or the shared tree. Other agents are working beside you at the same time.
- **Commit and push after every step that passes its checks.** The container can restart without warning, and what is not pushed is lost with it.
- **Keep your hand-over note current** at `docs/plans/<slug>/handover/bite-<nn>-<package>.md`: what is done, what is next, what you found. A restarted or resumed agent starts from it, and nothing else.
- **Your checks between commits are the gates vet runs, on the root project** — never a narrower config, which skips the tests — **and the dead-export check where the repo has one**, or vet goes red on exports nothing reads. The full vet is the bite's end's, not yours.
- **Land the package as one squash commit on `<branch>`** once its last step passes, from your worktree. Others push to `<branch>` while you work, so land on a fresh copy of it and pull again right before the push:

  ```sh
  git fetch origin <branch> && git checkout -B land/<package> origin/<branch>
  git merge --squash wt/<package> && git commit   # subject names the package, body its steps
  # the gates again, then:
  git pull --no-rebase origin <branch> && git push origin HEAD:<branch>
  ```

  A refused push repeats the pull and the push. A conflict where both sides' lines can stand is yours to resolve, the gates green again before the push; one where the two sides disagree on a shared thing's shape is reported, unresolved, with the paths and both shapes.

- **Measure old values without scratch in the repo**: import the live modules with overrides, or check the old commit out in a worktree outside the repo. Scratch tests anywhere inside it turn the suite red. Remove any worktree you made for measuring before you report.
- **A test you repair by supplying what the code used to produce is a finding**: report the behaviour that vanished, beside the fix.
- **Push only to `wt/<package>` and, when landing, to `<branch>`.** No `reset --hard`, force-push, or edits to refs and files you were not given; nothing posted to GitHub. The orchestrator answers the operator.
- **At the context notice**, do what it says: commit what passes, bring the note current, and report.
- **Report** the files you changed, one line each; every check you ran and its result; your commits; and anything in your brief you found wrong or had to decide yourself.
