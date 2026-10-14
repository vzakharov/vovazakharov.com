# Song masters: listener-facing file names and full tags

## Status

**Where it stands:** items 5 and 7 are done, all 170 songs. `hello-human`
points at `machines`' existing `protintro.mp3` (no upload; `machines` has no
README, so none was added), `vovas-music/ghostly-blues` was created with the
master and a README, both vendored MP3s are gone; every frontmatter master URL
answers 200 and `pnpm music:masters check` is clean. `githubApi` retries a 5xx
(a 39 MB blob met a 502 once).

`inverno` (45.9 MB FLAC) and `8849` (65.9 MB) were past what the Git Data API
takes (HTTP 422; 39.4 MB passed). Under the operator's permission «Разрешаю:
встроить в pnpm music:masters заливку больших файлов через временную ветку с
GitHub Actions workflow в репах vovas-music …», `publishHead` relays such a
commit through Actions (`scripts/lib/music-relay.ts`, 3eebe90): bundle cut
into 30 MiB parts on a temporary branch with a generated workflow, which
reassembles it, checks the commit SHA and fast-forwards the branch; the
branch is deleted after. Both ran green, the published trees matching the dry
runs'.

**Left:** item 6's QA across players, then `/finalize` (PR conflicts with
`main`), then `prune` after the deploy.

Approved (6293ffb). **Done:** checklist items 1–2 (the spike, `songFileName`),
and of item 3:

- the pure tag set: `scripts/lib/song-tags.ts` (`buildTags`, `TagSource` =
  `SongBilling` & the rest, `SongTags`) with its test (20b26e7); the artist
  billing is `billedArtists` in `file-name.ts`, shared by the name and the tags;
- the writer, `scripts/lib/song-tag-writer.ts` (`writeSongTags(path, tags,
cover?)`), checked on `boom`'s real files: audio MD5 unchanged, ID3v2.3, one
  cover, idempotent across re-runs;
- the resolver, `scripts/lib/song-tag-source.ts` (`songTagJobs(publicDir)` →
  per song: tags, cover path, and per file its `RepoLocation`, `source` path,
  `field` (`audio`/`mp3`) and `names`, the frontmatter's own first; `rawUrl`
  builds a derived name's URL). It needed `songBilling(document, locale)` in
  `songs.ts` and `sungStanzas` in `song-text.ts`, both added (7a899bd). Run
  under `scripts/in-site.sh vova tsx --conditions=react-server`; 168 songs
  resolve.

- the run, `pnpm music:masters tag` (`scripts/masters.ts`, git half in
  `scripts/lib/music-repo.ts`, text edits in `song-tag-rewrites.ts` + test),
  d668364. `--dry-run` builds each repository's commit in `tmp/music-tag/<repo>`
  and stops; tried on `boom`, `snow-is-falling`, `after-us` (README rewritten)
  and two `nsfl` songs (one commit for both), and the document rewrite on all
  168 songs in memory. README mentions are renamed only where a code span
  holds the bare name: `after-us`'s README also runs `master.py … after-us.mp3`,
  which must stay as it was run.

**Left of item 3:** the first real push (blocked, below), which also proves
pushing from a blobless clone works.

**Item 4 done** (92e7b3c), with the deviation below as built (put to the
operator, unanswered — silence keeps it): `songDownloads(document, locale)` in
`pages/music/lib/song-downloads.ts` links a song absent from
`tag-renders.json` by its frontmatter URLs, and a song in it by
`songFiles(frontmatter, billing)`'s derived names, throwing on one the
manifest does not record. The raw-URL parsing (`masterLocation`, `rawUrl`,
`servedPath`, `RepoBranch`) lives in `pages/music/lib/master-url.ts` and the
manifest's schema and reader in `song-downloads.ts`; the tag script imports
both. Checked with a throwaway manifest for `boom` and `snow-is-falling`: the
en page links both spellings with `data-spelling`, ru one, boom one, the ru
feed the original; a path dropped from it fails the build naming the song.
knip's unused-export finding is gone.

**Item 8 done** except as it depends on the run (69df17a): `music-tag` in
vet's fan-out (fails until every song is tagged, by design), `stack.md`,
`songs.md`, `song-intake/CLAUDE.md`.

**Open, for the operator:** knip reports `ffmpeg` as an unlisted binary in
`scripts/masters.ts` — a system tool, so the fix is `ignoreBinaries` in
`knip.ts`, a suppression that needs their yes.

**The operator permitted `git push`** (verbatim in
`docs/remove-before-merging/relay-7.md` § 1, with the message asking for the
API transport, which writing by API waits on) and the spike ran: **`git push`
cannot work** — the session's git proxy refuses any repository not in the
session's sources, and `add_repo` attaches `vovas-music/*` read-only (no Claude
GitHub App on the organization). **The Git Data API through `gh api` works**
with the session's token: on `boom`, the dry run's two tagged masters went up
as blobs (`POST git/blobs`, base64 via `--input`; 22 MB FLAC fine, ~10 s
total), `POST git/trees` with `base_tree` gave a tree identical to the dry
run's, then `git/commits` and the ref; the raw URL served the file;
`tag-spike` deleted. Script used:
`/tmp/…/scratchpad/api_push_spike.py` (gone with the container) — the
recipe is the sentence above.

