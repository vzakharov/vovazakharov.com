> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) *before* touching code.

# Song masters: listener-facing file names and full tags

## Goal

Every master the site plays or offers for download from a `vovas-music`
repository — the FLAC in `audio:` and the MP3 in `mp3.url` (or the MP3 in
`audio:` where the master is one) — is named `<Artist> - <Title>.<ext>` and
carries the song's tags, so a saved file says what it is and a player shows it
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
folder of downloads by artist. Title-first is rare and mostly an artefact of
specific apps.

**In Latin letters**, as the English page spells the song: a Russian speaker
reads Latin, a listener who does not read Cyrillic cannot read
`Снег идёт`, and `mithqal`'s title would otherwise land in Arabic script.
`Poluzhivye - Sneg idyot.flac`, `GENERATED - Boom!.flac`.

- **Title**: `spelledText(songTitle(frontmatter, 'en'))` — the English
  locale's name for the song, romanized by the site's own rule, or by
  `titleLatin` where one is hand-written.
- **Artist**: each `project` name through `localName(…, 'en')`, the spelling
  the artist pages use; a song with features names them as
  `Poluzhivye feat. GENERATED`, the form taggers and MusicBrainz use.
- **Characters**: beets' default replacements, so a name is legal on every
  filesystem — `\ / < > : " ? * |` become `_`, control characters are dropped,
  a leading `.` and a trailing `.` become `_`, trailing spaces are trimmed.
  `за/обложкой` therefore saves as `za_oblozhkoy - <Title>.flac`.
- Two songs landing on one name in one repository fail the run, naming both.

## The tags

Written from the catalogue, so the frontmatter stays the one source. **The
names in them — title, artist, album — are spelled as in the file name**, in
Latin: a tag is a surface with one spelling and no switch, which the site
already spells in Latin wherever it has to pick one (`spelledText`'s default,
used for the page title, the feed and the lock screen). The lyrics stay in the
script they are sung in, the words someone reading along sings
(question 6).

| Field                        | ID3v2.3 (MP3)                 | Vorbis comment (FLAC)    | Source                                       |
| ---------------------------- | ----------------------------- | ------------------------ | -------------------------------------------- |
| Title                        | `TIT2`                        | `TITLE`                  | the title, as in the file name               |
| Artist                       | `TPE1`                        | `ARTIST`                 | `project`, as in the file name               |
| Album artist                 | `TPE2`                        | `ALBUMARTIST`            | the album's `artist`, through `localName`    |
| Album                        | `TALB`                        | `ALBUM`                  | the album's `title`, through `localName`     |
| Track                        | `TRCK` `n/total`              | `TRACKNUMBER`/`TRACKTOTAL` | `track`, total = the album's song count    |
| Year                         | `TYER`                        | `DATE`                   | `date`                                       |
| Language                     | `TLAN`                        | `LANGUAGE`               | `language`                                   |
| Lyricist / composer          | `TEXT` / `TCOM`               | `LYRICIST` / `COMPOSER`  | `credits`, else the author                   |
| Lyrics                       | `USLT`                        | `LYRICS`                 | the sung column, notes stripped              |
| Cover                        | `APIC` (front cover)          | `METADATA_BLOCK_PICTURE` | `songPicture()` — what the page shows        |
| Song page                    | `WOAF`                        | `CONTACT`                | the song's canonical URL                     |

ID3v2.3 with UTF-16 text rather than v2.4, because Windows Explorer and older
car and phone players read v2.3 only, and Cyrillic needs the Unicode
encoding. Each run replaces the tags whole, so nothing stale from an earlier
encode survives. Audio frames are untouched — tagging is a metadata rewrite,
checked by comparing the decoded audio's MD5 before and after (FLAC's
STREAMINFO MD5 for the masters, `ffmpeg -f md5` for the MP3s).

## The script: `pnpm music:tag [<slug> ...]`

`scripts/tag-songs.ts`, under `tsx` from the app directory like
`music:scaffold`, so it reads the catalogue through `src/`'s own model —
titles, artists, albums, people's spellings, lyrics, `songPicture` — rather
than re-parsing frontmatter. Tags are written with
[`node-taglib-sharp`](https://www.npmjs.com/package/node-taglib-sharp), which
handles ID3v2 and Xiph comments with pictures in-process; the first song's
output is checked against `ffprobe` and `metaflac` before the batch runs.

Per repository, with no clone (the organization holds 39 GB of history):

1. Download each song's master and MP3 copy from `raw.githubusercontent.com`
   into `tmp/music-tag/`, one repository at a time, deleted after.
2. Tag them, rename them, verify the audio MD5 is unchanged.
3. Push through the Git Data API: one blob per file, one tree on the current
   head adding the new names, one commit
   (`chore: name and tag the masters for download`), fast-forward `main`.
   The README's mentions of the old names are rewritten in the same tree.
4. Rewrite the song document's `audio:`, `mp3.url` and `mp3.bytes` (tagging
   changes the size; `seconds` does not move).
5. Record the song in `apps/vova/public/music/tag-renders.json`: the hash of
   every input the tags were built from, beside the names written.

**Re-runnable and resumable.** A song whose inputs hash to its manifest entry
is skipped, so a run interrupted by GitHub's content-creation rate limit
(about 500 writes an hour, and this is roughly 600) picks up where it stopped,
and the script paces its writes to stay under it.

