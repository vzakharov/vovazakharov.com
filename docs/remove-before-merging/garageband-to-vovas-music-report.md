# GarageBand → vovas-music: what was done (2026-10-21)

Source: `~/Music/GarageBand` on Vova's Mac. Target: GitHub org `vovas-music`.
Nothing local was deleted or moved; no repo was created; no force-push.

## Finding

Every folder and `.band` package in `~/Music/GarageBand` (30 of them) was
already a git clone pushed by an earlier run of `create_repos.sh` with the
prefix `gb`, one repo each: `gb-<transliterated name>` (e.g. `деревья` →
`gb-derev-a`, `Окна.band` → `gb-Okna-band`, `бабочка (metal)` →
`gb-babocka--metal-`). Verified on 2026-10-21 for all 30: local HEAD equals the
GitHub HEAD, no unpushed commits, no untracked or ignored files, the working
tree clean except a locally modified `.DS_Store`. No LFS, no file over 100 MB.

The `gb-*` repos are separate from the per-song REAPER repos (`okna`,
`ogonki`, `our-story`…) and share almost no content with them. Decision
(Vova): leave the `gb-*` repos as they are; do not copy `.band` content into
the song repos.

## Pushed

The only content not on GitHub anywhere (blob hashes checked against all 250
repos) was the loose files in the GarageBand root. Each went to its song repo,
following that repo's layout (`okna/Media/` already held a GarageBand bounce):

| Local file | Destination | Commit |
|---|---|---|
| `Окна - 08.04.2023, 11.16.mp3` | [okna](https://github.com/vovas-music/okna) `Media/` | aa0ba5d |
| `ogonki2.mp3` | [ogonki](https://github.com/vovas-music/ogonki) `Media/` | 5a65758 |
| `prototypes - 06.07.2023, 22.53.mp3` | [prototypes](https://github.com/vovas-music/prototypes) `Media/` | 5e5ab31 |
| `prototypes - 10.07.2023, 11.47.mp3` | [prototypes](https://github.com/vovas-music/prototypes) `Media/` | 5e5ab31 |
| `наша_история - 11.12.2023, 01.27.mp3` | [our-story](https://github.com/vovas-music/our-story) root | a076de1 |
| `наша_история_720.m4v` (64 MB) | [our-story](https://github.com/vovas-music/our-story) root | a076de1 |

Each commit only adds files; the uploaded blob hashes match the local files
byte for byte. GitHub warned that the `.m4v` exceeds its recommended 50 MB
(the hard limit is 100 MB).

## Not on GitHub

- `create_repos.sh` — tooling, not music; left local only, by decision.

## Already on GitHub, left where it was

- `after-all.band`, `chains.band`, `Моя песня 3.band`, `Моя песня 10.band` —
  in their `gb-*` repos; no song repo matches them by content or name.
- `бабочка (metal)` — in `gb-babocka--metal-`, separate from `babocka--pop-`.

## Deleted locally (moved to the Trash)

On Vova's go-ahead, each item was re-verified against GitHub (HEAD equal,
nothing but `.DS_Store` changed; root files by blob hash) and moved to
`~/.Trash/GarageBand-2026-10-21/`: all 30 folders/packages and the six root
files in the "Pushed" table. Every item passed. `~/Music/GarageBand` now holds
only `create_repos.sh` and `.DS_Store`.
