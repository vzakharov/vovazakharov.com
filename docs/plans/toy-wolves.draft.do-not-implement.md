> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

# «Игрушечные волки» — Полуживые's EP joins the catalogue

The EP is on Apple Music and not on the site (`docs/music/vovas-music-map.md` §
"On Apple Music, not on the site"). It goes in the way «Ностальгия» did in #181:
one album page, six song pages with words, cribs, a source history and Vova's
story, a master per song picked blind, a spectrogram and Майя's reflection each.

## What `vovas-music` holds

The REAPER album project `polrazgovorca--al-bom-` («полразговорца (альбом)», the
EP's working title) gives the order and the lengths of the final renders:

1. Детские книги — `детские книги.wav`, 2:38
2. В ночь — `в ночь.wav`, 3:19
3. Ленинград — `ленинград.wav`, 3:39
4. Полразговорца — `полразговорца j2.wav`, 3:08
5. Колядка — `колядка.wav`, 4:10
6. Мой тихий сон — `сон.wav`, 5:32

**Those six WAVs were never pushed.** Only their `.reapeaks` reached git (commit
`9350c83`, deleted since). Each song's own repository holds its REAPER project
and the Suno takes it splices — but not its render, and three projects splice
files that sat in `~/Downloads` and are in no repository: `В ночь.mp3` (all of В
ночь), `Сон.mp3` (Мой тихий сон's main track), two short `Детские книги` takes.
`Полразговорца (1).mp3` in the album repository is a 5:23 take, not the EP. Only
`полразговорца j2.RPP` carries an effect (ReaLimit).

So the masters wait on the audio, and everything else does not: the takes in the
song repositories carry every sung word.

## The poems

All six look like Osip Mandelstam, and the title is his: «В лесах игрушечные
волки / глазами страшными глядят» is «Сусальным золотом горят» (1908) — Колядка.
The rest, to be confirmed against the transcripts: «Только детских книг читать»
(1908), «За гремучую доблесть грядущих веков» («Уведи меня в ночь, где течёт
Енисей», 1931), «Ленинград» (1930), «Мы живём, под собою не чуя страны»
(«…хватит на полразговорца», 1933), «Мой тихий сон, мой сон ежеминутный» (1908).
Each draft starts from the poem as Vova pastes it
(`scripts/song-intake/CLAUDE.md` § "Lyrics"), and each page carries a `source:`
history of its poem.

## Steps

1. **Audio** (blocked on the operator — question 1). With the six WAVs in hand:
   each goes into its song's repository as `<slug>_mix.wav`, beside the takes.
   Fallback if the WAVs are gone: a re-render of each song's `.RPP` from the
   takes (positions, offsets, fades, item volume), checked against its render's
   recovered `.reapeaks`, with the three `~/Downloads` files downloaded again
   from Suno.
2. **Repositories**: renamed to the slugs by `pnpm music:masters rename`, moved
   to `main` by `serve-main` where on `master`:
   - `detskie-knigi` → `childrens-books`
   - `v-noc-` → `into-the-night`
   - `Leningrad` → `leningrad`
   - `polrazgovorca-j2` → `half-a-conversation` (`gb-polrazgovorca`, the
     GarageBand sketch, stays as it is, as the `gb-*` archive does)
   - `koladka` → `carol`
   - `son` → `my-quiet-dream`
   - `polrazgovorca--al-bom-` → `toy-wolves`, the album project, as `nostalgia`
     is
3. **Words**: demucs vocals off the takes (then off the renders once there),
   Whisper + Deepgram per song into
   `docs/music/transcripts/toy-wolves-NN-<slug>.*`, drafts in
   `docs/remove-before-merging/toy-wolves/lyrics/`, reconciled with the pasted
   poems, every disputed line asked as a numbered question with its timecode.
   English cribs line for line.
4. **Masters**: per song, three catalogue references, `blind-abc.py` sealed and
   split, `/music/mastering-blind-test` for the listening, `master.py` with the
   verdict. Then `music:masters put`, `music:scaffold`, `music:masters tag`.
5. **Pages**: `albums/toy-wolves.md` (`artist: 'Полуживые'`, cover at
   `assets/covers/toy-wolves.jpg`), six songs with `album`, `project`,
   `credits.lyrics: ['Osip Mandelstam']` (added to `people.ts`), the `source:`
   history, hooks; `poluzhivye.md`'s collage re-rendered. `vovas-music-map.md`
   moves the EP out of § "On Apple Music, not on the site".
6. **Stories**: Vova's, from his dictation or comment, verbatim per `songs.md` §
   "Material whose author is in the room". Until then a song publishes without
   one.
7. **Spectrograms and Майя's reflections**, per song, once its master is picked.

The work is taken whole in this PR; a relay carries it if a session runs out.

## DRY notes

- Everything runs on the #181 tooling unchanged: `masters.ts`, `blind-abc.py`,
  `master.py`, `lyrics.py`, `transcribe.py`, `spectrogram.py`,
  `scaffold-song.ts`. Nothing new is shared or duplicated.
- The one possible new piece is the `.RPP` re-render of step 1's fallback. It
  would be a script in `scripts/song-intake/`, since a REAPER project with its
  render lost is a recurring shape in `vovas-music` (the map lists several); it
  is written only if the fallback is taken.
- Mandelstam joins `people.ts` as one entry, beside Arseny Tarkovsky's.
