# «Ностальгия» — the Полуживые album on Arseny Tarkovsky's poems

Add «Ностальгия» (Полуживые, 7 tracks, taken down from every platform) to the
music catalogue, each track newly mastered against a reference the operator
picks blind. Also record what the session that wrote this plan found in
`vovas-music`, so it outlives the session.

## What exists

The release, as the distributor had it
(`nostalgia-album-assets/distributor-tracklist.png`):

1. Приглашение в путешествие — 1:08
2. Лето прошло — 4:02
3. Бабочка — 4:00
4. Актёр — 4:00
5. Бессонница — 6:32
6. Свеча — 5:28
7. Зима в лесу — 5:24

Cover: `nostalgia-album-assets/cover.jpg`. It is drawn after Andrei Tarkovsky's
film «Ностальгия», whose still is `nostalgia-album-assets/film-still.jpg` —
material for the album's story, not an asset the page needs yet.

Where the audio is, matched by duration (ffprobe) and by the silences in the
album file:

- **The whole album**: `Tarkos--al-bom-/таркос.mp3`, 30:22 (the distributor's
  sum is 30:34). Silences fall at 303, 549, 787, 1174 and 1493 s.
- **1 and 2 are one piece of music.** Лето прошло opens on a long ambient
  stretch; on the album the operator laid the Приглашение recitative over that
  stretch, so Лето прошло's opening became Приглашение's body, and track 2
  starts almost at once on the guitar's first notes. So 0–303 s holds both with
  no silence between them, the boundary at about 68 s (the distributor's 1:08),
  where the guitar comes in. Приглашение is `segue`.
- **1** — the album's first 68 s, recitative and ambient together.
  `Tarkos--al-bom-/Media/Приглашение .mp3` (1:07) and the two longer takes
  beside it are most likely the recitative alone.
- **2** — the album's 68–303 s. `Leto-proslo/лето прошло.mp3` (4:40) is ~38 s
  longer than track 1 and 2 together, which fits the whole song with its full
  ambient opening: if it cross-correlates with the album from the guitar on, it
  is the same take, and the better source.
- **3** — `gb-babocka--metal-`, «бабочка (полуживые)» bounces, 3:59, and three
  takes as WAV in the `.band`. Apple still lists «Бабочка в госпитальном саду»
  as a Полуживые single, most likely this track. (`babocka--pop-` is
  за/обложкой's «Бабочка» from «Час», a different song.)
- **4** — `akte-r/актёр v4.mp3`, 3:59. The other takes there are 2:33–3:46.
- **5** — `gb-Bessonnica`, «Тарковский Бессонница» mp3 6:33, and a 6:36 WAV in
  the `.band`.
- **6** — `sila/свеча.mp3`, 5:12, the same stretch as the album's 1186–1493 s.
  `sila` is this song's repository throughout: the poem is «Меркнет зрение —
  сила моя», whose refrain is «я свеча, я сгорел на пиру», and the
  `Media/Сила моя (3–5).mp3` there are earlier takes of it. `svecha` is other
  material and stays out of this album.
- **7** — `gb-zima-v-lesu`, mp3 5:20, and a 5:21 WAV in the `.band`. Apple still
  lists it as a single.

None has a real master: the operator brought each up to about -1 dB and no
further.

## Steps

### 1. Lyrics stubs, first

The operator pastes Tarkovsky's poems in themselves; a session will not
reproduce them. A song file cannot exist yet — the schema requires `repo`,
`seconds` and `mp3Bytes`, which only a master gives — so the stubs go where
`scripts/song-intake/CLAUDE.md` puts lyrics drafts:
`docs/remove-before-merging/nostalgia/lyrics/<slug>.md`, one per track. Each
holds the title, the track number, a `<!-- lyrics:ru -->` marker with a note
where the poem goes, and a `<!-- lyrics:en -->` marker for the crib. Commit and
push before anything else and tell the operator the paths.

The crib under `lyrics:en` is the operator's to supply as well, or to leave for
later: an English rendering of a whole poem still under copyright is the same
reproduction one step removed, so a session does not write it.

Slugs, as the operator picked them:

- `invitation` — Приглашение в путешествие
- `summer-gone` — Лето прошло
- `butterfly-rock` — Бабочка
- `actor` — Актёр
- `insomnia` — Бессонница
- `candle-tarkovsky` — Свеча. The poet's name disambiguates it from dad's
  `candle-burnt` (step 7) for the operator, who would otherwise mix the two up.
- `winter-in-the-forest` — Зима в лесу. `songs.md` drops only a _leading_ “the”,
  so the rule keeps this one; the operator's `winter-in-forest` replaces it if
  they say so.
- album: `nostalgia`

### 2. Sources

For each track, the source is the take the album released:

- Prefer a lossless file of that same take — the `.band` WAVs of 3, 5 and 7. A
  take counts as the same once it cross-correlates with the album's cut of that
  track. Otherwise use the per-track MP3 that matches by duration.
- Tracks 1 and 2 come out of `таркос.mp3` as one 0–303 s piece, kept whole
  through mastering (step 4). The cut at the guitar's entry has no silence to
  find, so it goes at the guitar's first onset nearest the distributor's 1:08,
  and the operator confirms it in the blind file. If `Leto-proslo`'s take proves
  the same, it is the better source for the music, but the released mix (the
  recitative over it) exists only in the album file, so the album cut stays the
  source for the two tracks. Any other track with no per-track file of its
  released take is split by the procedure in `scripts/song-intake/CLAUDE.md`.
- A track whose source is an MP3 is mastered to an MP3 and marked `lossy`.

Each source goes to the `music-sources` release as `nostalgia-NN-<slug>.<ext>`.

**Done.** Waveform correlation with the album's cut decided each source:

- 1+2 — the album's 0–311.3 s, as planned.
- 3 — the bounce `бабочка (полуживые) - …15.03.mp3` (r=0.999). The `.band` WAVs
  are recorded regions, not mixes (r≤0.6).
- 4 — the album's 551.6–790.6 s. `актёр v4` shares only the second half (r≈0.75
  from 90 s on, ≈0.15 before), and no other take matches: the released mix was
  made in the album project (`таркос (выбор актёра).RPP`).
- 5 — the bounce mp3 (r=0.978). The `.band` WAV is not that mix (r=0.93 against
  the bounce).
- 6 — `свеча.mp3` (r=0.991).
- 7 — the `.band` WAV, lossless (r=0.989 to the album, 0.993 to the bounce).
- `candle-burnt` — the operator's Suno WAV.

### 3. The reference pool

A reference is one of the operator's own masters, recognisable as a master by an
iZotope Ozone 10 or 11 plugin in its REAPER project.

- Scan every `vovas-music` repository's `.RPP` for one, through
  `pnpm music:masters` (the only sanctioned way into those repositories).
- The operator expects the pool to start at about Let the Stories Spin. Report
  any Ozone master from before it rather than silently dropping it.
- The pool is each such song's catalogue master. Write it to
  `docs/remove-before-merging/nostalgia/references.md`: song, repository, Ozone
  version, and the project file it was found in.

### 4. Three candidates per track

For each track, shortlist the three pool masters most like its mix:

- **How alike:** average spectrum (`spectrum.py`), loudness and crest factor.
  Other things equal, prefer the project's own masters (Полуживые: Папа-река,
  Кому на Руси, Гамлет, Vagabond).
