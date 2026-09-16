> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) _before_ touching code.

# A music catalogue built from markdown, with a persistent player

`/music` today is three Spotify embeds and a paragraph. This turns it into a
catalogue: one markdown file per song under `apps/vova/public/music/`, compiled
to a page at build time by the pipeline that already serves case studies, and a
player that survives navigation between the index and any song page.

The ten songs in scope are the ten most recent **non-empty** repositories in
[github.com/vovas-music](https://github.com/vovas-music) — see § "Which ten".

## What the source repositories actually hold

Each repo is a Reaper project: `<name>.RPP`, raw stems under `Media/`, and the
rendered output at the root. Nothing carries a description, a topic or a README,
so **every word of metadata has to be authored** — which is what the markdown is
for.

The root render comes in two tiers, and the difference is load-bearing:

| Repo          | Final master (root `.flac`) | Working mix             | Reading            |
| ------------- | --------------------------- | ----------------------- | ------------------ |
| `slime`       | `Слизь.flac` — 25.7 MB      | `slime_mix.mp3` 8.7 MB  | finished           |
| `first`       | `Двадцать.flac` — 21.3 MB   | `first_mix.mp3` 8.3 MB  | finished           |
| `birdie`      | `🅴 Птичка.flac` — 23.4 MB   | `birdie_mix.mp3` 7.6 MB | finished, explicit |
| `butyrka`     | —                           | `butyrka_in.mp3` 4.3 MB | unfinished         |
| `za_gorizont` | —                           | `za_gorizont_in.mp3`    | unfinished         |
| `john24`      | —                           | `john24.mp3` 3.8 MB     | unfinished         |
| `haunted`     | —                           | `haunted-p3.mp3` 4.5 MB | unfinished         |
| `revenge`     | —                           | `revenge.mp3` 1.2 MB    | unfinished         |

A repo with a **titled** root render (`Слизь`, `Двадцать`, `Птичка`) has a
finished master; one whose root render is named after the repo with an `_in` or
`_mix` suffix has only a working mix. That maps onto the `status: done | wip`
field directly, so the scaffolder can guess it and the author corrects it.

Two further findings shape the plan:

- **The FLAC filename is the song's real title**, in Russian, and `birdie`'s
  carries a `🅴` explicit marker. Titles are therefore not derivable from the
  repo name, and a URL built from one needs percent-encoding.
- **`ctfu` and `dng_album` are albums, not songs** — seven to ten tracks each,
  and `ctfu`'s master is split across three `.part_*` files that need
  `unsplit.sh` before anything can play it. They are excluded from the first
  ten (§ "Which ten", question 1).

## Where the audio comes from

`raw.githubusercontent.com` serves these files directly — the repos use no Git
LFS, and a spike against `Слизь.flac` returned `206 Partial Content` with
`accept-ranges: bytes`, so **seeking works**. That is the v1 host: zero repo
weight, zero new tooling, and the lossless file the author asked to play.

Two caveats, neither fatal:

- The response carries `content-type: application/octet-stream`. Chrome and
  Firefox sniff the container and play it; **Safari is the one to verify** and
  cannot be tested from this machine. Step 7 verifies Chromium via `/preview`;
  Safari is the author's own check, and the fallback if it fails is the same
  `audio:` field pointed at the `.mp3` beside the FLAC.
- `cache-control: max-age=300` and no CDN in front. Fine at this traffic; not
  fine if the catalogue ever grows to all 100 repositories in the org.

**Both caveats are defused by the same design decision: `audio:` in frontmatter
is a plain URL.** Re-hosting — committed transcodes under `public/music/audio/`,
GitHub release assets, an object store — is an edit to ten markdown files and no
code at all. jsDelivr is ruled out: it answers `403` for files this size.

**A committed-transcode pipeline is deliberately _not_ built here.** It is the
natural upgrade (an Opus encode is ~3 MB against 25 MB, and `content:og` already
sets the hash-manifest pattern to copy), but it needs `ffmpeg`, which this
environment does not have — see § "What the operator must do outside the repo".

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
- No variants, no PDF, no OG card for v1. `readDocument` currently builds a
  `pdf: pageFile(route, 'pdf')` for every document unconditionally; that becomes
  collection-dependent (§ 2), because a song has no printable.

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
  status: z.enum(['done', 'wip']),
  language: z.enum(['ru', 'en', 'instrumental']),
  project: z.enum(PROJECTS).optional(), // GENERATED | Полуживые | Downtemple
  repo: z.string().min(1), // the vovas-music repo name → link
  audio: z.url().optional(), // absent = nothing to play
  lossless: z.url().optional(), // the FLAC where playback uses the mix
  spotify: z.string().min(1).optional(), // track id, for an embed
});