**The manifest keeps the tags current**, as `og-renders.json` keeps the cards:
`pnpm music:tag --check`, wired into `vet.sh`, fails offline when a song's
title, album, credits, lyrics or cover changed since its files were tagged,
naming the songs to re-run. Without it a renamed album would ship with the
old name inside every file and nothing would say so.

## The two vendored songs

Every song plays from `vovas-music`, so the two MP3s under
`apps/vova/public/music/assets/` move there before the run, and this repo
loses both files:

- **`hello-human`** is already there: `vovas-music/machines`'
  `protintro.mp3` is the same file byte for byte (SHA-1 `4c32eeb0…`). Its
  frontmatter gains `repo: 'machines'` and points `audio:` there.
- **`ghostly-blues`** gets `vovas-music/ghostly-blues` (`gh repo create
  --public`, its slug by `songs.md`'s rule), holding the MP3 and a README
  naming it; what it was made from is not in this repo, so the README says
  so rather than inventing a provenance. `repo:` and `audio:` follow.

Both are MP3 masters, so they join the run as the 13 others do.

## Two phases, so no link breaks

Raw URLs answer as soon as a commit lands, and the site keeps serving the old
names until this branch deploys. So:

1. **Add** — the run above commits the new files beside the old ones.
   The live site keeps working; the branch points at the new names.
2. **Prune, after the merge deploys** — `pnpm music:tag --prune` deletes, per
   repository, the old master and copy that no song document on `main` names
   any more, in one commit each. It runs in the session that merges, as its
   last step; until then a repository holds both, which costs only clutter.

## Accepted costs

- **History grows by every file re-uploaded**: tagging changes the bytes, so
  each repository gains a new blob of its master and copy — about 5 GB across
  the organization, and `nsfl` (934 MB today) passes GitHub's 1 GB
  recommendation at about 1.3 GB, still far under its 5 GB one.
- **Every podcast enclosure URL changes once.** The feed item's guid is the
  song page, so a podcast app sees the same episode with a new file, not a new
  episode.
- **About 11 GB of transfer** and an hour or two of wall clock, mostly the
  rate limit.

## Conventions that change with it

- `scripts/song-intake/CLAUDE.md` § "A song's repository": the master and its
  copy are named and tagged by `pnpm music:tag` once the page exists; intake
  still produces `<stem>.flac` and `<stem>.master.mp3`, which
  `music:scaffold` reads, and the tag run renames them. A new song therefore
  ends with `pnpm music:tag <slug>`.
- `.claude/rules/songs.md`: a sentence that tag inputs are frontmatter and
  `--check` fails when they drift. The rule is path-scoped, so it is edited in
  place rather than staged.
- `scripts/vet.sh`: the `--check` step. `node-taglib-sharp` is a
  devDependency, so the install hook covers it with no setup-script change.

## Checklist

- [ ] Add `node-taglib-sharp`; spike it on `boom` in `tmp/`, read the result
      back with `ffprobe`/`metaflac`, confirm the audio MD5.
- [ ] Write `scripts/tag-songs.ts` (name, tags, upload, frontmatter, manifest,
      `--check`, `--prune`) and its test for the pure parts — the file name
      and character replacement, the artist credit, the tag set from a
      frontmatter fixture.
- [ ] Move the vendored songs: create `vovas-music/ghostly-blues`, point
      `hello-human` at `machines`' `protintro.mp3`, delete both MP3s here.
- [ ] Run it on `boom`, have the operator download both files from the
      branch's preview and look at them in a player.
- [ ] Run the rest; commit the frontmatter and manifest in batches.
- [ ] Wire `--check` into `vet.sh`; update `song-intake/CLAUDE.md` and
      `songs.md`.
- [ ] After merge and deploy: `pnpm music:tag --prune`.

## DRY notes

- **Reused:** the catalogue model in `src/shared/music-catalogue` and
  `src/pages/music/lib` for every tag value (titles, artist names, people's
  spellings, `songPicture`), so a tag can never disagree with the page;
  `scaffold-song.ts`'s `raw()` URL shape and `json()` fetch helper, moved to a
  small `scripts/lib/vovas-music.ts` both scripts import; `content-hash.ts`
  for the manifest's hashes.
- **Shared pattern, not shared code:** the manifest follows `og-renders.json`'s
  shape and `--check` semantics. The OG renderer's manifest code is bound to
  SVG→PNG inputs; extracting a generic "render manifest" for two callers
  whose inputs differ entirely would be an abstraction over a dictionary of
  hashes, so the tag manifest is its own ~30 lines.
- **Not extracted:** the beets character table lives in the tag script — no
  second caller names files for a filesystem.

## Questions

Each has a recommendation, written into the plan above; silence keeps it.

- **1. Order** — (a) `Artist - Title` *(recommended, the industry default)*;
   (b) `Title - Artist`.
- **3. Lyrics in the files** — (a) embed the sung column *(recommended: Apple
   Music, foobar2000 and most phone players show them)*; (b) leave them out,
   so a lyrics edit never needs a re-tag.
- **6. Script of the embedded lyrics** — (a) as sung, Cyrillic or Arabic
   *(recommended: the words for someone singing along)*; (b) the Latin
   section where the song has one (`lyrics:ar-latn`), Russian romanized by
   rule otherwise, to match the names.

Settled with the operator: names in Latin, both in the file name and the
tags, over the song's own script, which a listener who does not read it
cannot read; the vendored songs move to `vovas-music` rather than keeping
their `download` attribute; the old files are pruned after deploy rather than
kept for links copied before.

This fits one session; no split.
