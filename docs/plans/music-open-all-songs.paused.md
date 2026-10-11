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

## Rest of the elephant

- **Mastering without the song's own master («Птичка»).** The «На пальцы» test
  showed Matchering gets close when it can match against the song's own Ozone
  master; this one asks whether it does without one. «Птичка»'s mix goes through
  `master.py` against the «На пальцы» Ozone master as a house reference, and is
  spliced against «Птичка»'s own Ozone master the same way: five seconds each,
  loudness-matched, neutral filename. Blind in both senses, at the operator's
  word («в новом A/B тесте тоже неизвестен должен быть порядок»): which version
  plays first is drawn at random, and the key goes only into a committed base64
  file the agent does not read.
  - Verdict: A marginally better, B «поярче, посветлее»; A (first) was
    Matchering, B Ozone. Past ~2:30 the music differs: `birdie_mix.mp3` is not
    the mix the Ozone master was rendered from, which also explains the low
    correlation.
  - Both experiments and the follow-up (choose the reference by mix similarity)
    are issue #141; the «Птичка» mp3s are assets of the
    `mastering-experiments-1` prerelease it links.
  - Sent to the operator as `birdie-blind.mp3`; key in
    `docs/remove-before-merging/birdie-ab-key.b64`. Mix `birdie_mix.mp3`
    (`vovas-music/birdie`); `master.py … --strength 1.0` against «На пальцы
    (EDM).flac»; Matchering lagged 44 samples; both trimmed to 199.63 s (the
    Ozone master runs 7 s longer); both at −9.79 LUFS; correlation 0.6455
    (0.975 on «На пальцы»). The file itself was in the predecessor's `tmp/`,
    rebuilt from those figures if needed.

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
- Whatever the operator adds as the work goes.

## Rest of the bite

- `/polish` over this bite (from the plan commit on), not yet run.
- After the merge, remove this branch from the `github-pages` environment's deployment branch policy (id 62680175): `gh api -X DELETE repos/vzakharov/vovazakharov.com/environments/github-pages/deployment-branch-policies/62680175`.