export const FRONTMATTER_SCHEMAS = {
  'case-studies': caseStudyFrontmatterSchema,
  music: songFrontmatterSchema,
} as const satisfies Record<CollectionId, ZodType>;
```

`ContentDocument` becomes generic over `CollectionId` so a song page reads
`document.frontmatter.audio` without a cast and a case-study page cannot.
`readDocument` picks the schema by collection id; its existing rethrow already
names the offending file.

**There is no `title` field**, per the collection rule the repo already holds:
the title is the document's leading `# ` heading. Duration is not a field
either — the player reads it off the audio element, and a value in frontmatter
would be a second copy free to drift.

### 3. The player lives in `pages/music`, not in `features/`

Steiger's `insignificant-slice` rule rejects a slice with one upward consumer,
and the player has exactly one: the music pages. Both the index and the song
page are one slice — the same shape `pages/case-studies` already has for its
index and its article. So:

```
src/pages/music/
  ui/music-page.tsx          # the index, extended with the catalogue
  ui/music-section.tsx       # existing prose + Spotify embeds, unchanged
  ui/song-page.tsx           # one song: header, player button, prose body
  ui/song-list.tsx           # the catalogue on the index
  ui/music-layout.tsx        # 'use client' boundary: mounts the provider + bar
  ui/player-provider.tsx     # 'use client': context, the single <audio>, queue
  ui/player-bar.tsx          # 'use client': the sticky control strip
  ui/track-button.tsx        # 'use client': per-row play/pause
  lib/player-state.ts        # queue, shuffle order, the reducer — plain, testable
  lib/songs.ts               # build-time: documents → the queue the client gets
```

**Audio survives navigation because the `<audio>` element sits in a layout.**
`apps/vova/app/music/layout.tsx` re-exports `MusicLayout`; Next preserves a
layout's React state across a client-side navigation into and out of
`/music/<slug>`, so pressing play on the index and opening a song does not
restart the track. Mount it any lower and every navigation kills the sound.

The queue is resolved **at build time** — `lib/songs.ts` runs server-side,
reads the collection, and passes a plain array of `{ slug, title, artistLine,
audio, route }` into the provider as props. The client never reads markdown,
never fetches an index, and ships no part of the content pipeline.

**Controls**: play/pause, previous, next, shuffle, a seek bar with elapsed and
total time, and the current track's title linking to its page. Keyboard: space
toggles, `←`/`→` seek 5 s, `shift`+`←`/`→` change track — bound on the provider,
skipped while focus is in a text field. Previous behaves the way a music player
should: restart the current track if past ~3 s, otherwise go back one.

Shuffle is a **seeded permutation computed once per toggle**, not a random pick
per `next`, so back-and-forth through a shuffled queue is stable. That logic is
`lib/player-state.ts` — a pure reducer, which is also what makes it the first
thing in this repo worth a `node --test` file beyond the type-overlap script.

### 4. The index page

`MusicSection` keeps its prose and its three Spotify embeds untouched, and gains
a catalogue below them: the songs newest first, each row a title, a one-line
blurb, its project, a `wip` marker where it applies, and a play button. The
existing dead link to `vzakharov.github.io/vovas-music` (that repository returns 404) is repointed at the `vovas-music` organization.

### 5. The song page

Header: title, date, project, status, language; links to the repo, to the
lossless file where playback uses something else, and to the `.md` itself the
way case studies offer theirs. Body: the author's prose, rendered by
`renderDocument` — the same pipeline, so code fences, images and video embeds
all work without a line of new rendering code.

### 6. Scaffolding the ten files

`scripts/scaffold-song.ts`, run by hand as `pnpm music:scaffold <repo>` — the
same shape as `content:og` and `content:pdf`, which are also hand-run and
committed. It reads a `vovas-music` repository through the GitHub API and
writes `apps/vova/public/music/<slug>.md` with everything derivable filled in:
the title from the root render's filename, the date from the repo's first
commit, `repo`, `audio` (percent-encoded), `lossless`, and a `status` guessed
by the master-vs-mix rule above. It **never overwrites** an existing file, and
the body is a `TODO` line for the author — the prose is his, and a machine
inventing how a song was born is the one thing this section must not do.

### 7. Verification

`./scripts/vet.sh` covers the build. What it cannot cover is whether audio
actually plays, so `/preview` boots the dev server and drives headless Chromium
through: play from the index, seek, next, shuffle, navigate to a song page and
confirm playback continues. Safari stays the author's own check (§ "Where the
audio comes from").

## Steps

1. Register the collection; remove `PAGE_ROUTES.music` and repoint its three consumers.
2. Split the frontmatter schema per collection; make `ContentDocument` generic; make `pdf` collection-dependent.
3. Write `lib/player-state.ts` and its `node --test` file.
4. Build the player: provider, bar, track button, layout.
5. Build the song page and the `[...slug]` route; extend the index with the catalogue.
6. Write `scripts/scaffold-song.ts`; generate the ten stubs; commit them with `TODO` bodies.
7. `/preview` the result in both themes; `./scripts/vet.sh`.

