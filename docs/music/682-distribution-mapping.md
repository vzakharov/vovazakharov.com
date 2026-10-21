# Song frontmatter → 682 Distribution API

What the cabinet at backstage.682distribution.ru sends to `api.682distribution.ru`, and which of it a song's frontmatter already holds. Read off the cabinet's JS bundles on 2026-10-21; the API is undocumented, so every field name here is what the web form posts, not a contract.

**Verdict: the frontmatter covers the track's text fields; the release needs five things the repo does not hold** — a 1400 px cover, WAV audio, ISRC/UPC for anything already on the stores, a genre and a release date.

Worked example: `songs/20.md` («Двадцать»), first track of `albums/father-sea.md`.

## How a release is built

Every call carries `authorization: Bearer <token>`, the token being the cabinet's `auth-token` cookie.

1. `POST /user/new_release` (no body) → `release.id`. A draft.
2. `POST /user/edit_release`, multipart, `id` plus the release's fields. The form posts itself whole on each blur; one field at a time also works (`date`, `preorder_date`, `cover_ai` go alone).
3. `POST /user/edit_release`, multipart, `id` + `cover` — a square JPEG/PNG, 1400–6000 px.
4. `POST /user/new_track` per track, multipart, `id` (the release's) + the track fields + `wav`. WAV only.
5. `POST /user/update_tracks_order` (exists; its body not traced), and `POST /user/save_release_moderation_meta` (JSON `{ id, isAiContent, basicTariffProof, ffp }`).
6. `POST /user/send_release` — submits to moderation. Not traced further: nothing gets sent without Vova.

## Release fields (`edit_release`)

| 682 field           | From                                              | «Двадцать» →                                    | Gap                                                                                                    |
| ------------------- | ------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `title`             | album `title` (`ru.title` for the Russian stores) | `Папа-море`                                     | —                                                                                                      |
| `version`           | —                                                 | empty                                           | —                                                                                                      |
| `artists`           | album `artist`, or `ru.artist`                    | `Полуживые`                                     | —                                                                                                      |
| `feat_artists`      | —                                                 | empty                                           | album has no feat field; a release-level feat is rare, fine                                            |
| `type`              | `Single` / `EP` / `Album`                         | `Album`                                         | derive: `album: null` → Single; EP vs Album has no field (track count?)                                |
| `genre`, `subgenre` | —                                                 | ?                                               | **missing** — a fixed English list (`Electronic`, `Rock`, `Hip Hop/Rap` …); one per artist would do    |
| `date`              | —                                                 | ?                                               | **missing** — release date is a decision; song `date` is when it was made                              |
| `preorder_date`     | —                                                 | empty                                           | —                                                                                                      |
| `upc`               | —                                                 | empty                                           | **missing** for releases already out — new UPC means a new release on the stores                       |
| `copyright`         | —                                                 | defaults to `682 Distribution`                  | leave default, or `Vova Zakharov`                                                                      |
| `cover`             | `assets/covers/<slug>.jpg`                        | none: father-sea has no cover yet (`wip: true`) | **all 22 site covers are 600×600**, below the 1400 minimum — the originals have to come from elsewhere |
| `cover_ai`          | —                                                 | 1                                               | the cover is AI-made — a constant                                                                      |

## Track fields (`new_track` / `update_track`)

| 682 field         | From                                    | «Двадцать» →                             | Gap                                                                                                                                                        |
| ----------------- | --------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`           | `title`, or the locale's `title` string | `Двадцать`                               | `title: { translation }` is a gloss, not a name — skip it                                                                                                  |
| `version`         | —                                       | empty                                    | —                                                                                                                                                          |
| `artists`         | `project` → `"<first> feat. <rest>"`    | `Полуживые feat. Грёбаный бал`           | the cabinet checks it matches the release's `artists` + `feat_artists` — a track whose lead differs from the album's (26 songs have features) needs a look |
| `author` (lyrics) | `credits.lyrics`, else `SONG_AUTHOR`    | `Вова Захаров`                           | 682 likely wants the legal name (`Владимир Захаров`) — `people.ts` has stage spellings                                                                     |
| `composer`        | `credits.music`, else `SONG_AUTHOR`     | `Вова Захаров, Владимир Захаров-старший` | same                                                                                                                                                       |
| `explicit`        | `explicit`                              | `0`                                      | —                                                                                                                                                          |
| `instrumental`    | `language: instrumental`                | `0`                                      | —                                                                                                                                                          |
| `track_language`  | `language[0]` → 682's Russian name      | `Русский`                                | a lookup table; **Greek is not on 682's list** (1 song), `ru-latn-x-russisch` → `Русский`                                                                  |
| `text`            | body `<!-- lyrics:<language> -->`       | the Russian lyrics                       | parse the body; strip footnotes and voice notes                                                                                                            |
| `isrc`            | —                                       | empty                                    | **missing** — reuse the old ISRC for anything already released, or the stores treat it as a new recording                                                  |
| `preview_start`   | —                                       | empty                                    | optional (TikTok/preview cut)                                                                                                                              |
| `ai_full`         | constant                                | `1`                                      | Suno: lyrics + music + vocal. `ai_music` where `credits.lyrics` names a real poet (Некрасов, Танич)                                                        |
| `wav`             | `vovas-music/<repo>` master             | `first` repo's FLAC → WAV                | FLAC→WAV is lossless; **13 songs are `lossy: true`** (MP3 master) — an upsampled WAV may get flagged                                                       |

## What to decide before scripting

1. **Covers**: where the full-size originals live (≥1400 px).
2. **Release dates and genres**: one table per album/artist — a new frontmatter field, or a separate file under `docs/music/`.
3. **ISRC/UPC of what is already out**: from the old distributor's export, or the Spotify API by search (no song has a `spotify` id yet).
4. **Author names**: stage names or legal ones in `author`/`composer` — ask 682, or check Valeria's release metadata.
