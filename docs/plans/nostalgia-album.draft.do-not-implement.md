> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

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
  sum is 30:34). Silences fall at 303, 549, 787, 1174 and 1493 s. 0–303 s is
  tracks 1 and 2 with no gap: Приглашение segues into Лето прошло.
- **1** — `Tarkos--al-bom-/Media/Приглашение .mp3`, 1:07 (two longer takes
  beside it).
- **2** — only inside `таркос.mp3`. `Leto-proslo/лето прошло.mp3` is another
  take, 4:40.
- **3** — `gb-babocka--metal-`, «бабочка (полуживые)» bounces, 3:59, and three
  takes as WAV in the `.band`. Apple still lists «Бабочка в госпитальном саду»
  as a Полуживые single, most likely this track. (`babocka--pop-` is
  за/обложкой's «Бабочка» from «Час», a different song.)
- **4** — `akte-r/актёр v4.mp3`, 3:59. The other takes there are 2:33–3:46.
- **5** — `gb-Bessonnica`, «Тарковский Бессонница» mp3 6:33, and a 6:36 WAV in
  the `.band`.
- **6** — `sila/свеча.mp3`, 5:12, the same stretch as the album's 1186–1493 s.
  `svecha` holds other takes, 3:38 and shorter.
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

Slugs, by `.claude/rules/songs.md`'s rule (the operator corrects any):

- `invitation-to-the-voyage` — Приглашение в путешествие, after Baudelaire's
  «L'Invitation au voyage», if that is the reference; otherwise
  `invitation-to-a-journey`
- `summer-has-gone` — Лето прошло («Вот и лето прошло»)
- `butterfly` — Бабочка («Бабочка в госпитальном саду»)
- `actor` — Актёр
- `insomnia` — Бессонница
- `candle` — Свеча
- `winter-in-the-forest` — Зима в лесу
- album: `nostalgia`

### 2. Sources

For each track, the source is the take the album released:

- Prefer a lossless file of that same take — the `.band` WAVs of 3, 5 and 7. A
  take counts as the same once it cross-correlates with the album's cut of that
  track. Otherwise use the per-track MP3 that matches by duration.
- Track 2 comes out of `таркос.mp3` by the album-splitting procedure in
  `scripts/song-intake/CLAUDE.md`, and so does any track with no per-track file
  of its released take.
- A track whose source is an MP3 is mastered to an MP3 and marked `lossy`.

Each source goes to the `music-sources` release as `nostalgia-NN-<slug>.<ext>`.

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

Per track:

- `pnpm music:masters create <slug>`, then `put` the source, the mix, the
  winning master and `mastering/`.
- The README names the reference and links the repository the source came from
  at a commit.
- Then `pnpm music:scaffold <slug>` and `pnpm music:masters tag <slug>`.

The scaffolded song file takes the operator's pasted lyrics from step 1 and
`segue: true` on track 1. Each song is `status: wip` until its story is
dictated. Then:

- `albums/nostalgia.md`: «Ностальгия», `artist: 'Полуживые'`, `wip: true`,
  `en: { title: { translation: 'Nostalgia' } }`.
- `assets/covers/nostalgia.jpg` from the attached cover.
- `pnpm music:untold`.

The album's and the songs' stories are dictated later, through `/dictation`.

### 7. The record of this session's findings

`docs/music/vovas-music.md`, the appendix below as its body: a map of what the
organization holds that the catalogue does not yet use. Nothing in the repo
records the `gb-*` repositories or which releases they feed, and the next
release to be added («Час», «Игрушечные волки») starts from exactly that map.

## Open questions (recommendation in force)

1. Repositories:
   - **a (recommended)** — a new one per song, named by its slug, per
     `scripts/song-intake/CLAUDE.md` § "A song's repository"; the old repos stay
     as archives and are linked at a commit.
   - **b** — reuse `gb-Bessonnica`, `akte-r`, `sila` and the rest. Their names
     break the slug rule, and three tracks have no repository of their own to
     reuse.
2. Sources:
   - **a (recommended)** — lossless where the same take survives, else the
     per-track file or the album cut.
   - **b** — every track cut from `таркос.mp3`: one consistent lossy source, and
     all seven `lossy`.
3. Where the findings record lives:
   - **a (recommended)** — `docs/music/vovas-music.md`.
   - **b** — GitHub issues, one per release still missing from the site, the
     `gb-*` history in the first.
4. Slugs: as listed in step 1; `invitation-to-the-voyage` holds unless the poem
   is not after Baudelaire.

## DRY notes

- **Mastering** is `master.py` and `spectrum.py` unchanged. The blind build is
  new code because nothing builds a three-way blind file: the A/B the CLAUDE.md
  describes is a two-way listening procedure with no script behind it.
  `blind-abc.py` takes the windowing and loudness matching as its own two
  functions, and could serve that A/B too; whether to make it serve it is left
  until an A/B is actually scripted.
- **Splitting** follows the existing procedure in the CLAUDE.md, with no new
  code.
- **Repos, scaffold and tags** are `pnpm music:masters` and `music:scaffold`,
  unchanged.
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

**«Ностальгия»** (Полуживые) — this plan: `gb-babocka--metal-`, `gb-Bessonnica`,
`gb-zima-v-lesu`, with `Tarkos--al-bom-`, `akte-r`, `sila`.

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
