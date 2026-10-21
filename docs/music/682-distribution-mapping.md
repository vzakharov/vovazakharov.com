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

### From the album's frontmatter

- **`title`** — album `title`, or `ru.title` for the Russian stores. «Двадцать» → `Папа-море`.
- **`artists`** — album `artist`, or `ru.artist`. → `Полуживые`.
- **`type`** — `Single` / `EP` / `Album`. → `Album`. Derived: `album: null` is a Single; nothing tells an EP from an Album, so it would go by track count.
- **`cover`** — `assets/covers/<slug>.jpg`. father-sea has none yet (`wip: true`), and **all 22 site covers are 600×600**, below the 1400 minimum: the originals have to come from elsewhere.

### Missing

- **`genre`, `subgenre`** — a fixed English list (`Electronic`, `Rock`, `Hip Hop/Rap` …). One per artist would do.
- **`date`** — the release date is a decision; a song's `date` is when it was made.
- **`upc`** — needed for releases already out: a new UPC means a new release on the stores.

### Constant or left empty

- **`cover_ai`** — `1`, the covers being AI-made.
- **`copyright`** — defaults to `682 Distribution`; leave it, or `Vova Zakharov`.
- **`version`**, **`preorder_date`** — empty.
- **`feat_artists`** — empty: an album has no feat field, and a release-level feat is rare.

## Track fields (`new_track` / `update_track`)

### From the song's frontmatter and body

- **`title`** — `title`, or the locale's `title` where it is a string. → `Двадцать`. A `title: { translation }` is a gloss, not a name, and is skipped.
- **`artists`** — `project` as `"<first> feat. <rest>"`. → `Полуживые feat. Грёбаный бал`. The cabinet checks it against the release's `artists` + `feat_artists`, so a track whose lead differs from its album's needs a look (26 songs have features).
- **`author`** (lyrics) — `credits.lyrics`, else `SONG_AUTHOR`. → `Вова Захаров`. 682 likely wants the legal name (`Владимир Захаров`), and `people.ts` holds stage spellings.
- **`composer`** — `credits.music`, else `SONG_AUTHOR`. → `Вова Захаров, Владимир Захаров-старший`. Same question.
- **`explicit`** — `explicit`. → `0`.
- **`instrumental`** — `language: instrumental`. → `0`.
- **`track_language`** — `language[0]` through a lookup to 682's Russian names. → `Русский`. **Greek is not on 682's list** (1 song); `ru-latn-x-russisch` → `Русский`.
- **`text`** — the body's `<!-- lyrics:<language> -->` section, footnotes and voice notes stripped. → the Russian lyrics.
- **`wav`** — the `vovas-music/<repo>` master. → the `first` repo's FLAC, converted. FLAC→WAV is lossless; **13 songs are `lossy: true`** (MP3 masters), and an upsampled WAV may get flagged.

### Missing

- **`isrc`** — reuse the old ISRC for anything already released, or the stores treat it as a new recording.

### Constant or left empty

- **`ai_full`** — `1`: Suno made the lyrics, music and vocal. `ai_music` instead where `credits.lyrics` names a real poet (Некрасов, Танич).
- **`version`** — empty.
- **`preview_start`** — optional, the TikTok/preview cut.

## What to decide before scripting

1. **Covers**: where the full-size originals live (≥1400 px).
2. **Release dates and genres**: one list per album/artist — a new frontmatter field, or a separate file under `docs/music/`.
3. **ISRC/UPC of what is already out**: from the old distributor's export, or the Spotify API by search (no song has a `spotify` id yet).
4. **Author names**: stage names or legal ones in `author`/`composer` — ask 682, or check Valeria's release metadata.
