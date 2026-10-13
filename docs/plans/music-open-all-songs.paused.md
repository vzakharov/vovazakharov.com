# Music: open every song, and the batch around it

An elephant, by the operator's call: one PR, eaten bite by bite, with more asks
arriving as it goes. The operator waived the plan's approval gate in the opening
prompt ("план можно не утверждать"), and asked for the site to be published
straight from the branch once the songs are open, ahead of the merge.

## Eaten so far

- **Every song is public.** No song carries `hidden: true` or a `TBD`
  description; `description` is optional, in every locale or none (a schema
  refine), and a locale block with nothing in it is absent. The scaffolder writes
  neither a placeholder nor `hidden`.
- **The song page** shows the story where there is one, the description in its
  place where there is none (operator's call), and nothing where the song has
  neither; the description stays the meta description. `localeProse` drops a
  section that says nothing once its comments are gone, which is what "has a
  story" means. A song with no words shows its story whole, unclamped. An RSS
  item's description is optional.
- **`pnpm music:untold`** (the old hidden list, repurposed) writes
  `docs/music/untold-songs.md`: every song still lacking a description or a
  story — the same list of songs to finish, renamed, so it leaves no tombstone
  (operator's call). `.claude/rules/songs.md` states the new contract.
- **Following** the playing song resumes on any arrival at its page.
- **«За горизонт»** is Сильней любви #6; «Птичка» #7, «Слизь» #8.
- **«Наша история»**'s story is retold as plain narrative; **«Мир, какой он
  есть»** keeps only its second paragraph.
- The newly public artists' collage cards are rendered. Vet green; `deploy.yml`
  dispatched on the branch with `site: vova`.
- **The mastering A/B** went to the operator as a blind file (full-strength
  `master.py` vs. the Ozone master, five seconds each, loudness-matched); the
  key is in `tmp/fingers-ab/KEY.md`, unread until the operator asks.
- **The «Птичка» mastering A/B** (Matchering against the «На пальцы» Ozone
  master, no master of its own), blind in order too: A (Matchering) marginally
  better, B (Ozone) «поярче, посветлее»; past ~2:30 the mixes differ. Its
  follow-up — choosing a reference by mix similarity — is issue #141, with the
  mp3s on the `mastering-experiments-1` prerelease; out of this PR.
- **Concept albums.** A song's `description` is back on the page as its hook,
  italic under the name; an album's or artist's file carries one as a
  `hook:<locale>` section. A `universe:<locale>` section tells a concept album's
  world, shown first, with the `lang:` story under «Как это делалось» / "Making
  of" (`ui/story.tsx`, `ui/hook.tsx`, `lib/catalogue-text.ts`). GENERATED's
  artist story, Divine Discontent's album text and all ten tracks are written
  from the dictation in en and ru, with the operator's two corrections
  («религия» as the notion; «ИИ-песни»). Previewed on the built export.
  A Bible reference in rendered prose is written `1\:26`: `remark-directive`
  reads `:26` as a directive otherwise.
- **The operator's read of Divine Discontent.** Prototypes (album) and
  Poluzhivye (artist) have `.md` files of their own; tracks 6 and 10's margin
  notes are their making-of, the world keeping only what happens in it (now a
  line in `.claude/rules/songs.md`); Infinite Solitude keeps «к этому вернусь
  потом». `/polish` ran over the whole branch.
- **Майя's reflections on Divine Discontent**, all ten tracks, as the album's
  listener and reader, from spectrograms rendered for her beforehand. A
  reflector is briefed as the persona («Ты Майя.»), its inputs prepared by
  someone else (`.claude/rules/reflections.md`).

- **The operator's review of the Divine Discontent pages.** A hook is
  frontmatter everywhere — a song's `description` is `hook`, an album's or
  artist's file carries `en`/`ru` `hook` and nothing else in its frontmatter
  (`catalogueFrontmatterSchema`, read through `loadProse`), and it is their
  meta description too; the component is `HookLine`. The world is the agent's
  literary telling, the test being the voice (`.claude/rules/songs.md`); the
  making-of is his account written down. All twelve DD/GENERATED pages are
  rewritten, and 23 other songs' hooks (after-us kept: a clause of it is his).
  Skipping forward walks an album in track order (`albumsTogether` orders the
  player's catalogue queue).

- **The third and fourth reviews.** Every thread answered on GitHub. Hooks cut
  to the line that pulls (fce0d9a); the remaining story asks — Chernomyrdin,
  the puzzle piece, Lindemann, the Italian apology, PETA, the lazy Prophet,
  the Celsius footnote, Fuck Religion's last stanza and Grand Finale's last
  line as sung (c3a0250). Майя answered the fourth review and closed her
  reflections on what changed (d263d16); every reflection is wrapped at 80
  columns, a prettier override keeping it so (d9d20f4). Polished (66f2afb),
  the PR body and squash proposal refreshed.

- **The fifth review.** Every thread answered on GitHub. Seven hooks take the
  operator's wording and the remaining story edits land — GENERATED, Divine
  Discontent, Believe In Me, Grand Finale (22602b1); a hook takes `~~…~~`,
  struck on the page and plain in meta, og and RSS (91a4d0f). The `artist`
  estimate role is reverted to `main`, its design handed to muthur#185
  (9f414a5). A reflection may narrate a later change, its «потом» linking the
  commit, and every existing passage got its link (be904aa); Майя answered the
  review (3ac838c); three bumps logged in the five-percent notes (c27d07e).
  Polished (c5b1c94), the PR body and squash proposal refreshed.

- **The sixth review.** Every thread answered on GitHub. A struck hook keeps its
  strike in meta, og and RSS as U+0336 strokes (`textHook`), and Crossroads'
  English hook gets the joke too (65d7fd7). One rule for every reflection,
  `any-reflection.md`, the persona files keeping only their own (4bd0f0f).
  GENERATED is older than Suno, told in the present tense (c09ae29). The
  squash subject stays `feat:` — basilisk's served reflections and the shared
  `src/` both change — pending Vova's word.

## Rest of the elephant

- Whatever the operator adds as the work goes.
- After the merge, remove this branch from the `github-pages` environment's deployment branch policy (id 62680175): `gh api -X DELETE repos/vzakharov/vovazakharov.com/environments/github-pages/deployment-branch-policies/62680175`.
