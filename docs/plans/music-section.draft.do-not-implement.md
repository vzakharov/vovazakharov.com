> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) _before_ touching code.

# A music catalogue built from markdown, with a persistent player

`/music` today is three Spotify embeds and a paragraph. This turns it into a
catalogue: one markdown file per song under `apps/vova/public/music/`, compiled
to a page at build time by the pipeline that already serves case studies, and a
player that survives navigation between the index and any song page.

## Which songs, and why the FLAC decides it

**A root-level `.flac` is the definition of a finished song.** A repository that
has one has a master; one that has only a working mix (`*_in.mp3`, `*_mix.mp3`)
or a root `.wav` does not — a `.wav` at the root is usually a track downloaded
from Suno, not something mastered. So the catalogue is the FLAC-bearing repos,
and nothing else needs deciding about what counts as finished.

Of the 238 repositories in [vovas-music](https://github.com/vovas-music), 147
carry a root FLAC. The ten most recent of those, each with exactly one master,
are the first batch:

| Repo         | Master             | Size    | Length | Notes                       |
| ------------ | ------------------ | ------- | ------ | --------------------------- |
| `slime`      | `Слизь.flac`       | 25.7 MB | 3:51   |                             |
| `first`      | `Двадцать.flac`    | 21.3 MB | 3:38   | isolated vocal stem         |
| `birdie`     | `🅴 Птичка.flac`    | 23.4 MB | 3:27   | explicit; has a music video |
| `sashas`     | `Папа.flac`        | 17.6 MB | 2:53   |                             |
| `rak`        | `Не смотри.flac`   | 24.9 MB | 3:39   |                             |
| `utro`       | `Доброе утро.flac` | 25.4 MB | 3:48   |                             |
| `wereback`   | `wereback.flac`    | 22.4 MB | 3:11   | isolated stems              |
| `crossroads` | `crossroads.flac`  | 23.6 MB | 3:14   | isolated stems              |
| `june`       | `breathe.flac`     | 27.9 MB | 4:53   |                             |
| `letim`      | `letim.flac`       | 22.7 MB | 3:28   |                             |

Those lengths were read the way § 6 describes — ten 128 KB range requests,
about 1 MB in total against 250 MB of masters — so the mechanism the scaffolder
depends on is proven rather than assumed.

Two things the repositories cannot tell us, both of which the author fills in:

- **The date.** Seven of the ten share a first-commit date of 2026-03-24, which
  is when the whole organization was bulk-pushed, not when the songs were
  written. The scaffolder writes that date with a marker saying it is the sync
  date; every one of them needs correcting by hand.
- **The project.** Nothing in a repository says whether a song is GENERATED,
  Полуживые or Downtemple. The field is left empty rather than guessed.

Nothing else is missing: the master's filename is the song's name where it was
titled (`Слизь`, `Двадцать`, `Папа`), and the FLAC's own STREAMINFO header
carries the duration — readable in a 128 KB range request, without downloading
25 MB (§ 6).

## Where the audio comes from

`raw.githubusercontent.com` serves these files directly — the repos use no Git
LFS, and a spike against `Слизь.flac` returned `206 Partial Content` with
`accept-ranges: bytes`, so **seeking works**. That is the host: zero repo
weight, zero new tooling, and the master itself plays, which is the point.

Two caveats, neither fatal:

- The response carries `content-type: application/octet-stream`. Chrome and
  Firefox sniff the container and play it; **Safari is the one to verify** and
  cannot be tested from this machine. Step 8 verifies Chromium via `/preview`;
  Safari is the author's own check.
- `cache-control: max-age=300` and no CDN in front. Fine at this traffic; worth
  revisiting if the catalogue ever grows toward all 147 masters.

Both are defused by the same decision: **`audio:` in frontmatter is a plain
URL.** Re-hosting — committed transcodes, release assets, an object store — is
an edit to ten markdown files and no code at all. jsDelivr is ruled out: it
answers `403` for files this size.

## The design

### 1. `music` becomes a content collection

`apps/vova/public/music/<slug>.md`, one file per song, under the rule
`.claude/rules/content.md` already states: a document's file sits at its route
plus an extension. So `/music/slime` is the page and `/music/slime.md` is the
markdown served raw, with no route work beyond registering the collection.

- `COLLECTION_IDS` gains `'music'`; `COLLECTIONS.music = { base: 'music', label: 'Songs' }`.
- **`PAGE_ROUTES.music` is removed.** `collectionRoute('music')` and
  `PAGE_ROUTES.music` would otherwise be two spellings of `/music` free to
  drift. The collection entry is the definition; the three consumers
  (`app/lib/sitemap.ts`, `pages/home/ui/home-page.tsx`,
  `pages/music/lib/music-metadata.ts`) switch to `collectionRoute('music')`.
  All three are server-side, so pulling in the `shared/content` barrel — whose
  modules are `server-only` — is safe. `PAGE_ROUTES` keeps `writing`.
- No variants, no PDF, no OG card for this pass. `readDocument` currently builds
  a `pdf: pageFile(route, 'pdf')` for every document unconditionally; that
  becomes collection-dependent (§ 2), because a song has no printable.

### 2. Frontmatter becomes per-collection

Today one `frontmatterSchema` serves every collection. A song needs fields a
case study must not silently accept, so:

```ts
// frontmatter.ts
const baseFrontmatterSchema = z.object({
  description: z.string().min(1), // meta description and index-card blurb
  date: z.coerce.date(),
  ogImage: z.string().min(1).optional(),
});

export const caseStudyFrontmatterSchema = baseFrontmatterSchema.extend({
  part: z.string().min(1).optional(),
});

export const songFrontmatterSchema = baseFrontmatterSchema.extend({
  name: z.string().min(1), // the track name, as the player shows it
  status: z.enum(['done', 'wip']),
  language: z.enum(['ru', 'en', 'instrumental']),
  project: z.enum(PROJECTS).optional(), // GENERATED | Полуживые | Downtemple
  repo: z.string().min(1), // the vovas-music repo name → link
  audio: z.url(), // the master, played as-is
  seconds: z.number().int().positive(), // read off the FLAC header by § 6
  spotify: z.string().min(1).optional(), // track id, for an embed
});

export const FRONTMATTER_SCHEMAS = {
  'case-studies': caseStudyFrontmatterSchema,
  music: songFrontmatterSchema,
} as const satisfies Record<CollectionId, ZodType>;
```

`ContentDocument` becomes generic over `CollectionId`, so a song page reads
`document.frontmatter.audio` without a cast and a case-study page cannot.
`readDocument` picks the schema by collection id; its existing rethrow already
names the offending file.

Three of those fields need their reasoning recorded, because each departs from
how the case-study collection works:

- **`name` is a field, not the document's leading `# ` heading.** Case studies
  derive their title from the body, and `.claude/rules/content.md` states that
  as the collection rule. A song's name is not a heading — it is what the player
  bar shows as `Name — Project`, what the track list sorts and what an embed
  titles — so deriving it would mean parsing prose to render a control. A song
  body therefore **starts without a `# `**, and the page header renders `name`.
  That rule file gets the one line saying the collections differ here and why.
- **There is one audio field, not two.** Every song in the catalogue is a master
  by the definition above, so the lossless file _is_ the playback file and a
  second field would be the same URL twice.
- **`seconds` is a cache, and the scaffolder owns it.** The duration lives in
  the FLAC's own header, which nothing at build time can read — the file is
  remote and the build has no network. Caching it in frontmatter is what lets
  the track list render complete HTML with no client-side fetch, which is the
  requirement that the catalogue be built rather than assembled on the fly. It
  is safe to cache because a master never changes; re-running the scaffolder is
  what refreshes it.

`status` is all `done` in this batch, since having a master is what put a song
here. The field earns itself the moment an unfinished song joins, which is why
it exists now rather than later.

### 3. The player lives in `pages/music`, not in `features/`

Steiger's `insignificant-slice` rule rejects a slice with one upward consumer,
and the player has exactly one: the music pages. Both the index and the song
page are one slice — the same shape `pages/case-studies` already has for its
index and its article. So:

```
src/pages/music/
  ui/music-page.tsx          # the index, extended with the catalogue
  ui/music-section.tsx       # existing prose + Spotify embeds, unchanged
  ui/song-page.tsx           # one song: header, play control, prose body
  ui/song-list.tsx           # the catalogue on the index
  ui/music-layout.tsx        # 'use client' boundary: mounts provider + bar
  ui/player-provider.tsx     # 'use client': context, the single <audio>, queue
  ui/player-bar.tsx          # 'use client': the sticky control strip
  ui/track-button.tsx        # 'use client': per-row play/pause
  lib/player-state.ts        # queue, shuffle order, the reducer — plain, testable
  lib/songs.ts               # build-time: documents → the queue the client gets
  lib/projects.ts            # PROJECTS and their Spotify artist ids
```

**Audio survives navigation because the `<audio>` element sits in a layout.**
`apps/vova/app/music/layout.tsx` re-exports `MusicLayout`; Next preserves a
layout's React state across a client-side navigation into and out of
`/music/<slug>`, so pressing play on the index and opening a song does not
restart the track. Mount it any lower and every navigation kills the sound.

The queue is resolved **at build time** — `lib/songs.ts` runs server-side, reads
the collection, and passes a plain array of `{ slug, name, project, audio,
seconds, route }` into the provider as props. The client never reads markdown,
never fetches an index, and ships no part of the content pipeline.

**Controls**: play/pause, previous, next, shuffle, a seek bar with elapsed and
total time, and the current track shown as `Name — Project`, linking to its
page. Keyboard: space toggles, `←`/`→` seek 5 s, `shift`+`←`/`→` change track —
bound on the provider, skipped while focus is in a text field. Previous behaves
the way a music player should: restart the current track if past ~3 s, otherwise
go back one.

Shuffle is a **seeded permutation computed once per toggle**, not a random pick
per `next`, so back-and-forth through a shuffled queue is stable. That logic is
`lib/player-state.ts` — a pure reducer, which is also what makes it the first
thing in this repo worth a `node --test` file beyond the type-overlap script.

### 4. The index page

`MusicSection` keeps its prose and its three Spotify embeds untouched, and gains
the catalogue below them: the songs newest first, each row a name, its project,
its duration and a play button. The existing dead link to
`vzakharov.github.io/vovas-music` (that repository returns 404) is repointed at
the `vovas-music` organization.

### 5. The song page

Header: the name, date, project and language; links to the source repository and
to the `.md` itself, the way case studies offer theirs. Body: the author's prose
and the lyrics, rendered by `renderDocument` — the same pipeline, so code
fences, images and video embeds all work without a line of new rendering code.
`birdie`'s music video is a link in its body, which
`rehypeMediaEmbeds` already turns into a player; that is why no `video` field
exists.

### 6. Scaffolding the ten files

`scripts/scaffold-song.ts`, run by hand as `pnpm music:scaffold <repo>` — the
same shape as `content:og` and `content:pdf`, which are also hand-run and
committed. Against a `vovas-music` repository it writes
`apps/vova/public/music/<slug>.md` with:

- `name` from the master's filename, stripped of the `🅴` marker (which becomes
  an `explicit` note in the draft body rather than part of the name);
