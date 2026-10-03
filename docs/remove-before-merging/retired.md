# Retired working notes

A finished bite's working notes — briefs, hand-over notes, specs, review and
handling logs — leave the live branch once the bite is folded into the plan,
which keeps what they settled (`docs/plans/mushroom-game-syama/bite-<nn>.md`).
Each row's last commit still holds it:

```
git ls-tree -r --name-only <sha> docs/remove-before-merging/<dir>
git show <sha>:docs/remove-before-merging/<dir>/<file>
```

| Directory        | Files | Last commit containing it | What it was                                                                     |
| ---------------- | ----- | ------------------------- | ------------------------------------------------------------------------------- |
| `atmosphere/`    | 1     | 6f1e193a9f                | bite 7's look spec (`look.md`)                                                  |
| `bite7/`         | 1     | 6f1e193a9f                | bite 7's working notes                                                          |
| `bite8/`         | 4     | 6f1e193a9f                | bite 8's briefs and notes                                                       |
| `bite9/`         | 10    | 6f1e193a9f                | bite 9's briefs and notes                                                       |
| `bite10/`        | 8     | 6f1e193a9f                | bite 10's briefs and notes                                                      |
| `bite-11/`       | 39    | 6f1e193a9f                | bite 11's briefs, specs and hand-over notes                                     |
| `bite11-tail/`   | 1     | 6f1e193a9f                | bite 11's tail brief                                                            |
| `bite-12/`       | 104   | 6f1e193a9f                | bite 12's briefs, specs and hand-over notes                                     |
| `bite-12b/`      | 40    | 69ac57a231                | bite 12b's specs, waves log, tail and review-handling notes                     |
| `bite-13/`       | 13    | 4d1112afaa                | bite 13's briefs (packages, review) and hand-over notes                         |
| `bite-14/`       | 34    | 8fcde14a2e                | bite 14's specs, briefs, map, scratch plays, hand-over notes                    |
| `bite-15/`       | 23    | acfb76a783                | bite 15's specs, briefs, hand-over notes (`c.md` moved to `cost-hook-issue.md`) |
| `handle-bite4/`  | 1     | 6f1e193a9f                | bite 4's review handling                                                        |
| `handle-bite6/`  | 4     | 6f1e193a9f                | bite 6's review handling                                                        |
| `handle-bite7/`  | 4     | 6f1e193a9f                | bite 7's review handling (`brief-common.md`)                                    |
| `handle-bite8/`  | 3     | 6f1e193a9f                | bite 8's review handling                                                        |
| `handle-bite9/`  | 4     | 6f1e193a9f                | bite 9's review handling                                                        |
| `handle-bite10/` | 3     | 6f1e193a9f                | bite 10's review handling (`groups.md`)                                         |
| `handle-bite11/` | 2     | 6f1e193a9f                | bite 11's review handling                                                       |
| `review-bite10/` | 1     | 6f1e193a9f                | bite 10's review brief                                                          |
| `review-bite11/` | 1     | 6f1e193a9f                | bite 11's review brief                                                          |

The frames have a tombstone of their own: `frames/retired.md`.