- **One line per candidate** in `references.md` says why it made the list.

Master the track against each of the three with `master.py`, at the settings the
Крылья run settled on (`--strength 0.5`, the air cap, peaks under -1 dBTP).

**Tracks 1 and 2 are mastered as one piece and cut afterwards.** Mastered apart,
each would get its own gain and EQ, and the segue would jump at the guitar's
entry. One reference shortlist, one blind test, and one winner serve both
tracks.

### 5. The blind A/B/C

One file per track, `docs/remove-before-merging/nostalgia/blind/<slug>.mp3`:

- The three masters are loudness-matched, the louder brought down to the
  quieter.
- The file cuts them into consecutive 5-second windows over the whole song, so
  the music keeps moving while the master changes.
- The order is one random permutation of the three, repeating through the song.
  The operator hears "first, second, third" and does not know which reference
  each one is.
- The key is committed sealed: the commit carries only the sha256 of the
  permutation plus a random nonce. Both are revealed in the commit that records
  the operator's verdict.
- If the session dies before the reveal, the test is rebuilt with a new
  permutation, which costs one listening.

The operator answers per track with a position ("2", or a ranking "2 > 1 > 3").
The winner's master becomes the track's master. A request to adjust it ("less
bright") is applied to that master and re-listened as an ordinary
loudness-matched A/B against the pick.

A script, `scripts/song-intake/blind-abc.py`, does the build: three masters in;
the file, the sealed key and the reveal out. Seven tracks now and every album
after make it mechanical enough to be code. The method gets a paragraph in
`scripts/song-intake/CLAUDE.md` § "Mastering": no record of the earlier blind
test survives except two cost-ledger rows from PR #140, which is the gap this
closes.

### 6. Repositories, pages, tags

Each song lives in the repository its takes already sit in, renamed to its slug:

- `gb-babocka--metal-` → `butterfly-rock`
- `akte-r` → `actor`
- `gb-Bessonnica` → `insomnia`
- `gb-zima-v-lesu` → `winter-in-the-forest`
- `Leto-proslo` → `summer-gone`; its source is the album cut, put in beside the
  take already there.
- `sila` → `candle-tarkovsky`: «Меркнет зрение — сила моя», the released take
  and the earlier ones together. `svecha` keeps its name.
- `Tarkos--al-bom-` → `nostalgia`. It is the album's repository, holds the album
  file both tracks 1 and 2 are cut from, and the recitative takes, so it serves
  `invitation`, the way `vagabond_album` serves three songs.

Renaming is a write to those repositories, so it goes through
`pnpm music:masters` too: a `rename <old> <new>` command beside `create`. GitHub
redirects the old name, so the operator's clones under `~/Music/GarageBand` keep
working; `git remote set-url` there is tidy rather than urgent. A new repository
given an old name would break that redirect, and `rename` refuses a target that
already exists.

Then, per track:

- `put` the source, the mix, the winning master and `mastering/`. The takes
  already in the repository stay where they are.
- The README names each file and the reference.
- `pnpm music:scaffold <slug>` and `pnpm music:masters tag <slug>`.

The scaffolded song file takes the operator's pasted lyrics from step 1 and
`segue: true` on track 1. Each song is `status: wip` until its story is
dictated. Then:

- `albums/nostalgia.md`: «Ностальгия», `artist: 'Полуживые'`, `wip: true`,
  `en: { title: { translation: 'Nostalgia' } }`.
- `assets/covers/nostalgia.jpg` from the attached cover.
- `pnpm music:untold`.

The album's and the songs' stories are dictated later, through `/dictation`.

### 7. Ride-along: «Свеча горела» into Папа-море

Dad's song — Владимир Захаров-старший's, "his main one" — restored with Suno. It
joins Папа-море (`father-sea`, `wip`) as track 9, after `farewell`, and is not
part of «Ностальгия».

- **Source**: `docs/remove-before-merging/Свеча горела.wav`, which the operator
  pushed: 3:53, 48 kHz / 16-bit, the Suno download. `svecha` holds only takes
  and a REAPER project. The WAV goes to `music-sources` as
  `father-sea-09-candle-burnt.wav` and into the repository; the copy on this
  branch is swept with the rest of `docs/remove-before-merging/`.
- **Slug and repository**: `candle-burnt`. «Свеча горела» rests on Pasternak's
  «Свеча горела на столе» — "A candle burnt on the table" — so the leading "a"
  drops; "burnt" because the site's English is British. `svecha` is renamed to
  it.
- **Master**: the same reference pool, shortlist and blind A/B/C as the album's
  tracks, its own test.
- **Words**: dad's poem. Unlike Tarkovsky's, it is the family's, so the
  song-intake procedure applies in full: `lyrics.py` on the vocals stem, then
  the operator corrects, and the crib is the agent's to write.
  `credits.lyrics: [Vladimir Zakharov Sr.]`. Music is credited the same way,
  unless the operator names someone else, as `river-part-one` names Никсон.
- **Story**: the operator's Telegram post
  (`nostalgia-album-assets/candle-burned-post.png`) is the `lang:ru` story,
  verbatim; `lang:en` is its translation:

  > Это, конечно, «главная» папина песня.
  >
  > Как мне однажды сказала тётя Оля, жена также уже увы покойного дяди
  > Вити-«Никсона», «Володя + гитара — значит, „Свеча“».
  >
  > Поэтому реставрировать и переделывать её было особенно боязно, и я долго
  > откладывал, но вот наконец решился.
  >
  > Любое подобие неизбежно хуже образа — но, надеюсь, что и в таком виде вы
  > услышите в этой песне своего друга Зэка.

### 8. The record of this session's findings

`docs/music/vovas-music.md`, the appendix below as its body: a map of what the
organization holds that the catalogue does not yet use. Nothing in the repo
records the `gb-*` repositories or which releases they feed, and the next
release to be added («Час», «Игрушечные волки») starts from exactly that map.
The local agent's own report on the migration,
`docs/remove-before-merging/garageband-to-vovas-music-report.md`, is folded in
where it adds detail — the per-repo verification, what was not pushed and why.
It is swept with the rest of that tree.

## Settled with the operator

- **Repositories**: the existing ones, renamed. A new repository per song would
  leave the takes and the master in two places.
- **Sources**: lossless where the same take survives, else the per-track file or
  the album cut. Cutting every track from the album mp3 would have made all
  seven lossy for one source's consistency.
- **The findings record**: `docs/music/vovas-music.md`. One issue per missing
  release was the alternative.
- **Slugs**: the operator's (step 1), the two candles as `candle-tarkovsky` and
  `candle-burnt`. A bare `candle` beside `candle-burned` was the alternative;
  the operator would confuse them.
- **«Свеча горела»** is Папа-море's track 9, at the end (no position named).

## DRY notes

- **Mastering** is `master.py` and `spectrum.py` unchanged. The blind build is
  new code because nothing builds a three-way blind file: the A/B the CLAUDE.md
  describes is a two-way listening procedure with no script behind it.
  `blind-abc.py` takes the windowing and loudness matching as its own two
  functions, and could serve that A/B too; whether to make it serve it is left
  until an A/B is actually scripted.
- **Splitting** follows the existing procedure in the CLAUDE.md, with no new
  code.
- **Repos, scaffold and tags** are `pnpm music:masters` and `music:scaffold`.
  `rename` joins `create` in `masters.ts` and reuses `music-github.ts`'s REST
  helper, rather than a bare `gh api` beside the script that is meant to be the
  only way in.
- **The Ozone scan** is a one-off read through `music:masters`. Its output is a
  lab file rather than a script, unless the scan turns out to need code beyond a
  clone and a grep.

## Appendix — `vovas-music` beyond the catalogue (for `docs/music/vovas-music.md`)

**`gb-*` — the GarageBand archive.** `create_repos.sh`, in the operator's
`~/Music/GarageBand`, pushed each GarageBand folder and `.band` package there to
a repository of its own, `gb-<transliterated name>`: 30 in all, separate from
the per-song REAPER repositories. Each holds the `.band` (its
`Media/Audio Files` WAVs included) and the bounces made from it. The six loose
bounces from that directory's root went into the song repositories on
2026-10-21:

- `okna/Media/` — `Окна - 08.04.2023, 11.16.mp3`
- `ogonki/Media/` — `ogonki2.mp3`
- `prototypes/Media/` — the two `prototypes - …2023` mp3s
- `our-story` root — `наша_история - 11.12.2023, 01.27.mp3` and
  `наша_история_720.m4v`, which its README's file list does not name yet

**Already in the catalogue:**

- `gb-nasa-istoria`, `gb-nas-pank-rok`, `gb-prosti`, `gb-prosto-tak`,
  `gb-pereplelos-` — Крылья
- `gb-znaki-prepinania` — Крылья too, the whole album assembled
  (`крылья (альбом).mp3`); «Знаки препинания» was its working title
- `gb-Okna`, `gb-Okna-band`, `gb-Okna-3-band`, `gb-Okna-5-band` — windows
- `gb-ogonki-band` — little-lights
- `gb-my-hope` — my-hope
- `gb-otter-band` — river-part-three
- `gb-prototypes-band` — the Prototypes album

**«Ностальгия»** (Полуживые) — renamed to its songs' slugs:

- `nostalgia` (was `Tarkos--al-bom-`)
- `summer-gone` (was `Leto-proslo`)
- `butterfly-rock` (was `gb-babocka--metal-`)
- `actor` (was `akte-r`)
- `insomnia` (was `gb-Bessonnica`)
- `candle-tarkovsky` (was `sila`; the poem is «Меркнет зрение — сила моя»)
- and, for Папа-море, `candle-burnt` (was `svecha`; dad's «Свеча горела»)
- `winter-in-the-forest` (was `gb-zima-v-lesu`)

**On Apple Music, not on the site:**

- **Полуживые, EP «Игрушечные волки»** — Детские книги (`detskie-knigi`), В ночь
  (`v-noc-`), Ленинград (`Leningrad`), Полразговорца (`gb-polrazgovorca`,
  `polrazgovorca--al-bom-`, `polrazgovorca-j2`), Колядка (`koladka`), Мой тихий
  сон (`son`).
- **за/обложкой, album «Час»**:
  - The whole album is `cas--al-bom-/час (альбом).mp3`.
  - Считалочка and Когда деревья снова станут большими have audio only in
    `gb-scitalocka` and `gb-derev-a`: their REAPER namesakes `scitalocka` and
    `derev-a` hold just the `.RPP`.
  - The rest: Чужие среди нас (`cu-ie`), Проведи (`provedi`), За стеклом
    (`za-steklom`), Бабочка (`babocka--pop-`), Happy End (`happy-end`).
  - На-на-на-на-на-на has no repository found.
- **за/обложкой, single «Ты поймёшь»** — no repository found.

**Not identified**, on neither Apple nor the site:

- `gb-maski` — «маски» and a «Last Man» demo with a 720p video, October 2023
- `gb-put` — one bounce, 1:54, 01.11.2023
- `gb-children` — Suno stems, «skies-bi»
- `gb-vinni`, `gb-ai-speech` — the same WAV in both
- `gb-Vybirau`, `gb-after-all-band`, `gb-chains-band`, `gb-Moa-pesna-3-band`,
  `gb-Moa-pesna-10-band` — projects with no bounce
