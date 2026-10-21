# A map of `vovas-music`

Every repository in the `vovas-music` organization that is not one catalogued
song's own: the GarageBand archive and which of it the catalogue already draws
on, album sessions and working projects of catalogued songs, the releases and
songs still missing from the site, videos, and the empty and the unidentified —
so the next release to be added starts from it rather than from a search of 250
repositories. Each song page's `repo:` names the rest.

## `gb-*` — the GarageBand archive

`create_repos.sh`, in the operator's `~/Music/GarageBand`, pushed each
GarageBand folder and `.band` package there to a repository of its own,
`gb-<transliterated name>` (`деревья` → `gb-derev-a`, `Окна.band` →
`gb-Okna-band`): 30 in all, separate from the per-song REAPER repositories and
sharing almost no content with them. Each holds the `.band` (its
`Media/Audio Files` WAVs included) and the bounces made from it. Those WAVs are
recorded regions, not mixes: a bounce is the mix.

They stay as they are, by the operator's decision: nothing from a `.band` is
copied into a song repository. All 30 were verified on 2026-10-21 against the
operator's local clones — the same HEAD, nothing unpushed or untracked, no LFS,
no file over 100 MB — before the local copies went to the Trash.

The six loose bounces from that directory's root went into the song
repositories the same day, each following that repository's layout:

- `okna/Media/` — `Окна - 08.04.2023, 11.16.mp3`
- `ogonki/Media/` — `ogonki2.mp3`
- `prototypes/Media/` — the two `prototypes - …2023` mp3s
- `our-story` root — `наша_история - 11.12.2023, 01.27.mp3` and
  `наша_история_720.m4v` (64 MB, past GitHub's recommended 50), which its
  README's file list does not name yet

`create_repos.sh` itself is tooling, not music, and stays local.

## Already in the catalogue

- `gb-nasa-istoria`, `gb-nas-pank-rok`, `gb-prosti`, `gb-prosto-tak`,
  `gb-pereplelos-` — Крылья
- `gb-znaki-prepinania` — Крылья too, the whole album assembled
  (`крылья (альбом).mp3`); «Знаки препинания» was its working title
- `gb-Okna`, `gb-Okna-band`, `gb-Okna-3-band`, `gb-Okna-5-band` — windows
- `gb-ogonki-band` — little-lights
- `gb-my-hope` — my-hope
- `gb-otter-band` — river-part-three
- `gb-prototypes-band` — the Prototypes album

## Album sessions of catalogued albums

Each song has its own repository; these hold the album assembly.
`tag-renders.json` already lists renders in the first three.

- `Divine-Discontent--album-` — Divine Discontent: the album `.RPP`, all ten
  tracks as FLAC/MP3 (numbered and `GENERATED - …` tagged), the whole album as
  one MP3/MKV, the DALL·E cover
- `psch_album` — PSCHPTHY: all twelve tracks numbered `1_overture` …
  `12_erebos`; Overture and Intermezzo were scaffolded from it
- `dng_album` — Пять романсов, два сонета и один реквием (Дамы и господа):
  `dng-001` … `dng-007`, the source six of its songs were scaffolded from
- `ctfu` — Cheer The Fuck Up: the album `.RPP`, its ten tracks' FLACs in
  `Media/`, the album as one FLAC split in three, cover PNGs
- `grebaniy-bal` — Ни для кого и для всех (Грёбаный бал): `01 Просто устал` …
  `05 Окна`, five of its nine songs as FLAC, no project

## Working projects of catalogued songs

- `dream` — Fireflies: its Suno takes («Stones sailing through the sky», «Moon
  descends…» are its lines) and `dream.flac`, byte-identical to `stories`'
  `Media/dream.flac`
- `ice` — Inverno: «ice phonk» takes; `ice_1.flac` is the file
  `vagabond_album` uses for it
- `mountains` — Wanderer's Farewell: Udio «Whispers of Serenity» plus coda;
  `mountains_new.flac` is the file `vagabond_album` uses for it
- `prologue` — Sirens of the Sands: `sirens.RPP` and `sirens.flac` (identical to
  `vagabond_album`'s `sirens-imported-001.flac`), plus a «Prologue» never
  catalogued
- `revenge` — a 1:20 cut of Artemis (`artemis (final).wav`, same file as in
  `artemis`)
- `za_gorizont` — За горизонт (beyond-the-horizon): an intake project (March 2026)
  beside `bezm`'s own `za_gorizont.RPP`; also holds «Прощание (проба)»
- `night_garden` — Ночной сад (night-garden), July 2024: the Suno takes and a
  «final» MP3, four months before `sad`
- `mu-icok` — Однажды в студёную зимнюю пору… (little-peasant), February 2024:
  the first «Мужичок» take, before `mu-icok-new`
- `prsdemo` — Punk Rock Song (At 40), probably: Udio «Rage and Riffs» extensions,
  May 2024 (guess)

## «Ностальгия»

Полуживые's album on Arseny Tarkovsky's poems. Its repositories carry its songs'
slugs, renamed from the ones `create_repos.sh` and REAPER gave them:

- `nostalgia` (was `Tarkos--al-bom-`) — the album project and file, and the
  recitative takes of `invitation`
- `summer-gone` (was `Leto-proslo`)
- `butterfly-rock` (was `gb-babocka--metal-`)
- `actor` (was `akte-r`)
- `insomnia` (was `gb-Bessonnica`)
- `candle-tarkovsky` (was `sila`; the poem is «Меркнет зрение — сила моя»)
- `winter-in-the-forest` (was `gb-zima-v-lesu`)
- and, for Папа-море, `candle-burnt` (was `svecha`; dad's «Свеча горела»)

## On Apple Music, not on the site

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
    (`za-steklom`), Бабочка (`babocka--pop-`, a different song from Полуживые's
    `butterfly-rock`), Happy End (`happy-end`).
  - На-на-на-на-на-на has no repository found.
- **за/обложкой, single «Ты поймёшь»** — no repository found.

## Not identified

On neither Apple Music nor the site:

- `gb-maski` — «маски» and a «Last Man» demo with a 720p video, October 2023
- `gb-put` — one bounce, 1:54, 01.11.2023
- `gb-children` — Suno stems, «skies-bi»
- `gb-vinni`, `gb-ai-speech` — the same WAV in both
- `gb-Vybirau`, `gb-after-all-band`, `gb-chains-band`, `gb-Moa-pesna-3-band`,
  `gb-Moa-pesna-10-band` — projects with no bounce; no song repository matches
  them by content or name

## Songs not in the catalogue

On neither Apple Music nor the site; each title is the one its files carry.

- `ouroboros` — GENERATED's first song, the Jukebox «Ouroboros» of
  `artists/generated.md`: Jukebox levels, three takes, `ouroboros_jb.mp3`
- `Serdecki` — «Сердечки», five Suno takes and three `.RPP`s, December 2023 –
  January 2024
- `zakat` — «Закат», twelve Suno takes, February 2024
- `kolybel-naa` — «Колыбельная» on Zabolotsky's «Меркнут знаки зодиака», three
  takes, February 2024
- `f-s` — «f&s», twenty takes and a master, April 2024
- `cycle` — «cycle», five takes and a master, June 2024
- `eurocrem` — «Eurocrem», a LANDR master, September 2024
- `john24` — «John 24», a LANDR master, October 2024
- `m3` — «M3», two takes, November 2024
- `haunted` — «God-Haunted», a master and a part-three render, November 2024
- `synedrion-overture` — an orchestral overture, three takes, July 2025 (not
  PSCHPTHY's Overture, which is `wagner`)
- `niks_b` — «niks_b», one WAV and its MP3, July 2025
- `still_alive_original` — «Still Alive», own recordings plus two LANDR
  masters, September 2025
- `photo` — «Фото», recordings over a Suno take, September 2025
- `photo-video` — the video for «Фото», October 2025 (its README says so)
- `makethemfeel` — «Make Them Feel» with four AI video clips, October 2025
- `pozdno` — «Поздно», vocals recorded over Make Them Feel's instrumental,
  February 2026
- `jezero` — «jezero», two voice memos and a render, October 2025
- `v2000`, `v2000_old` — «v2000», two takes of one song with video, November
  2025
- `otherside` — «На той стороне», a LANDR master, December 2025
- `gym` — «gym», a MIDI arrangement, December 2025
- `butyrka` — «Бутырка», recordings and a first render, August 2026
- `osen` — «Осень», a GarageBand `.band` and one bounce, November 2025

## Videos

- `bye_dad` — a video cut from phone clips over a Suno «bye_dad» cover,
  September 2024
- `laengle` — a video over ElevenLabs speech, November 2025
- `meatjoe` — six downloaded clips in a video project, June 2025

## Empty

- `Divine-Discontent-album-`, `ghosts_of_flesh` — spelling twins of
  `Divine-Discontent--album-` and `ghosts-of-flesh`
- `muzicok`, `muzicok-new` — spelling twins of `mu-icok`, `mu-icok-new`
- `cuzie` — a spelling twin of `cu-ie` (Чужие среди нас)
- `epico`, `g35`, `local_elo` — only `.gitattributes`/`.gitignore`

## Not music

- `blog` — Vova's music blog: six 2024 posts on Suno and Udio