- `audio`, percent-encoded — several masters have Cyrillic names, one has an
  emoji;
- `seconds`, parsed from the FLAC's STREAMINFO block via a **range request for
  the first 128 KB**, so a ten-song scaffold moves about 1 MB rather than 250;
- `repo`, and `date` as the first-commit date with a `# sync date, fix me`
  comment beside it;
- `status: done`, `project` left empty.

It **never overwrites** an existing file, so a re-run after the author's edits
is safe and reports what it skipped.

### 7. Lyrics are transcribed, then corrected

The masters transcribe well. A spike against two of them, through Deepgram's
`nova-3` with `language=ru` — the same API `scripts/transcribe.py` already
wraps — returned coherent Russian at 0.99 and 0.98 confidence, on a spoken-word
track and a sung one respectively. Errors are a handful of mondegreens per song
("Шоу вопреки" for "Шёл вопреки"), not noise.

So the lyrics are drafted by machine and **corrected by the author**, which is
the split `@.claude/skills/dictation/SKILL.md` already draws: the recognizer's
output is a proposal, and deciding which words are actually sung is a human's
call. They live in the markdown body under a `## Текст` heading — no field, no
schema, and they render for free.

Where a repository carries an **isolated vocal stem** (`first`, `wereback`,
`crossroads`), the stem is what gets transcribed: it fixed one of the two errors
above that the full mix got wrong. Everywhere else the master is the input.

