# Every song streams its FLAC rewrapped in MP4

**Builds on [#153](https://github.com/vzakharov/vovazakharov.com/pull/153)**
(merged): its `pnpm music:masters` already renames, retags and republishes every
master, so the rewrap rides that run instead of a pipeline of its own. Merge
`main` into this branch before the first source edit.

**`sultan.mp4`, the test file, stays out of the manifest.** It is not a derived
name, so `prune` leaves it alone, and the test page kept at `seek-test/` still
plays it.

## The bug, and what it comes from

On an iPhone, the radio joins a song earlier than the dial shows. When the dial
moves on, the previous song keeps playing. A manual seek lands early too.

AVFoundation plays media for every iOS browser. It seeks a bare FLAC by estimate
and still reports the second it was asked for, so the `<audio>` element falls
behind the clock the dial reads.

**Tested on «Мой султан»**, on a test page served from that repository's GitHub
Pages (Pages is off again; the page is kept as
`vovas-music/sultan/seek-test/index.html`, with a README saying how to bring it
back), on iPhone Safari (UA `iPhone OS 18_7 … Version/26.6.1`):

- A 1 s SEEKTABLE (vovas-music/sultan#1) does not fix it. With nothing loaded
  yet, the seektabled FLAC lands nowhere near the target. On the site, with part
  of the song already loaded, it missed by a few seconds. The miss tracks how
  much has loaded, not the table, so AVFoundation most likely ignores the table.
- The same FLAC stream copied into MP4 (vovas-music/sultan#2,
  `ffmpeg -c:a copy`, decoded audio identical) seeks exactly as the MP3
  reference does. The operator: «mp4 играет как mp3, flac отстаёт».
  `canPlayType('audio/mp4; codecs="flac"')` answers `probably`.

## The work

- **Each song's repository gets an MP4 rewrap of its FLAC master**, named by
  #153's file-name scheme with an `.mp4` extension. Made with
  `ffmpeg -i <master>.flac -map 0:a -c:a copy -movflags +faststart <name>.mp4`.
  The `+faststart` puts the index first, so playback starts before the whole
  file loads. A song whose master is already an MP3 needs nothing.
- **The frontmatter's `stream` names it**, and the player plays
  `stream ?? audio`. `audio` stays the FLAC, which the downloads keep. The field
  and sultan's entry already exist as commit 8df1b894 on #160's branch
  (`claude/sultan-mp4-stream-mnv6xc`). Cherry-pick that commit here, then close
  #160. The operator: «нет, не надо, дождёмся #153», so sultan does not ship on
  its own first.
- **It goes through #153's `pnpm music:masters`**, in
  `scripts/lib/song-tagging.ts`:
  - **`tagFile`**, for a FLAC: once the tags are written and the audio md5 check
    passes, rewrap the local tagged file into MP4. The md5 must equal the
    FLAC's. Stage the MP4 in the same repository commit. ffmpeg carries the
    Vorbis tags across as MP4 metadata.
  - **One name per song**, the Latin spelling of #153's download name with
    `.mp4` (`Poluzhivye - Moy Sultan.mp4`). Only the player fetches this file,
    so it needs no locale variants, and ASCII keeps its URL plain.
  - **`repointDocument`** writes `stream:` as well as the URLs it already
    repoints. The manifest records the MP4's path next to the others, so `prune`
    keeps working.
  - **`jobHash`** includes the stream name, so every song tagged before this
    change reads as stale. `check` then fails on it, and one `tag` run rewraps
    the whole catalogue. No separate check is needed.
- **`scripts/song-intake/CLAUDE.md` § "A song's repository"** lists the rewrap
  next to the MP3 copy, so a new song gets one before its page exists.
  `.claude/rules/songs.md` names `stream` among the frontmatter fields.
- **No unit test for the split**: `songFiles` takes `Pick<…, 'audio' | 'mp3'>`,
  so the type already keeps `stream` out of the downloads, and `songTrack` sits
  behind the server-only content layer that no unit test reaches.

**Cost:** each song's repository holds a second file the size of its FLAC (~25
MB). The site serves the same bytes in a container AVFoundation can seek.

**Deferred, outside these PRs:** playing the MP3 by default together with an HQ
button: «на проигрывание мп3 по дефолту мы перейдём, но уже когда введём
кнопочку HQ, не в этих пиарах». Once MP4 seeks exactly, the HQ default no longer
depends on this bug.

**Rejected: a SEEKTABLE in every master.** The cold test shows the table does
not change where AVFoundation lands, while the rewrap removes the miss entirely.
The table already in `sultan.flac` costs 4 KB and stays.

## DRY notes

- The player's source is resolved once, in `songTrack`. All three places that
  set or compare the element's `src` already read `track.audio`, so none of them
  change.
- The rewrap is made and checked in `music:masters`, next to the MP3 copy and
  the tags. The publishing (clone, Git Data API, large-blob relay) is #153's,
  reused unchanged.

## Progress (paused for the context budget)

**Done:**

- `main` (with #153) merged in; #160's commit cherry-picked (893d54ac): the
  `stream` frontmatter field and `songTrack`'s `stream ?? audio`. Sultan's test
  `stream:` line was dropped in the merge — the tag run writes it.
- `scripts/lib/song-tagging.ts`, `song-tag-source.ts`, `song-tag-rewrites.ts` (+
  test) implement the rewrap, the `stream` repoint, the manifest/prune paths and
  the hash (9241c33a, f9a48812). The stream name is the English page's Latin
  billing (`Poluzhivye - Moy Sultan.mp4`).
- `pnpm music:masters tag --dry-run my-sultan` verified: the commit adds only
  the MP4, decoded md5 equals the FLAC's (`ed58ef12…`), atoms
  `ftyp, moov, free, mdat`, MP4 tags carried across.

**Left:**

- The real run, `pnpm music:masters tag` over the catalogue: one commit per
  `vovas-music` repository, ~25 MB per FLAC song; then commit the repointed song
  documents and `tag-renders.json`, and confirm `pnpm music:masters check`
  passes (vet runs it, and every song reads stale until the run).
- `scripts/song-intake/CLAUDE.md` § "A song's repository": list the rewrap
  beside the MP3 copy. `.claude/rules/songs.md`: name `stream` among the
  frontmatter fields, next to the masters' names and tags.
- The plan's test bullet: `songFiles` takes `Pick<…, 'audio' | 'mp3'>`, so the
  type already keeps `stream` out of the downloads, and `songs.ts` imports the
  server-only content layer, so no unit test reaches `songTrack`. Drop the
  bullet rather than open a seam for it.
- Close #160 (its commit lives here now). Then `/go` Steps 3–4: `/polish`, `/pr`
  refresh.