Steps 1–2 land together (the generic touches both). Steps 3–5 are the bulk.
Step 6 is independent of 3–5 and can land first if the author wants to start
writing prose while the player is still being built.

## DRY notes

**Reused, not rebuilt:**

- **The whole markdown→HTML pipeline** — `renderDocument`, the remark/rehype
  plugin stack, `prose.scss`, `documents.ts`'s reading and sorting. A song page
  is a content page; the only new thing about it is its frontmatter and a play
  button. Nothing in `shared/content` is copied.
- **`documentRoute`/`collectionRoute`** stay the single URL shaper. The song
  route is not hand-spelled anywhere.
- **`Card`, `SummaryCard`, `Section`, `Subheading`, `PageShell`, `BackToHome`**
  from `shared/ui` — the catalogue is a list of cards, and the repo already has
  the card.
- **The base frontmatter fields** (`description`, `date`, `ogImage`) get a
  shared base schema rather than being restated in the song schema, which is the
  same rule `shared/typings` enforces for type members — and `pnpm type-overlap`
  would fail the run if the two derived types each declared them.

**Deliberately duplicated:**

- **Nothing.** The one thing that looks like duplication — a song page header
  beside `pages/case-studies/ui/article-header.tsx` — is not extracted, and that
  is the call worth arguing: the two headers share a shape (title, date, meta
  row) but not a content (a case study shows reading time, a word count, a ToC
  and a PDF link; a song shows a project, a status, a language and a player).
  Extracting a common header would mean a component with four optional slots and
  two callers, which is harder to read than either concrete header. FSD forbids
  the sideways import between the two page slices anyway, so the extraction
  would have to land in `shared/ui` — promoting a two-caller shape to a
  repo-wide primitive. Revisit if a third collection appears.

**Newly shared:**

- `PROJECTS` — the three project names are currently string literals inside
  `music-section.tsx`'s JSX, and the song schema needs the same list to validate
  `project`. They become a `const` array in `pages/music/lib/`, with the schema
  deriving from it (`z.enum(PROJECTS)`), per CLAUDE.md's enum rule. The Spotify
  artist ids ride along in the same table, so the embeds keep working off it.

## What the operator must do outside the repo

Nothing for v1 — the hotlinked host needs no credential and no tooling.

**If the answer to question 3 is "commit transcodes" instead:** `ffmpeg` is not
present in this environment and no file in the repo can install it. It has to go
into the environment setup script, which has no API and no in-repo file behind
it, or the encode step cannot run in a web session at all.

## Open questions

Each carries a recommendation, and **the plan above is written with every
recommendation already in force** — so silence is a valid answer and
implementation is not blocked on any of these.

**1. Which ten.** "The last 10 repos" by creation date includes three empty
repositories (`g35`, `local_elo`, `epico`), one that is a video rather than a
song (`photo-video`), and one with stems but no render (`meatjoe`).

- **(a) — recommended.** The eight singles in the table above, plus `ctfu` and
  `dng_album` **deferred**: albums need a track list and a different page shape,
  and `ctfu`'s master is split across three files that no browser can play. Ten
  repositories are in scope; eight of them ship.
- (b) All ten including the albums, each as one page with a track list. Adds
  roughly a third to the work and makes the player's queue two-level.
- (c) A different ten you name.

**2. The frontmatter fields.** § 2 proposes `description`, `date`, `status`,
`language`, `project`, `repo`, `audio`, `lossless`, `spotify`, `ogImage` — with
the title as the leading `# ` heading and no `duration`. Anything to add
(`lyrics` as a field, a `cover`, credits, a `suno`/`soundcloud` link) or drop?

**3. What plays.** Recommended: **the FLAC where one exists, the mix MP3
otherwise** — which is what you asked for. Worth knowing what it costs: a
listener on mobile pulls 25 MB for `Слизь` where a 8.7 MB MP3 of the same track
sits beside it. Alternatives: (b) MP3 everywhere with the FLAC as a download
link, (c) committed Opus transcodes (needs `ffmpeg` in the environment, see
above). The field is a URL either way, so this is a ten-file edit to change
later, not a rewrite.

**4. Lyrics.** Songs in two languages with no lyrics anywhere on the page seems
like a gap, but you did not ask for them. Recommended: **no lyrics field** — if
you want them, write them into the markdown body under a `## Текст` heading,
where they cost nothing and render for free. Say so if you would rather they
were structured.

**5. The stub bodies.** The scaffolder writes `TODO` and stops, because the
"как родилась" is yours. The alternative is that I draft a body per song from
what the repository shows (the stem names, the dates, the project file) and you
rewrite it. Recommended: **`TODO`** — a machine guessing at how your song was
born is worse than a blank.