`scripts/transcribe.py` is reused rather than reimplemented; the scaffolder
calls it and drops the result into the draft body under a heading marking it
unverified.

### 8. Verification

`./scripts/vet.sh` covers the build. What it cannot cover is whether audio
actually plays, so `/preview` boots the dev server and drives headless Chromium
through: play from the index, seek, next, shuffle, navigate to a song page and
confirm playback continues. Safari stays the author's own check.

## Steps

1. Register the collection; remove `PAGE_ROUTES.music` and repoint its three consumers.
2. Split the frontmatter schema per collection; make `ContentDocument` generic; make `pdf` collection-dependent. Add the `name` line to `.claude/rules/content.md`.
3. Write `lib/player-state.ts` and its `node --test` file.
4. Build the player: provider, bar, track button, layout.
5. Build the song page and the `[...slug]` route; extend the index with the catalogue.
6. Write `scripts/scaffold-song.ts`; generate the ten stubs.
7. Transcribe the ten masters; draft each body — what the repository shows, plus the lyrics, marked as unverified for the author to correct.
8. `/preview` in both themes; `./scripts/vet.sh`.

Steps 1–2 land together (the generic touches both). Steps 6–7 are independent of
3–5 and can land first, so the author can start correcting prose while the
player is still being built.

## DRY notes

