The block that opens a run's PR body, per `operator.md` § "The dashboard". Rewrite it whole each time, through `scripts/pr-body.py`'s pull and push. The list is in the operator's language; a kind with no items is left out, and an empty list reads "Nothing waits on you."

```markdown
## Where it stands

- **Bite in flight:** <N, its name> — <its step>
- **To see or use now:** <the Artifact's URL | a preview route | screenshots at `<path>` | `<command>`>, <how> — or nothing to see yet
- **Live session:** <link>, relay depth <depth> of <limit>
- **Last re-steer:** «<the operator's words, cut short>» → <where it landed in the plan>
- **Model:** <only when the model check raised it: the run is on `<model>`, below Opus at high effort, and may not hold up on it>
- **Updated:** <time>, at <bite N's end | a wave report>

### Waiting on you

- **Check by hand:** <what to do, and what to look for>
- **Taste call:** <the question> — took <option>; the alternative is <option>, and switching costs <cost> (`wt/<name>`)
- **Out of reach:** `<the exact command, a secret named by its variable, never its value>` — <what it is for, and what waits on it>
- **Parked:** <the failure> — tried <the attempts>; <what waits on it>
```
