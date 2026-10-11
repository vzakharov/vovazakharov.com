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

## Rest of the elephant

- **Майя's reflections on Divine Discontent**, once its stories are agreed:
  «пусть Майя потом добавит свои размышления. Она тут не исполнительница, а
  слушатель/читатель. Но нужно будет создать спектрограммы и т. п.» — the
  spectrograms and the rest of what `maya-reflections.md` needs, first, for
  the ten tracks; she writes as a listener and reader, not as the singer.
- Whatever the operator adds as the work goes.

## Rest of the bite

- `/polish` over everything since the plan commit — the previous bite and this
  one — not yet run.
- After the merge, remove this branch from the `github-pages` environment's deployment branch policy (id 62680175): `gh api -X DELETE repos/vzakharov/vovazakharov.com/environments/github-pages/deployment-branch-policies/62680175`.
- The operator's read of the new stories and hooks; open points to raise:
  Prototypes and Poluzhivye are linked from `artists/generated.md` but have no
  `.md` of their own (the pages exist; the raw links 404 on GitHub);
  Infinite Solitude's making-of drops his «к этому вернусь потом»; tracks 6 and
  10 have no making-of (the dictation gives none).