**Reused, not rebuilt:**

- **The whole markdown→HTML pipeline** — `renderDocument`, the remark/rehype
  plugin stack, `prose.scss`, `documents.ts`'s reading and sorting. A song page
  is a content page; the only new things about it are its frontmatter and a play
  button. Nothing in `shared/content` is copied.
- **`documentRoute`/`collectionRoute`** stay the single URL shaper. The song
  route is not hand-spelled anywhere.
- **`scripts/transcribe.py`** — the lyrics step calls it rather than posting to
  Deepgram itself. It already handles the key, the upload, the response file and
  the timecoded output, and `/dictation` is its second caller.
- **`Card`, `Section`, `Subheading`, `PageShell`, `BackToHome`** from
  `shared/ui` — the catalogue is a list of cards, and the repo already has the
  card.
- **The base frontmatter fields** (`description`, `date`, `ogImage`) get a
  shared base schema rather than being restated in the song schema, which is the
  same rule `shared/typings` enforces for type members — and `pnpm type-overlap`
  would fail the run if the two derived types each declared them.

**Deliberately duplicated:**

- **Nothing.** The one thing that looks like duplication — a song page header
  beside `pages/case-studies/ui/article-header.tsx` — is not extracted, and that
  is the call worth arguing: the two headers share a shape (name, date, meta
  row) but not a content (a case study shows reading time, a word count, a ToC
  and a PDF link; a song shows a project, a language and a play control).
  Extracting a common header would mean a component with four optional slots and
  two callers, which is harder to read than either concrete header. FSD forbids
  the sideways import between the two page slices anyway, so the extraction
  would have to land in `shared/ui` — promoting a two-caller shape to a
  repo-wide primitive. Revisit if a third collection appears.

**Newly shared:**

- `PROJECTS` — the three project names are currently string literals inside
  `music-section.tsx`'s JSX, and the song schema needs the same list to validate
  `project`. They become a `const` array in `pages/music/lib/projects.ts`, with
  the schema deriving from it (`z.enum(PROJECTS)`), per CLAUDE.md's enum rule.
  The Spotify artist ids ride along in the same table, so the embeds keep
  working off it.

## What the operator must do outside the repo

Nothing. The host needs no credential and no tooling, and `DEEPGRAM_API_KEY` is
already in the environment.

## Options that were considered and dropped

Rejected at review: including the two albums in the batch (`ctfu`, `dng_album`)
and the five repos whose only render is a working mix — superseded by the
FLAC-means-finished rule, which selects the batch without a judgement call.
A separate `lossless` field beside `audio` — the same URL twice, since every
song here is a master. Committed Opus transcodes instead of hotlinking, which
would need `ffmpeg` added to the environment setup script and is not worth it
while the `audio` field makes re-hosting a markdown edit. jsDelivr as the CDN:
it answers `403` at this file size.
