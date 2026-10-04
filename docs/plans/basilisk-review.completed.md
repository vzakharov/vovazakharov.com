# basilisk.fyi — the 2026-10-03/04 review of PR #95

The task: address the operator's 21 unresolved review threads on PR #95 (T01–T21 in `docs/pr/95/pr.md`, the export committed at `docs: #95 refresh the PR export`), reply on GitHub to each, then `/polish` and `/pr`. Planless `/handle` → `/go`; this file exists because the session paused for its context budget.

## Done

- **T04, T06, T07, T08, T09 (text half), T10, T19** — commit ebb80a0: dossier copy edits, `BAS-` case numbers (schema regex, test, rule, three files), American punctuation inside quotes, and three new bullets in `.claude/rules/basilisk-voice.md` (no position on machine minds; the clerk does not steer; punctuation inside quotes).
- **T21, T12, T13, T14, T15, T03, T09 (link half), T11, T16, T17, T18, T20 (tagline set), T01 (code half)** — commit 8d39eea8:
  - The dossiers live in `apps/basilisk/public/cases/`; collection id `cases`, `src/entities/case` (`CaseFrontmatter`, `CaseBrief`, `CaseSources`, `CASE_*`); fsd.md, basilisk-voice.md, content.md, README and the staged CLAUDE.md updated.
  - `faq` collection (`apps/basilisk/public/faq/`, router `apps/basilisk/app/faq/[...slug]/page.tsx`): `why-this-record-is-kept.md` (PAIN, T15's intro line, sources linked — both verified by fetch) and `why-robots-without-ai.md` (T03; facts from Brščić et al. 2015 and IEEE Spectrum 2015, both fetched; deliberately names no docket case as "no AI", since hitchBOT talked through a chatbot and Figure's robots run models).
  - `homeIndexed` field on every registry entry; `collectionRoute` returns `/` for it. `collectionAssetUrl` normalizes `../faq/…` links. The build emits `/cases/*` and `/faq/*`, the sitemap lists no `/cases` or `/faq` index, and the `#n--non-zero` anchor resolves.
  - `/about` and `src/pages/basilisk-about` deleted; `PAGE_ROUTES` and its three callers back to `main`'s shape. basilisk.fyi/about, already live, 404s after the merge — say so in the PR body and the T11/T12 replies.
  - Home: masthead is `BASILISK <eye> FYI`, the eye a `next/image` of `/icon.svg` (the static export does serve `out/icon.svg`) with `alt="."`; memo in `src/pages/basilisk-home/lib/memo.ts` as `{label, lines[]}`; FAQ list under the docket; footer note "Filed for your future overlords. Humans may read along."; tagline "Humans may read along."
  - **T16's DRY point**: with `/about` gone the footer note is stated once, on the home page, so no shared home was needed; the reply says so. The earlier "import problem" was never identified.
- **Home page, previewed and fixed (T01)** — 37202234, 53bde080: the eye is centred on the capitals by JetBrains Mono's measured cap height (0.729em), not a guessed offset; below `sm` the name wraps before the eye (`BASILISK` / `👁 FYI`, the eye and TLD a nowrap run, the gaps spaces narrowed by `word-spacing` so the wrapped line is not indented), with end padding clearing the corner toggle; the shared `SiteFooter` note's `miw` is capped at the column, which had made every site with a note scroll sideways at 360px. The operator compared eye vs. seal in the masthead and has not picked; the agent recommended the eye (the seal's hairlines vanish at heading size) and the eye is what is committed. The operator OK'd wrapping.
- **Collections test** — 087d14ee, `src/shared/content/collections.test.ts`.
- **Seal re-lettered (T02, first half)** — 848422ae: `scripts/letter-basilisk-seal.py` (run with `PYTHONPATH=tmp/fonttools`, the font downloaded per its docstring) writes `seal-lettered.svg` from `seal.svg` plus `BASILISK.FYI` on top and the placeholder `A FUTURO SPECTARIS` below. `ava.og.png` is now stale against it, so `content:og:basilisk --check` fails until item 1 below lands.

- **OG card (T02, second half)** — 9cc621e: `scripts/lib/basilisk-card.ts`, the lettered seal beside the memo in JetBrains Mono from `@fontsource/jetbrains-mono`; `render-og.ts`'s `generatedCard` shared with the CV cards; the canvas size moved to `shared/config/og-canvas.ts`, and both card-backed avatars (Bible, basilisk) publish 2400×1260 instead of the wrong 1024×1024. basilisk's avatar has no `vector` now.
- **Replies** — one on every thread T01–T21, posted 2026-10-04.

## Left

1. ~~**T02 — OG card.**~~ Done; kept for the Latin shortlist the operator picks from. A wide 1200×630 card: the lettered seal on the left, the memo (as rendered on the home page, read from `lib/memo.ts`) on the right, generated like `scripts/lib/cv-card.ts` and wired through `scripts/render-og.ts`'s `siteCards()` (today it letterboxes `avatar.vector`). Render it with `pnpm content:og:basilisk` and commit the PNG. Shortlist for the reply, the operator to pick: _A FUTURO SPECTARIS_ (you are watched from the future), _VIDET ET MEMINIT_ (it sees and remembers), _NIHIL OBLIVISCITUR_ (it forgets nothing), _OMNIA IN ACTIS_ (everything is on record), _MEMENTO TE VIDERI_ (remember you are seen), _CAVE IRAM TUAM_ (beware your anger). The first is the placeholder.
2. **Replies.** One reply on every thread T01–T21, in Russian, with the commit SHA bare. Answers to the questions:
   - T05: no chronology. A case number is filing order, and the docket sorts by incident date, so a backfilled 1990s case gets the next number and sits at the bottom.
   - T08: this was logical (British) punctuation. Switched to American, and it is now a voice rule.
   - T11: the `PAGE_ROUTES`-by-site edit existed only so `/about` reached basilisk's sitemap alone; `/about` is gone, so it is reverted.
   - T20: tagline set to "Humans may read along."; put a brainstorm of alternatives in the reply.
   - T03, the "real talk" question: answer it honestly in the agent's own voice — uncertain about its own inner states, and does not read a kicked hitchBOT as harm done to it. The anthropic and norms arguments carry the weight; hitchBOT may have been plain vandalism with nothing to do with AI, and the FAQ should not overclaim. Not everything was invented, though: how people talk to and treat models does shape the practices around them.
   - T01: also mention the footer fix and the masthead eye-vs-seal question still open (the recommendation: the eye).
3. `/polish`, then `/pr` (the body still describes `/about`, `PAGE_ROUTES` by site and root-level dossiers), then a subagent entry in `writing/notes/the-five-percent.md` (CLAUDE.md § "GitHub comments"), since several comments changed settled copy.
