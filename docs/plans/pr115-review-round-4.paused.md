# PR 115 review round 4 — paused

The task, as invoked: `/handle & finalize claude/music-catalogue-hidden-ldz252` — work the six unanswered posts (T31–T35, C04) of PR 115, then land-prep.

## Done

- T35 stanza dropped and T32 soft signs as ʼ — b339b93.
- T31 romanization smaller and fainter — 123aed8.
- C04: ghost-of-yesterday and lyoli unhidden; `pnpm music:hidden` writes `docs/music/hidden-songs.md`, run by `scripts/vet-songs.sh` — e518e33.
- T33 slug rule and the hidden rule in `.claude/rules/content.md` — 79281f6.
- `/polish` — 76d3532, 64b012c. Five-percent note — 107d988.
- Replies posted on all six; PR body refreshed.
- `/finalize` begun: staged `fsd.md` swapped in — 96faa5c.

## Left

- The rest of `/finalize`, from its quality passes (only the swap commit and the note are past the last polish), then vet, base merge (PR is `CONFLICTING` with `main`), sweep, ready, squash message, attestation.
- Known for vet: knip reports `songPageSlug` (`src/pages/music/lib/songs.ts`) and the `MusicAlbum` type in `src/shared/music-catalogue/index.node-safe.ts` unused — both predate this round.
- The swapped `.claude/rules/fsd.md` names a `song` segment in its `shared/` row; the segment is `music-catalogue`.
- Open with Vova, not blocking: T34 (whether Hamlet becomes the primary album of my-offence-is-rank and valentines-day) and T35 (whether the now back-to-back refrain loses one repeat).
