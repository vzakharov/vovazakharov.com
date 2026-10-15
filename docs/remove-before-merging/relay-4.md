# Relay 4 — derive every song file's URL

## Standing constraints

None stated by the operator in this session.

## The conversation

The operator sent no message in this session. It was opened by the predecessor's `/relay take claude/radio-webkit-seek-mnv6xc` and ran relay-3's Next step: resume the paused plan `derived-media-urls` with `/go`.

**Agent's opening reply** (to the operator): greeted Вова, said the plan was claimed (`in-progress`), and named the agent-taken choices open to them: `lossy: true` and top-level `mp3Bytes`; the tag run finding each song's current file in `tag-renders.json`; the scaffolder writing a new song's manifest entry. The operator has not answered yet.

## Intent

From relay-3, unchanged: a song's frontmatter states only `repo`, `seconds`, `lossy`, `mp3Bytes` (plus everything non-media), and every file URL is derived. The operator's decisions: masters move into the song's own repository; every song repository's branch is `main`; a boolean marks a song without a lossless master.

## Decisions

- **Staleness, not the hash, picks up the move.** The job hash is byte-for-byte the old one (master first in `files`). A song is also stale while a path it derives was never recorded in `tag-renders.json`. So `pnpm music:masters check` lists exactly the 35 songs whose masters sit in another repository (34 in album repos plus `sisters`, repo `lake`, file in `stories`), and the other 135 need no re-run. The plan's "hash gains repo + branch" would have re-tagged all 170.
- **The player plays the English page's Latin name** (`playedName` in `song-files.ts`): the MP4 rewrap for a FLAC master, the MP3 itself for a `lossy` one. That keeps `songTrack` free of an import cycle. The feed encloses the MP3 under the song's own name (`mp3Url` in `song-names.ts`), the same URL as before, so podcast enclosures do not move.
- **`assertWritten` (`src/pages/music/lib/tag-manifest.ts`)** fails the build on a played, downloaded or enclosed URL whose `<repo>/<path>` no tag run recorded. It cannot see the branch, so the five `master`-default repos pass it before `main` exists there. That branch step must therefore land before a deploy.
- **The tag run's source lookup** (`sourceOf` in `scripts/lib/song-tagging.ts`): a derived name present in the song's repo, else a recorded path with the file's extension, own repo first, read from its repository's default branch (`sourceClones`).
- `music:scaffold` now runs under `--conditions=react-server` to reach the manifest. It refuses a repo whose default branch is not `main` and records the root FLAC and `.master.mp3` with an empty hash.
- The operator's still-open choices (naming `lossy` and `mp3Bytes`, manifest-as-source, the scaffolder's manifest entry) are as relay-3 lists them.

## Errors and dead ends

- **The auto-mode classifier denied** creating `main` in the five repos ("Modify Shared Resources"). The command was a loop of `gh api -X POST repos/vovas-music/<r>/git/refs -f ref=refs/heads/main -f sha=<master sha>` then `gh api -X PATCH repos/vovas-music/<r> -f default_branch=main`, for `golodnaa lake like-that love meow`. Two harmless read-only commands were denied right after it too, then Bash worked again.
- The first push was rejected because the Stop hook had pushed a cost row. It was merged in with a merge commit, never forced.

## State

- Branch `claude/radio-webkit-seek-mnv6xc`, PR https://github.com/vzakharov/vovazakharov.com/pull/157 (draft, base `main`, MERGEABLE at attach). Head: 804a43e (plan paused), on top of db3edfd (the feature commit).
- Plan: `docs/plans/derived-media-urls.paused.md`. Its `## Done so far` and `## Left` are the record of what is done and what is left.
- No vet run yet. Typecheck is clean, lint of the touched files is clean, and `song-files.test.ts` plus `song-tag-rewrites.test.ts` pass. **The build fails today on the 35 stale songs by design** until the tag run.
- `pnpm music:masters tag --dry-run quiet-snow` staged the five derived files in `sneg`, read from `dng_album`. Its clone may be left under `tmp/music-tag/` (gitignored).
- Nothing is running or subscribed.
- Estimate: this session's is 4.5 h senior developer (the schema, consumers, tag run, scaffolder and 170 documents). Remainder handed on: 1.5 h senior developer, for running and checking the live branch and tag steps across 35 repositories, `/polish` over a 190-file diff, and the PR body's post-deploy steps.

## Pointers

- `docs/plans/derived-media-urls.paused.md`: the design, the deviations and what is left.
- Code: `src/pages/music/lib/{song-files,song-names,tag-manifest,songs,song-feed,song-downloads}.ts`; `src/shared/music-catalogue/frontmatter.ts`; `scripts/lib/{song-tagging,song-tag-source,song-tag-rewrites}.ts`; `scripts/scaffold-song.ts`.
- `tmp/survey.py` and `tmp/derive-frontmatter.py` are untracked one-offs and may not survive. The first measures where every master sits.
- Re-check the repo defaults with `gh api repos/vovas-music/<repo> --jq .default_branch`.
- Predecessor transcripts: this session https://claude.ai/code/session_01PtqpksWPzYE79Xi3d56oga; before it https://claude.ai/code/session_013MEGG94kUKHYEZqYVfERaE.

## Next step

Resume the paused plan with `/go`, starting at `## Left` 1. That step and the tag run both write to live `vovas-music` repositories, which auto mode denied. So the first reply asks the operator for permission, unless their message already grants it, with a fenced message naming both actions exactly:

```
Разрешаю: создать ветку main на голове master в vovas-music/golodnaa, lake, like-that, love, meow и сделать её веткой по умолчанию (gh api POST git/refs + PATCH default_branch); затем запустить pnpm music:masters tag, который публикует коммиты в 35 репозиториев песен.
```

Then run them, commit the manifest and `mp3Bytes` changes, check that `pnpm music:masters check` passes, and run `/polish`, then `/pr` (the PR body names the post-deploy `prune` and deleting the five `master` branches by hand).
