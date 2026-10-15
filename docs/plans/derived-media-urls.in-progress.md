# Derive every song file's URL from the catalogue

PR: https://github.com/vzakharov/vovazakharov.com/pull/157 (same branch, before
merge — `stream` is not on `main` yet, so dropping it now costs no migration of
the live frontmatter beyond this branch's own).

## Why

A song's frontmatter states three file URLs under three unrelated keys —
`audio`, `mp3.url`, `stream` — though `pnpm music:masters tag` already derives
every file name from the billing and `check` (in vet) fails on a song it has not
tagged. Measured over the 170 songs: every `mp3.url` is the master's URL with
`.mp3`, every `stream` sits beside the master under the English page's Latin
name. The URLs carry only two facts the catalogue does not: **which repository
and branch** the master sits in, and **whether there is a lossless master**.

## Decisions (the operator's, in session)

- **A master sits in its song's own repository** (`repo`). ~30 songs keep theirs
  in an album repository (`dng_album`, `Divine-Discontent--album-`,
  `vagabond_album`, `stories`, `psch_album`, `ghosts-of-flesh`, `rus-`,
  `papa-reka`): move them into the song's repo.
- **Every song repository's branch is `main`.** Five default to `master`:
  `golodnaa`, `lake`, `like-that`, `love`, `meow`.
- **A song with no lossless master carries a boolean flag**, true where the
  master is itself the MP3 (13 songs); absent/false means a FLAC master with an
  MP3 copy and an MP4 stream.

## Decisions taken here (open to the operator; none blocks starting)

- Flag name `lossy: true`; size field `mp3Bytes` (top level, replacing
  `mp3: { bytes }`). `mp3Bytes` stays: RSS needs the enclosure's `length`, and
  the tag run writes it, so nobody types it.
- **The live site must not break between these steps and the deploy**: files are
  _copied_ into the song repos and `main` is _created_ at `master`'s head (then
  made default), never renamed or deleted; the album copies and the `master`
  branches go after the deploy — the album copies through
  `pnpm music:masters prune`, the five `master` branches by hand (list them in
  the PR).
- **Where the tag run reads a song's current file from is `tag-renders.json`**,
  which already records every `<repo>/<path>` a run read or wrote (e.g.
  `one-day` → `Divine-Discontent--album-/GENERATED - One Day.flac`). Source
  lookup per file type: the derived name in the song repo's tree, else a
  recorded path with that extension, fetched from its own repository's default
  branch (an album repo during the move, the same repo after a title edit). With
  the move expressed this way, the migration is just a `tag` run — the job hash
  gains the repository, so the moved songs read as stale.
- **A new song gets its manifest entry from the scaffolder**: `findMaster`
  already locates the root FLAC and its `.master.mp3`; it records those paths
  under the slug with an empty hash, so `check` fails until `tag` names them.

## Steps

- [ ] Create `main` at `master`'s head in the five repositories and make it the
      default (Git refs API + `PATCH repos/…` `default_branch`); `master` stays.
- [ ] Shared derivation in `src/pages/music/lib/` (beside `master-url.ts` /
      `song-files.ts`): from `repo`, `lossy` and the billing — the master URL
      (`.flac`, or `.mp3` when `lossy`), the MP3 URL, the stream URL. Move
      `ownLocale`/`fileNames` out of `scripts/lib/song-tag-source.ts` into it so
      the player, the feed, the downloads and the tag run share one.
- [ ] Schema (`shared/music-catalogue/frontmatter.ts`): drop `audio`, `mp3`,
      `stream`; add `lossy` (default false) and `mp3Bytes`; `repo` becomes
      required (all 170 have one; the site-hosted `/…` source goes); drop the
      `isMp3` refine.
