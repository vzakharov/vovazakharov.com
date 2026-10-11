> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) *before* touching code.

# Music: open every song, and the batch around it

An elephant, by the operator's call: one PR, eaten bite by bite, with more asks
arriving as it goes. The operator waived the plan's approval gate in the opening
prompt ("план можно не утверждать"), and asked for the site to be published
straight from the branch once the songs are open, ahead of the merge.

## Rest of the elephant

- **Concept albums (ask 3).** Some albums carry an in-universe story; for those
  the album's text splits into that story, shown first, and a making-of. Waits on
  the operator's dictation for Divine Discontent, which settles whether the split
  also reaches the songs' own pages or stays on the album page.
- **The mastering A/B (ask 6)** is not a repo change: a subagent masters
  «На пальцы»'s unmastered mix (`fingers_mix.mp3`, `vovas-music/fingers`) with
  `scripts/song-intake/master.py` against its own Ozone master, and cuts a
  loudness-matched A/B alternating five seconds of each. The files go to the
  operator in chat from `tmp/`.
- Whatever the operator adds as the work goes.

## This bite

### Open every song (asks 1, 5)

- Drop `hidden: true` from every song file, and the `TBD` descriptions with it.
- `description` becomes optional in `songTextSchema`; a refine keeps the pair
  honest — a description in one locale needs one in the other. The scaffolder
  stops writing a placeholder, and `SONG_DESCRIPTION_PLACEHOLDER` goes.
  A locale block left empty by that is dropped from the file; the schema
  defaults an absent block to no strings.
- The song page shows the story where there is one, the description only where
  there is none, and neither block where the song has neither. The description
  stays the meta and card description; without one the page falls back to the
  site's default, as `constructMetadata` already does.
- "Has a story" is one predicate: the locale's section, or the preamble, says
  something once its HTML comments are gone — the same reading
  `list-hidden-songs.ts`'s `says` makes, so that moves into
  `pages/music/lib/sections.ts` (node-safe) and both use it.
- `pnpm music:hidden` lists hidden songs, of which there are now none, so it is
  repurposed as `pnpm music:untold` → `docs/music/untold-songs.md`: every song
  still lacking a description or a story, same layout, same vet gate. The old
  list gets a tombstone. `.claude/rules/songs.md`'s `hidden` paragraph is
  rewritten to the new contract.

### The page's smaller asks

- **Instrumentals (ask 2):** a song with no words shows its story whole, without
  `ReadMore`'s clamp — there is nothing for it to be in the way of.
- **Stories that read as dictation (ask 4):** «Наша история» is retold as plain
  narrative in both languages; «Мир, какой он есть» keeps only its second
  paragraph. Each `.reflections.md` is checked for a quote of what changed.
- **Follow (ask 7):** following switches on whenever the reader lands on the
  playing song's page, not only on the title in the player bar — `useFollow`
  sets `following` from `pathname === route` on every navigation.
- **«За горизонт» (ask 8)** goes onto Сильней любви as track 6, between
  «Не смотри» (2026-02-19) and «Птичка» (2026-04-04), the album's tracks being
  in the order they were made; «Птичка» and «Слизь» move to 7 and 8.

### Then

Vet, push, and dispatch `deploy.yml` on this branch with `site: vova`.

## DRY notes

- `says` (text with its HTML comments stripped is non-empty) is the one reading
  of "has a story"; it moves to `sections.ts` beside `splitSections`, which both
  the song page and the untold list already import, rather than being written a
  second time in the page.
- The untold list is the hidden list's script with its filter changed, not a new
  script beside it: two lists of "what a song lacks" would drift.
- The instrumental check reuses `songLyrics` returning `undefined`, which is
  already the page's "no words" signal, rather than reading `language` again.