**`boom` and `snow-is-falling` are tagged for real** (5734d94), under the
operator's permission «Разрешаю запускать pnpm music:masters (tag, prune, get,
put, create) — он пишет в репозитории организации vovas-music через GitHub
API.» and an allow rule for the command in `.claude/settings.json`; the raw
URLs serve the new names. **Item 6 passed**: the operator downloaded the MP3s
and FLACs, «вроде всё ок»; the FLACs' tags and cover are in the files
(ffprobe) and the player he looked in does not show them — which player is
asked, not answered. His calls since: a featured song's file is
`<Artist> - <Title> feat. <Features>` (f326461; the artist tag keeps
`A feat. B & C`), and knip's `ignoreBinaries: ['ffmpeg']` with its reason
(f326461). The build check as built is approved («ок»). **Next: item 5**, the
vendored songs, with `music:masters create` and `put`, then item 7.

**The API transport**: `commitStaged` publishes through
`publishHead` in `scripts/lib/music-repo.ts` (each new blob checked against
its local SHA, the tree against the clone's), and every operation on the
organization is one script, `pnpm music:masters` (`tag`, `check`, `prune`,
`get`, `put`, `create`), so the operator's permission names it rather than
each `gh api` call. **Left:** the first real `pnpm music:masters tag boom
snow-is-falling` once permitted, then items 5–7 and 9 — the vendored songs
move with `create` and `put`.

**`pnpm type-overlap` is clean** (e9e7cd1): `WithUrl`/`WithLanguage` in
`shared/typings`, `WithSpelledTitle` in `spelling.ts`, `SungWords` in
`song-text.ts`, `WithExtension` + exported `extensionOf` in `song-files.ts`;
keys renamed where they only shared a spelling — `TagSource.sungLanguage`,
`MasterFile.sourcePath`, `SongTagJob.coverPath`, `UrlChange`'s
`oldUrl`/`newUrl` (the manifest hash still keys the cover as `cover`, so no
hash moved). Lint is clean on every file the branch touched.

**Vet blocker left:** `pnpm knip`: `billedArtists`, `songFileName`,
`songFileNames` unused in `shared/music-catalogue/index.ts` until item 4
consumes them. Billing nit to raise with the operator: the page bills
two features `A feat. B, C`, `billedArtists` writes `A feat. B & C`.

**Item 4, how it is meant to go** (nothing written yet): `songFiles` in
`song-files.ts` takes the document plus `songBilling(document, locale)` and
returns per file an `href` that is a `Spelled` (the `vovas-music` URL's last
segment replaced by the encoded `songFileNames(…)`), with a site-root path
left as it is; `SongFileLink` in `song-page.tsx` renders one `TextLink` per
spelling, each wrapped or attributed `data-spelling` the way `Spelling`
(`ui/spelling.tsx`) does; the feed's `downloadLinks` (`song-feed.ts`) takes
`spelledText`'s default for the feed's locale. **Deviation to put to the
operator:** a hard build check against `tag-renders.json` fails every song
until the whole run lands, which also breaks the item-6 preview of `boom`
and `snow-is-falling` alone. Proposed: a song in the manifest must have
every derived path recorded or the build throws (catches a title edit); a
song absent from it keeps its frontmatter URLs as today; `--check` in vet
(item 8) is what refuses a merge with any song untagged.

**Blocked: pushing to `vovas-music`.** The auto-mode classifier refused the
`tag-spike` test push to `vovas-music/boom` as "Create Public Surface"; the
operator was handed a message to send back naming it. Until they do, nothing
can be uploaded; everything up to the upload can be built and run locally.

- `buildTags` decisions: track total is the release's highest track number,
  not its song count (numbers may skip); language is ISO 639-2 bibliographic
  (`zxx` for instrumental); lyrics are the sung column's lines with
  `inlineRuns`' marks dropped, `x2` lines kept as the page shows them.

Facts established, not to re-derive:

- `hello-human`'s MP3 is `vovas-music/machines`' `protintro.mp3` byte for
  byte; the token can push to every `vovas-music` repository;
  `vovas-music/ghostly-blues` does not exist yet; the `data-spelling` rule in
  `src/app/styles/globals.scss` selects any element, so an `<a>` takes it as a
  `<span>` does.
- **The spike** (on `boom`): `node-taglib-sharp` 6.0.3 writes ID3v2.3 UTF-16
  (`Id3v2Settings.defaultVersion = 3`, `defaultEncoding = StringType.UTF16`,
  both `force…` true) and Vorbis comments; `ffprobe` reads every field back,
  and the decoded audio's MD5 (`ffmpeg -i f -map 0:a -f md5 -`) is unchanged
  in both. **The FLAC cover goes through `file.tag.pictures`** (the combined
  `FlacTag`, a native picture block); set on the Xiph comment as well it lands
  twice. `metaflac` is not installed, so `ffmpeg`'s decoded MD5 is the check
  for FLAC too. `TEXT`/`TLAN` via `tag.setTextFrame(Id3v2FrameIdentifiers.X,
…)`, `WOAF` via `Id3v2UrlLinkFrame.fromIdentity`, Xiph extras via
  `setFieldAsStrings`.
- **`songFileName`/`songFileNames`** are in `shared/music-catalogue/file-name.ts`
  and its `index.node-safe.ts`, taking a resolved `SongBilling` (`artists`,
  `title`, each `Spelled`) rather than the frontmatter: the artist spelling
  is `projectName` in `pages/music/lib/artists.ts`, which `shared` cannot
  import. `songFileNames` returns a `Spelled`, so a link renders through the
  same `data-spelling` pair a name does. Left for item 4: a `songBilling(document,
locale)` in `pages/music/lib/songs.ts` (it already imports `projectName`
  and `songTitle`), and `songFiles` in `song-files.ts` taking that billing and
  returning per-file hrefs as a `Spelled`, the last URL segment replaced by
  the encoded name.
- **Push by git, not the Git Data API**: `git clone --filter=blob:none
--depth=1 --no-checkout` of `boom` takes 0.8 s and 40 MB of trees, no
  audio. So per repository: that clone, `git cat-file blob HEAD:<path>` for
  the master and copy (fetches just those blobs), tag, `git hash-object -w`,
  `git read-tree HEAD` + `git update-index --add --cacheinfo` for every
  derived name, commit, push. No content-creation rate limit applies to a
  push, so the pacing in § "The script" falls away; the manifest still makes
  the run resumable. The push from a blobless clone is untested — try it on
  `boom` first.
- **Plan for the tag-set test**: a pure `buildTags(source)` in
  `scripts/lib/song-tags.ts` over already-resolved data (Latin spellings
  picked, `date` → year, `language[0]` → ISO 639-2, credits falling back to
  `SONG_AUTHOR.en`, the sung stanzas joined by blank lines with `_…_` marks
  dropped via `inlineRuns`), tested on a fixture; the catalogue resolution
  lives in `scripts/masters.ts`, run under `--conditions=react-server` as
  `content:og` is, so it can import `pages/music/lib`.

## Goal

Every master the site plays or offers for download from a `vovas-music`
repository — the FLAC in `audio:` and the MP3 in `mp3.url` (or the MP3 in
`audio:` where the master is one) — downloads as `<Artist> - <Title>.<ext>`,
**spelled the way the page the reader is on spells the song**, and carries
the song's tags, so a saved file says what it is and a player shows it
properly.

**Why renaming is the whole fix for the download name:** both links point at
`raw.githubusercontent.com`, another origin, so a browser ignores `download`
there (`SongFileLink` in `src/pages/music/ui/song-page.tsx` says as much) and
saves the file under the URL's last segment. Today that is `boom.master.mp3`,
`nsfl-001.flac`, `мораль_2.mp3`.

## Scope, measured

- 168 song documents in `apps/vova/public/music/songs/` point at
  `vovas-music`, across 148 repositories; 155 have a FLAC master plus its MP3
  copy, 13 an MP3 master alone. Eight repositories hold several songs
  (`nsfl` 13, `vagabond_album` 3).
- The session's token can push to all 249 repositories in the organization.
- Existing tags are thin: `boom.master.mp3` has title and artist only, and
  `boom.flac` has none.
- Two more songs are vendored in this repo under
  `apps/vova/public/music/assets/` and move out to `vovas-music` first
  (§ "The two vendored songs"), which makes 170.
- Out of scope: the mixes (`<slug>_mix.mp3`) and other working files, which
  nothing links.

## The name

**`<Artist> - <Title>.<ext>`** — artist first. That is the convention download
stores, rips and taggers default to (foobar2000's and Mp3tag's
`%artist% - %title%`, Beatport, SoundCloud and YouTube downloads; Bandcamp's
`Artist - Album - NN Title` for album downloads), and it is what sorts a
folder of downloads by artist.

**Spelled as the page shows the song**, per locale and per script chip: `RU`
and `EN / Абв` save `Полуживые - Снег идёт.flac`, `EN / Abc` saves
`Poluzhivye - Sneg idyot.flac`. One function,
`songFileName(frontmatter, locale, script, extension)` in
`shared/music-catalogue`, decides every name:

- **Title**: `spelledText(songTitle(frontmatter, locale), script)` — exactly
  what the page's `<h1>` shows, a locale's own name for the song included
  (`breathe` saves as `Повелитель ветра` from the Russian page).
- **Artist**: each `project` name through `localName(…, locale)` and the same
  script, the spelling the artist pages use; a song with features names them
  as `Poluzhivye feat. GENERATED`, the form taggers and MusicBrainz use.
- **Characters**: beets' default replacements, so a name is legal on every
  filesystem — `\ / < > : " ? * |` become `_`, control characters are dropped,
  a leading `.` and a trailing `.` become `_`, trailing spaces are trimmed.
  `за/обложкой` saves as `за_обложкой` or `za_oblozhkoy`.

**Every name is a path to the same bytes.** A repository gets one path per
distinct name across the song's pages — usually two, one where the title
needs no Latin spelling (`GENERATED - Boom!.flac`), three for a song a
locale renames — and git stores identical content once, so each extra path
costs a tree entry, not a file. That is also why a Russian song with a Latin
title needs no suffix: both spellings land on the same name, which is the
same file. Two different songs landing on one name in one repository fail
the run, naming both.

## The links

`SongFileLink` renders one anchor per spelling the page has, each marked
`data-spelling` as `Spelling` marks a name, so the stylesheet that already
picks a name's spelling by `<html data-script>` picks the link too — static,
no client code. Where the locale has a single spelling it renders the one
anchor it does today.

The href is the master's URL with its last segment replaced by
`songFileName(…)`: the directory comes off the frontmatter's `audio:`, never
off `repo:`, which names a different repository for some songs
(`heres-to-the-virus`'s audio lives in `ghosts-of-flesh`) and a `master`
branch for others.

- **The frontmatter keeps one URL per file**, the song's own name in its own
  script — `songFileName(frontmatter, language, 'original', …)` — for the
  player and the feeds' enclosures, where the name never reaches the
  listener.
- **The feeds' download links** take the feed locale's default spelling
  (`spelledText`'s Latin for the English feed, the original for the
  Russian), since a feed reader has no switch.
- **The build fails on a name no file was written under**, offline: it
  checks every derived name against the manifest (§ "The script"), so a
  title edit without a re-run fails `next build`, not a listener's download.

## The tags

Written from the catalogue, so the frontmatter stays the one source. **One
set of tags per file**, since every name points at the same bytes: the names
in them — title, artist, album — in Latin, the spelling every listener can
read (`spelledText`'s default, as the page title, the feeds and the lock
screen already use). The lyrics stay in the script they are sung in, the
words someone reading along sings (question 6).

| Field               | ID3v2.3 (MP3)        | Vorbis comment (FLAC)      | Source                                    |
| ------------------- | -------------------- | -------------------------- | ----------------------------------------- |
| Title               | `TIT2`               | `TITLE`                    | `songTitle(…, 'en')`, Latin               |
| Artist              | `TPE1`               | `ARTIST`                   | `project`, as in the Latin file name      |
| Album artist        | `TPE2`               | `ALBUMARTIST`              | the album's `artist`, through `localName` |
| Album               | `TALB`               | `ALBUM`                    | the album's `title`, through `localName`  |
| Track               | `TRCK` `n/total`     | `TRACKNUMBER`/`TRACKTOTAL` | `track`, total = the album's song count   |
| Year                | `TYER`               | `DATE`                     | `date`                                    |
| Language            | `TLAN`               | `LANGUAGE`                 | `language`                                |
| Lyricist / composer | `TEXT` / `TCOM`      | `LYRICIST` / `COMPOSER`    | `credits`, else the author                |
| Lyrics              | `USLT`               | `LYRICS`                   | the sung column, notes stripped           |
| Cover               | `APIC` (front cover) | `METADATA_BLOCK_PICTURE`   | `songPicture()` — what the page shows     |
| Song page           | `WOAF`               | `CONTACT`                  | the song's canonical URL                  |

ID3v2.3 with UTF-16 text rather than v2.4, because Windows Explorer and older
car and phone players read v2.3 only, and the lyrics need the Unicode
encoding. Each run replaces the tags whole, so nothing stale from an earlier
encode survives. Audio frames are untouched — tagging is a metadata rewrite,
checked by comparing the decoded audio's MD5 before and after (FLAC's
STREAMINFO MD5 for the masters, `ffmpeg -f md5` for the MP3s).

## The script: `pnpm music:masters tag [<slug> ...]`

`scripts/masters.ts`, under `tsx` from the app directory like
`music:scaffold`, so it reads the catalogue through `src/`'s own model —
titles, artists, albums, people's spellings, lyrics, `songPicture`,
`songFileName` — rather than re-parsing frontmatter. Tags are written with
[`node-taglib-sharp`](https://www.npmjs.com/package/node-taglib-sharp), which
handles ID3v2 and Xiph comments with pictures in-process; the first song's
output is checked against `ffprobe` and `metaflac` before the batch runs.

Per repository, with no clone (the organization holds 39 GB of history):

1. Download each song's master and MP3 copy from `raw.githubusercontent.com`
   into `tmp/music-tag/`, one repository at a time, deleted after.
2. Tag them and verify the audio MD5 is unchanged.
3. Push through the Git Data API: one blob per file, one tree on the current
   head entering that blob under every name the song's pages derive, one
   commit (`chore: name and tag the masters for download`), fast-forward the
   branch. The README's mentions of the old names are rewritten in the same
   tree.
4. Rewrite the song document's `audio:`, `mp3.url` and `mp3.bytes` (tagging
   changes the size; `seconds` does not move).
5. Record the song in `apps/vova/public/music/tag-renders.json`: the hash of
   every input the tags were built from, and the names written.

**Re-runnable and resumable.** A song whose inputs hash to its manifest entry
is skipped, so a run interrupted by GitHub's content-creation rate limit
(about 500 writes an hour, and this is roughly 600) picks up where it stopped,
and the script paces its writes to stay under it.

**The manifest keeps the files current**, as `og-renders.json` keeps the
cards: `pnpm music:masters check`, wired into `vet.sh`, fails offline when a
song's title, album, credits, lyrics or cover changed since its files were
tagged, naming the songs to re-run; the build's own check above covers the
names.

## The two vendored songs

Every song plays from `vovas-music`, so the two MP3s under
`apps/vova/public/music/assets/` move there before the run, and this repo
loses both files:

- **`hello-human`** goes to `vovas-music/machines`, beside the track it runs
  into: it is the intro of `prototypes`, track 1 with `segue: true` into
  `trust-in-the-machine`, track 2, which `machines` already holds — and
  `machines`' `protintro.mp3` is the same file byte for byte (SHA-1
  `4c32eeb0…`). Its frontmatter gains `repo: 'machines'` and points
  `audio:` there; `machines`' README names it as the intro and says which
  track it runs into.
