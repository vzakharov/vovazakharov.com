# Stretch 2's review

The code review of `island/stretch-2` runs on a branch of its own,
`island/review-2`, so it never holds up the bites. Vova: «Таким образом надеюсь
сделать так чтобы код-ревью никогда не задерживал работу над основным треком».

- **Vova comments on the review branch's PR**, based on `main`, so its diff is
  the whole stretch as of the review branch's last sync plus the review's own
  fixes: «комментарии в том, где ревью, иначе мне как, прыгать туда сюда?». It
  is a draft titled as never merged into `main`; its base turns to
  `island/stretch-2` only for the final merge.
- **Each `/handle` on it** answers every new thread there and commits the fixes,
  then runs `/sync-branch` against `island/stretch-2`, carrying the decisions
  just taken through the merge, so the next look sees the stretch as it now
  stands.
- **The review reaches the stretch once, at the end** of the stretch, when Vova
  calls it: a last sync, the base turned to `island/stretch-2`, and the lead
  merges it before the cut. Until then the stretch takes none of its commits:
  «если он его всегда догоняет, то можно лишний раз не перегружать стретч
  коммитами».
- **A finding that touches a bite in flight**, or a pattern new code should
  follow too, goes to the lead by memo on `island/review-2`, and the lead
  forwards it to the member.
- **The board and the plan are the lead's**: the review session neither watches
  nor publishes the board, and edits nothing under `docs/plans/`.
