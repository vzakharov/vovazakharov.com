# Relay 2 — naming and tagging the song masters

## 1. Standing constraints

None stated by the operator beyond the repo's own rules. Relay 1
(`docs/remove-before-merging/relay-1.md`) holds the planning conversation.

## 2. The conversation

No operator message reached this session. It was started by relay 1 with
`/relay take claude/music-file-names-and-tags-5hw4ll`, whose Next step was
`go` on the paused plan, go-ahead «давай начнём».

**Agent:** Greeted Вова, claimed the plan (19f9010), ran checklist items 1–2,
then hit the context budget's 200k warning at ~200k (the session's fixed
prompt is large) and paused the plan for a relay rather than starting the
tag script. Took recommendations 1, 3, 6, 7 as written (the plan's
§ "Questions"); the operator has not been told that explicitly yet.

## 3. Intent

Unchanged from relay 1 § 3: every master the site plays or offers downloads
as `<Artist> - <Title>.<ext>`, spelled as the reader's page spells it, with
full tags.

## 4. Decisions

- **`songFileName` takes a resolved `SongBilling`, not the frontmatter** —
  the plan's signature `songFileName(frontmatter, locale, script, ext)`
  cannot live in `shared/` because the artist spelling (`projectName`) is in
  `pages/music/lib`. The caller resolves; the function stays pure and
  tested.
- **`songFileNames` returns a `Spelled`**, so a download link renders
  through the same `data-spelling` pair `Spelling` uses.
- **Features join as `A feat. B & C`.**
- **Git push from a blobless shallow clone replaces the Git Data API** —
  beats it because a push has no content-creation rate limit (the plan's
  ~500 writes/hour pacing goes away) and the clone fetches only trees
  (`boom`: 0.8 s, 40 MB). Untested: the push itself from such a clone.
  This is a deviation from the plan to mention to the operator.
- **FLAC cover through the file's combined tag** (`file.tag.pictures`), a
  native picture block — not `METADATA_BLOCK_PICTURE` as the plan's table
  says; that is the Ogg convention, and setting both duplicates the cover.
- **Audio check by `ffmpeg -f md5`** for both containers; `metaflac` is not
  installed.

## 5. Errors and dead ends

- Setting `pictures` on the `XiphComment` and letting the FLAC file sync
  wrote the cover twice; fixed as above.
- The repo's PreToolUse hook refuses `cat`/`sed -n` on files; use `Read`.

## 6. State

- Branch `claude/music-file-names-and-tags-5hw4ll`, head 44b9b17 (pushed),
  then this summary's commit. PR #153, draft, base `main`, `MERGEABLE`.
- Plan: `docs/plans/music-file-names-and-tags.paused.md`; its `## Status`
  carries every fact above in more detail, and the checklist ticks items 1–2.
- Commits here: 19f9010 (claim), the `node-taglib-sharp` devDependency,
  abc633a (`src/shared/music-catalogue/file-name.ts` + test, exported from
  `index.node-safe.ts`), 44b9b17 (pause).
- Nothing running; no PR subscription, no check-in.
- Estimate: this session 1.5 h senior developer ("proving a tag library
  against two containers without touching the audio, and a file-name rule
  that has to hold on every filesystem and in two scripts, takes someone who
  has shipped media tooling"). Remainder for the successor: 5.5 h senior
  developer ("the cross-repo upload from blobless clones, a tag writer for two
  containers, and derived names the static build verifies offline") + 2 h
  middle qa ("downloading every spelling and inspecting the files across
  players and OSes, Cyrillic names on Windows included").

## 7. Pointers

- The plan — the whole spec, with the established facts in `## Status`.
- `src/shared/music-catalogue/file-name.ts` — the naming rule.
- `src/pages/music/lib/song-files.ts` (+ test), `songs.ts` (`songTrack`
  shows how billing and title resolve), `artists.ts` (`projectName`),
  `albums.ts` (`albumTitle`, `albumArtist`), `song-text.ts` (`songLyrics`),
  `lyric-notes.ts` (`entryText`, `withoutNotes`), `lyric-inline.ts`
  (`inlineRuns`), `pictures.ts` (`songPicture`),
  `src/shared/music-catalogue/people.ts` (`SONG_AUTHOR`, credits as
  `{en, ru}`), `src/pages/music/ui/song-page.tsx` (`SongFileLink`),
  `src/pages/music/lib/song-feed.ts` (`downloadLinks`, `songEpisode`).
- `scripts/lib/render-manifest.ts` and `src/shared/content/content-hash.ts`
  — the manifest pattern to follow.
- Predecessor transcripts: this session
  https://claude.ai/code/session_01WXzng1hsyQfpvKgh6WHaHN; relay 1's
  https://claude.ai/code/session_015FVowBFW5zv12Bs8vazfKZ.

## 8. Next step

`/go` on the paused plan from checklist item 3 — the go-ahead its flip
quoted, «давай начнём». Try the blobless-clone push on `boom` early, since the
script's shape depends on it. In the first report, tell the operator which
of questions 1, 3, 6, 7 were taken as recommended and the two deviations
(git push instead of the Git Data API; FLAC native picture block).