- **`ghostly-blues`** gets `vovas-music/ghostly-blues` (`gh repo create
--public`, its slug by `songs.md`'s rule), as each of
  `for-none-and-for-all`'s other songs has a repository of its own. It holds
  the MP3 and a README naming it; what it was made from is not in this repo,
  so the README says so rather than inventing a provenance. `repo:` and
  `audio:` follow.

Both are MP3 masters, so they join the run as the 13 others do.

## Two phases, so no link breaks

Raw URLs answer as soon as a commit lands, and the site keeps serving the old
names until this branch deploys. So:

1. **Add** — the run above commits the new paths beside the old ones.
   The live site keeps working; the branch points at the new names.
2. **Prune, after the merge deploys** — `pnpm music:masters prune` deletes, per
   repository, every master and copy path that no song on `main` derives any
   more, in one commit each. It runs in the session that merges, as its
   last step; until then a repository holds both, which costs only clutter.

## Accepted costs

- **History grows by every file re-uploaded**: tagging changes the bytes, so
  each repository gains a new blob of its master and copy — about 5 GB across
  the organization, and `nsfl` (934 MB today) passes GitHub's 1 GB
  recommendation at about 1.3 GB, still far under its 5 GB one. The extra
  names add nothing to it.
- **Every podcast enclosure URL changes once.** The feed item's guid is the
  song page, so a podcast app sees the same episode with a new file, not a new
  episode.
- **About 11 GB of transfer** and an hour or two of wall clock, mostly the
  rate limit.

## Conventions that change with it

- `scripts/song-intake/CLAUDE.md` § "A song's repository": the master and its
  copy are named and tagged by `pnpm music:masters tag` once the page exists; intake
  still produces `<stem>.flac` and `<stem>.master.mp3`, which
  `music:scaffold` reads, and the tag run renames them. A new song therefore
  ends with `pnpm music:masters tag <slug>`.
- `.claude/rules/songs.md`: a sentence that a song's file names are derived
  and its tags written from the frontmatter, and that the build and
  `--check` fail when either drifts. The rule is path-scoped, so it is edited
  in place rather than staged.
- `scripts/vet.sh`: the `--check` step. `node-taglib-sharp` is a
  devDependency, so the install hook covers it with no setup-script change.

## Checklist

- [x] Add `node-taglib-sharp`; spike it on `boom` in `tmp/`, read the result
      back with `ffprobe`/`metaflac`, confirm the audio MD5.
- [x] Write `songFileName` with its test — the spellings per locale and
      script, the artist credit, the character replacement, a locale that
      renames the song.
- [ ] Write `scripts/masters.ts` (tags, upload, frontmatter, manifest,
      `--check`, `--prune`) and its test for the tag set from a frontmatter
      fixture.
- [ ] `SongFileLink` and the feed links on derived names; the build's
      name-against-manifest check.
- [ ] Move the vendored songs: `hello-human` into `machines` with its README
      line, `vovas-music/ghostly-blues` created, both MP3s deleted here.
- [ ] Run it on `boom` and `snow-is-falling`, have the operator download
      each spelling from the branch's preview and look at the files in a
      player.
- [ ] Run the rest; commit the frontmatter and manifest in batches.
- [ ] Wire `--check` into `vet.sh`; update `song-intake/CLAUDE.md` and
      `songs.md`.
- [ ] After merge and deploy: `pnpm music:masters prune`.

## DRY notes

- **One function names every file**: `songFileName` sits in
  `shared/music-catalogue`, which both the page and the tag script import,
  so the name a link asks for and the name a commit wrote cannot disagree;
  the manifest and the build's check catch the one way they still can, a
  frontmatter edit between runs.
- **Reused:** the catalogue model in `src/shared/music-catalogue` and
  `src/pages/music/lib` for every tag value (titles, artist names, people's
  spellings, `songPicture`), so a tag can never disagree with the page; the
  `data-spelling` mechanism `Spelling` already uses, for the links;
  `scaffold-song.ts`'s `raw()` URL shape and `json()` fetch helper, moved to a
  small `scripts/lib/vovas-music.ts` both scripts import; `content-hash.ts`
  for the manifest's hashes.
- **Shared pattern, not shared code:** the manifest follows `og-renders.json`'s
  shape and `--check` semantics. The OG renderer's manifest code is bound to
  SVG→PNG inputs; extracting a generic "render manifest" for two callers
  whose inputs differ entirely would be an abstraction over a dictionary of
  hashes, so the tag manifest is its own ~30 lines.
- **Not extracted:** the beets character table lives beside `songFileName` —
  no second caller names files for a filesystem.

## Questions

Each has a recommendation, written into the plan above; silence keeps it.

- **1. Order** — (a) `Artist - Title` _(recommended, the industry default)_;
  (b) `Title - Artist`.
- **3. Lyrics in the files** — (a) embed the sung column _(recommended: Apple
  Music, foobar2000 and most phone players show them)_; (b) leave them out,
  so a lyrics edit never needs a re-tag.
- **6. Script of the embedded lyrics** — (a) as sung, Cyrillic or Arabic
  _(recommended: the words for someone singing along)_; (b) the Latin
  section where the song has one (`lyrics:ar-latn`), Russian romanized by
  rule otherwise.
- **7. Tags per spelling** — (a) one set, names in Latin, every name a path
  to the same bytes _(recommended: no storage beyond the re-upload, and
  Latin is the spelling every listener reads)_; (b) a file per spelling,
  each tagged in its own, which doubles the history growth to about 10 GB
  and the upload time with it.

Settled with the operator: the download name follows the page's locale and
script chip, rather than one Latin name for everyone; the vendored songs move
to `vovas-music`, `hello-human` into `machines` beside the track it runs
into; the old files are pruned after deploy rather than kept for links copied
before.

This fits one session; no split.