- [ ] Consumers: `songTrack` (plays the stream, or the MP3 when `lossy`),
      `songEpisode` (MP3 URL + `mp3Bytes`), `songFiles`/`songDownloads` (drop
      the untagged branch — a song with no manifest entry fails the build; the
      guard covers the player's URL too).
- [ ] Tag run (`song-tag-source.ts`, `song-tagging.ts`): files from the
      derivation, sources from the manifest as above (fetch across repos);
      `jobHash` gains repo + branch; `repointDocument` writes only `mp3Bytes`;
      `rewriteSongDocument` shrinks to that (+ its test); `songRepo`'s
      one-repository check goes; `prune` groups recorded paths by their own
      repository rather than slicing by the job's.
- [ ] Scaffolder (`scripts/scaffold-song.ts`): writes `repo`, `seconds`,
      `mp3Bytes`, `lossy` where the master is an MP3, and the manifest entry.
- [ ] Rewrite the 170 song documents' frontmatter (one-off script under `tmp/`):
      drop `audio`/`mp3`/`stream`, add `mp3Bytes`, `lossy: true` on the 13.
- [ ] `pnpm music:masters tag`: moves the ~30 album-held masters into their song
      repos and tags the five `main` branches' files; `check` passes over 170.
- [ ] Docs: `.claude/rules/songs.md` § "Frontmatter", the schema docstrings,
      `scripts/song-intake/CLAUDE.md` where it names `audio`/`mp3.url`.
- [ ] PR body: the post-deploy steps (`prune`, delete five `master` branches).

## DRY notes

- One derivation module replaces three hand-kept URLs and the two places that
  already compute names (`song-files.ts`' `namedHref`, the tag run's
  `fileNames`); `master-url.ts`' `rawUrl` builds every URL.
- The manifest is reused as the record of where files are rather than adding a
  `source` field: it already holds exactly that, and a second record would drift
  from it.
- No abstraction for the branch migration: five API calls, once.

## Done so far

Commit db3edfd: the schema, the derivation (`song-files.ts`: `songHome`,
`songFiles`, `playedName`; `song-names.ts`: `savedNames`, `mp3Url`), the
consumers, the tag run, the scaffolder, the 170 documents (13 `lossy`), the
docs. Deviations from the steps above, each deliberate:

- **Staleness, not the hash, picks up the move.** The hash is unchanged (the
  master still first in `files`), and a song is also stale while a path it
  derives was never recorded — so `check` lists exactly the 35 songs whose
  masters sit in another repository, and the other 135 need no re-run. Adding
  repo + branch to the hash would have re-tagged all 170.
- **The player plays the English page's Latin name** for both shapes (the MP4
  rewrap, or a lossy MP3 master), so `songTrack` needs only `songBilling` and no
  import cycle; the feed encloses the MP3 under the song's own name, as before,
  so podcast enclosure URLs do not move.
- **`assertWritten` (`tag-manifest.ts`) guards the played, downloaded and
  enclosed URLs**; it cannot see the branch, so the five `master` repos pass it
  before `main` exists.
- `music:scaffold` runs under `--conditions=react-server` to reach the manifest,
  and refuses a repository whose default branch is not `main`.

`pnpm music:masters tag --dry-run quiet-snow` staged the five derived files in
`sneg` from `dng_album`. Typecheck, lint of the touched files and both tests
pass.

## Left

1. **Blocked on the operator's permission** — the auto-mode classifier denied it
   as "Modify Shared Resources": create `main` at `master`'s head in `golodnaa`,
   `lake`, `like-that`, `love`, `meow` and make it the default
   (`gh api -X POST repos/vovas-music/<r>/git/refs -f ref=refs/heads/main -f sha=<master sha>`,
   then `gh api -X PATCH repos/vovas-music/<r> -f default_branch=main`).
2. Then `pnpm music:masters tag` (35 songs, publishes to their repos — the same
   permission question), commit the manifest and `mp3Bytes`, and
   `pnpm music:masters check` passes. Until then the build fails on those 35
   songs' guard, by design.
3. `/polish`, then the PR body: the post-deploy steps (`prune`, deleting the
   five `master` branches by hand).
