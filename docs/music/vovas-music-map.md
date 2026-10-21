# A map of `vovas-music`

What the `vovas-music` organization holds beyond one repository per catalogued
song: the GarageBand archive, which of it the catalogue already draws on, the
releases still missing from the site and the repositories nobody has placed yet
— so the next release to be added starts from it rather than from a search of
250 repositories.

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
