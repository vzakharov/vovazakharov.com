# Retired frames

Only the latest bite's frames stay on the live branch; a bite's go when the
next one commits its own. Each row's last commit still holds them:

```
git ls-tree -r --name-only <sha> docs/remove-before-merging/frames/<dir>
git show <sha>:docs/remove-before-merging/frames/<dir>/<file> > <file>
```

| Directory         | Files | Last commit containing it | Note                                                               |
| ----------------- | ----- | ------------------------- | ------------------------------------------------------------------ |
| `bite-4/`         | 8     | 6f1e193a9f                |                                                                    |
| `bite-5/`         | 22    | 6f1e193a9f                |                                                                    |
| `bite-6/`         | 18    | 6f1e193a9f                | `phoneL-butterfly-crosses-one-on-a-cap.png`                        |
| `bite-7/`         | 38    | 6f1e193a9f                |                                                                    |
| `bite-8/`         | 29    | 6f1e193a9f                |                                                                    |
| `bite-9/`         | 27    | 6f1e193a9f                |                                                                    |
| `bite-10/`        | 24    | 6f1e193a9f                | `sound.md`, the drum and note render report                        |
| `bite-10-review/` | 14    | 6f1e193a9f                |                                                                    |
| `bite-11/`        | 8     | 6f1e193a9f                |                                                                    |
| `bite-11-review/` | 6     | 6f1e193a9f                |                                                                    |
| `bite-12/`        | 146   | 6f1e193a9f                |                                                                    |
| `bite-12b/`       | 46    | 4d1112afaa                |                                                                    |
| `bite-13/`        | 26    | 28b2b66911                | `f-tabL-sun-dimmed.png`, cited in to-check                         |
| `bite-14/`        | 34    | e3a77fb976                | `operator-chanterelle-mouse.png`, cited in bite-14.md and to-check |
| `bite-15/`        | 18    | 28a6277009                | `w4-*.png`, `r7-tabL-*.png`, cited in to-check                     |
| `bite-16/`        | 9     | 20d0fd4df3                | `tufts-turned-*.png`, cited in bite-16.md                          |
| `bite-17/`        | 22    | ab42be53f5                | `end/`, cited in bite-17.md                                        |
