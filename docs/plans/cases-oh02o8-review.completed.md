# PR #104 review round 2

The task: the operator's review 5425987795 on PR #104 (submitted 2026-10-06
09:00:34Z), six comments.

## Done

- `prompter` role ported from vzakharov/muthur@61e9a0a (77801f9) — comment 4193333672.
- The docket is known before the search as a list, dossiers read in full only
  while filing (c1fe625) — comment 4193350994.
- Five-percent entry fixed (8679928) — comment 4193412486; this round's two
  bumps recorded (d2ee570).
- Reflections colocated as `apps/basilisk/public/cases/<slug>.reflections.md`,
  an `isDocumentFile` companion filter in `collections.ts` used by the loader,
  the PDF render and the site card, the directory's `CLAUDE.md` now
  `.claude/rules/clerk-reflections.md` (4e74587) — comment 4193400757.
- Every thread answered on GitHub, the reflection thread (4193368876) as the
  Clerk.

## Left

1. **Filing date** — comment 4193382483. The card dropped the incident date
   (3474b50). The operator: «я бы не сказал что только карточке». Proposed in
   chat, waiting on his answer: a required `filed:` date on cases, shown on the
   card and the case page, and used as the sitemap's `lastModified` for cases
   (today the incident date — 2015 for hitchBOT); BAS-0001–0004 back-filled as
   2026-10-05 (PR #95's merge), BAS-0005 as the date it merges;
   `/file-basilisk-case` writes it.
2. **Refresh** the PR body (card date, prompter port, colocation) and the squash
   proposal, then `/polish`.
