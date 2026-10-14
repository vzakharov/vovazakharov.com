# Relay 4 — naming and tagging the song masters

## 1. Standing constraints

None stated by the operator beyond the repo's own rules. Relays 1–3
(`docs/remove-before-merging/relay-1.md` … `relay-3.md`) hold the earlier
sessions.

## 2. The conversation

No operator message reached this session. It was started by relay 3 with
`/relay take claude/music-file-names-and-tags-5hw4ll`; relay 3's Next step was
`/go` on the paused plan, go-ahead «давай начнём».

**Agent:** Attached, claimed the plan (resume commit quoting «давай начнём»),
and gave Вова the first report relay 3 asked for. It covered the
recommendations taken (questions 1, 3, 6, 7, all as written) and the two
deviations (git push from a blobless clone instead of the Git Data API; FLAC
cover as a native picture block). It also repeated the permission message for
pushing to `vovas-music`, which he has **not** yet sent:

```
Разрешаю пушить в репозитории организации vovas-music (git push из клона в tmp/music-tag/), начиная с пробного пуша временной ветки tag-spike в vovas-music/boom и её удаления после проверки.
```

Then it built the tag writer and the resolver (§ 6), hit the 200k context
warning, paused the plan and auto-relayed.

## 3. Intent

Unchanged from relay 1 § 3: every master the site plays or offers downloads
as `<Artist> - <Title>.<ext>`, spelled as the reader's page spells it, with
full tags.

## 4. Decisions

Relays 2–3 § 4 stand. Added here, and recorded in the plan's `## Status`:

- **The frontmatter's own name** is the song's name in its _own locale_: the
  sung language (or `titleLanguage`) when it is a locale that keeps the name,
  else the first locale that keeps it. That name comes first in
  `MasterFile.names`.
- **`songTagJobs` skips a song with no `vovas-music` file**: a site-root path
  (`/music/assets/…`, the two vendored songs) is not parsed as a URL. Those
  two join after item 5 moves them.
- **The run's design** for `scripts/tag-songs.ts` (git ops, frontmatter
  rewrite, manifest `{ hash, paths }`, `--check`, `--prune`) is written into
  the plan's Status; follow it rather than re-deriving it.

## 5. Errors and dead ends

- `MUSIC_ORGANIZATION` and the file-name functions have to come from
  `@/shared/music-catalogue/index.node-safe` in a script; the main barrel lacks
  the first. The main barrel now also exports the file-name functions, because
  `songs.ts` needs `SongBilling` from it.
- The PreToolUse hook refuses `cat`/`sed -n`/`cat >` on files; use `Read` and
  `Write` (scratch drivers live in `tmp/music-tag/`).

## 6. State

- Branch `claude/music-file-names-and-tags-5hw4ll`, PR #153 (draft, base
  `main`, `MERGEABLE`/`CLEAN` at attach). Last work commits: 52ba8ca the writer
  (`feat(vova): write a song's tags into its MP3 and FLAC`), 7a899bd the
  resolver, 3c21e45 the pause; then this summary.
- Plan: `docs/plans/music-file-names-and-tags.paused.md`; its `## Status`
  lists what is done and exactly what is left of item 3.
- Nothing running; no PR subscription, no check-in. `boom` on GitHub
  untouched. `tmp/` does not travel. Re-create it with:
  `curl -sSfL -o tmp/music-tag/boom/<f> https://raw.githubusercontent.com/vovas-music/boom/main/<f>`
  for `boom.flac` and `boom.master.mp3`. The original audio MD5s are
  `bb7f81fb…` (FLAC) and `ae1927c1…` (MP3), from
  `ffmpeg -v error -i f -map 0:a -f md5 -`.
- Estimate: this session 1.5 h senior developer ("a tag writer for two
  containers verified on real masters, and a resolver that drives every tag and
  name off the page's own catalogue model"). Remainder for the successor: 3 h
  senior developer ("the cross-repo upload from blobless clones, the
  frontmatter rewrite and a manifest that keeps names and tags checkable
  offline") + 2 h middle qa ("downloading every spelling and inspecting the
  files across players and OSes, Cyrillic names on Windows included").

## 7. Pointers

- `scripts/lib/song-tag-writer.ts`: `writeSongTags`.
- `scripts/lib/song-tag-source.ts`: `songTagJobs`, `rawUrl`, `MasterFile`.
- `scripts/lib/song-tags.ts` + test: the tag set.
- `src/pages/music/lib/songs.ts` `songBilling`; `song-text.ts` `sungStanzas`.
- `scripts/lib/render-manifest.ts`: the manifest pattern (not reused, per DRY
  notes). `scripts/scaffold-song.ts`: `json()`/`raw()` to share if needed.
- `tmp/music-tag/try-source.ts` pattern (lost with the container): run a
  driver as `scripts/in-site.sh vova tsx --conditions=react-server ../../tmp/…`.
- Transcripts: this session
  https://claude.ai/code/session_013U628jQLz4SCsaDv7RaqBj; relay 3's
  https://claude.ai/code/session_01GFXBPsPD2GHoeFrbJAKrVu; earlier ones in
  `relay-3.md` § 7.

## 8. Next step

`/go` on the paused plan, continuing item 3 with `scripts/tag-songs.ts` and
the `music:tag` package entry, as the plan's Status lays out. The go-ahead the
flip quotes is «давай начнём». Build and run everything short of the push
locally on `boom`. The push waits for Вова's permission message in § 2; when
it arrives, run the `tag-spike` test push on `boom` first and delete the
branch after. Also raise the billing nit from the Status: the page writes
`A feat. B, C` and the file name writes `A feat. B & C`.
