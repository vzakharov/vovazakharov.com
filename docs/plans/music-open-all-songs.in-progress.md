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

## Rest of the elephant

- Whatever the operator adds as the work goes.

## This bite

- `/polish` over the previous bite (from the plan commit on), not yet run.
- After the merge, remove this branch from the `github-pages` environment's deployment branch policy (id 62680175): `gh api -X DELETE repos/vzakharov/vovazakharov.com/environments/github-pages/deployment-branch-policies/62680175`.
- **Concept albums (ask 3).** Some albums carry an in-universe story; for those
  the album's text splits into that story, shown first, and a making-of. The
  Divine Discontent dictation is in, cleaned:
  `docs/music/dictations/generated-divine-discontent.md`. It tells every track
  as in-universe then making-of, so the split reaches the songs' pages too; the
  operator left where to cut each one to the agent («ты сам, Клод, реши, где ты
  как-то разобьёшь»). What it asks for:
  - **Bring the description back on the page** as a hook — «что-то типа хука…
    односложный вопрос какой-нибудь, что-то, чтобы цепляло», especially on
    concept albums. Its look is open («пока ещё точно не знаю, как это будет
    выглядеть»): propose one and show it via `/preview`.
  - **GENERATED's artist story**, cut hard from the dictation's long form
    («очень сильно нужно будет сократить»); the dictation file is the long form
    he wants kept.
  - **Divine Discontent's album text**: the arc (a deity is born, lonely, makes
    man in its image, is so discontented with him it destroys him), built on the
    pun; explain the idiom's everyday sense, as he asked.
  - **All ten tracks**: in-universe story and making-of, en and ru, plus a hook
    description. Find and attach the Genesis 1:26 «let us make man in our image»
    and the famous inverse quote (God made in man's image — Voltaire's «returned
    the favour» or Xenophanes) for «In Our Image». «Infinite Solitude»'s opening
    line («In the middle of void, a new … starts») is to be quoted exactly — the
    DD songs carry no lyrics yet, so take it from the recording or the source
    repo `vovas-music/Divine-Discontent--album-`.
  - Material whose author is in the room (`.claude/rules/songs.md`): retell his
    facts, add none of your own beyond what he asked for (the idiom, the quotes).
