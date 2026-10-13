# Full content in the RSS feeds

## Why

A feed item carries only its blurb. `feedEntries` (`src/shared/content/feeds.ts`) puts the song's hook — or an article's `description` — into `<description>`, and nothing else, so a reader opening a song in NetNewsWire sees one line and no story. That was a deliberate call ("the body is rendered for the page, and reads wrong anywhere else"); this plan reverses it.

The XML error in the browser (`Failed to parse QName 'xmlns:'`) is out of scope: the served file is well-formed (xmllint, Python, libxml2 in push mode split at byte 64 all accept it), and a reload of the same URL renders it.

## What an item carries

- `<description>` stays the blurb — the line a reader's list shows under the title.
- A new `<content:encoded>` (namespace `http://purl.org/rss/1.0/modules/content/`) carries the body as HTML in a CDATA section, the convention every mainstream reader renders in its reading pane.
  - **A song** (`/music/songs/<locale>/feed.xml`): the prose the page's `Story` shows, in the feed's language — the world (`universe:<locale>`) where the song has one, then the making-of (`lang:<locale>`, under the `makingOf` label when a world precedes it) — closed by a link to the song's page for the words and notes. The words stay on the page: their columns, crib and popover notes are the page's to lay out. A song with no story in that language carries the link alone.
  - **An article** (the Bible, basilisk cases, and any article collection that gains a feed): the rendered body.
- Every `href`, `src`, `srcset` and `poster` in the HTML is absolute — a reader resolves nothing against the site.
- Elements the page draws twice for a reason that does not hold in a reader are dropped: a pull quote (`aria-hidden`, the sentence already in the body), the seal end mark.

Languages need nothing new: each locale has its own song feed, and the story is cut per locale by `localeProse`/`universeOf`, the same functions the page uses.

## Steps

1. **`src/shared/lib/rss.ts`** — `RssItem` gains optional `content` (an HTML string). `renderRss` declares `xmlns:content` on `<rss>` and writes `<content:encoded><![CDATA[…]]></content:encoded>` when present, splitting any `]]>` in the HTML across two CDATA sections. Tests in `rss.test.ts`: the element is written, the namespace is declared, a `]]>` survives.
2. **`src/shared/content/feed-html.ts`** (new, `server-only`) — `feedHtml(tree)`: clones a hast root, absolutizes URL attributes with `getAbsoluteUrl`, drops `aria-hidden` blocks, serializes with `hast-util-to-html` (a new direct dependency; already in the tree under shiki at 9.0.5). Unit-tested on a hand-built tree.
3. **Articles** — `feedEntries`'s article branch passes `rendered.tree` through `feedHtml` into `content`.
4. **Songs** — the music branch moves out of `shared/content/feeds.ts` into `pages/music` as `songFeedEntries(locale)`, exported through the slice's barrel, because the story cut (`sections.ts`, `localizeSong`) and the world (`universeOf`) live there and `shared/content` may not import upward. It renders the world and the making-of with `renderProse` (the page's own pipeline), appends a paragraph linking the song's page, and hands the assembled root to `feedHtml`. `shared/content/feeds.ts` keeps the article branch; `src/app/lib/feed.ts` (the app layer, which may import pages) takes the music entries from `pages/music` for the `music` collection.
5. **Messages** — one new string per locale in `src/shared/i18n/messages/{en,ru}.json` under `music`: the link's label ("Lyrics and notes on the song’s page" / «Слова и сноски — на странице песни»).
6. **The doc comment** on `feedEntries` is rewritten to the new contract: the blurb in `description`, the body in `content:encoded`, absolute URLs.
7. **Check** — `pnpm build:vova` and `pnpm build:bible`, then validate the built feeds with xmllint and look at one song item per locale and one Bible item in the built XML; `./scripts/vet.sh` at `/finalize`.

## The songs feeds as podcasts

Each song feed (`en` and `ru`) is also a valid Apple podcast: every item carries the song itself as an `<enclosure>`, and the channel carries the `itunes:` tags Apple's directory requires.

**An MP3 per song, in its repository.** Podcast apps take MP3/AAC, and 157 of 170 masters are FLAC. Each FLAC song's repository gains `<master stem>.mp3` beside the master — a distribution copy, `ffmpeg -c:a libmp3lame -b:a 320k`, no processing, ID3 title/artist set — and a README line naming it and the command. The site keeps playing the master; only the feed points at the copy. Songs whose `audio` is already an MP3 (the 11 in repositories and the 2 under `/music/assets/`) need no copy. Repositories sharing several songs (`machines`) get one copy per song.

- **Subagents make the copies and push them**, a batch of repositories apiece, each repository cloned, encoded, pushed and deleted before the next so the disk holds one at a time. Each returns per song: the MP3's raw URL and its byte size.

**The frontmatter records the copy.** A song gains `podcast: { url, bytes }` — `url` omitted where `audio` is already the MP3, the enclosure then reusing it — read by the song schema in `shared/music-catalogue`. `bytes` is recorded rather than fetched at build, so a deploy never depends on 170 HEAD requests to GitHub. `pnpm music:scaffold` writes it for a new song from the same stream it already reads the duration from, and the song vet fails a listed song without it.

**What the feed adds** (`src/shared/lib/rss.ts` grows optional podcast fields; `pages/music` fills them):

- On `<rss>`: `xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"`.
- Channel: `itunes:author` and `itunes:owner` (the site author's name and `vzakharov@gmail.com` from `SITE_CONFIG.author`), `itunes:image` (below), `itunes:category text="Music"`, `itunes:explicit` (`true` when any listed song is explicit), `itunes:type` `episodic`.
- Item: `<enclosure url length type="audio/mpeg"/>`, `itunes:duration` (the frontmatter's `seconds`), `itunes:explicit` from the song, `itunes:image` (the song's cover via `songPicture`, absolute), `itunes:episodeType` `full`.

**A square cover.** Apple wants 1400–3000 px square; the music card is 2400×1260. `content:og:vova`'s collage (`scripts/lib/music-collage.ts`) also renders a 3000×3000 cut of the same covers to `apps/vova/public/music.podcast.jpg`, hashed like the card so a new cover re-flags it.

**Verification:** both built feeds pass xmllint; one song's `<enclosure>` URL answers 200 with a `content-length` equal to its `length`; the feed passes a public podcast validator (Podbase or Cast Feed Validator) once deployed — a post-merge check, listed in the PR's QA.

## Order of work

1. The text part (Steps 1–7 above).
2. The MP3 copies across the song repositories (subagents), then the `podcast` frontmatter for every song, the schema and the scaffolder.
3. The feed's podcast tags, the square cover, and the checks.

The work is one PR, as the operator asked. Each part leaves the branch building, so a session that runs out of context pauses at a part's end and the next one resumes.

## Progress

**Done — part 1, the text** (commits 530712b, c58144a): `content:encoded` in `rss.ts`, `feedHtml` in `src/shared/lib/feed-html.ts` (a pure `shared/lib` file taking the URL resolver as a parameter, because the test runner has no `react-server` condition and a `server-only` module cannot load there), article bodies in `shared/content/feeds.ts` (now article collections only), the songs feed in `pages/music/lib/song-feed.ts`, routed from `src/app/lib/feed.ts`, and the `music.feedPageLink` message. The vova build passes and both songs feeds are well-formed; the Bible and basilisk feeds are first built at `/finalize`'s vet.

**Blocked — part 2, the MP3 copies.** The session's git proxy refuses pushes to `vovas-music/*` (403, "not in this session's authorized repository set"); `check_repo_access` says each is attachable, but `add_repo` with `access: "push"` is denied by the auto-mode classifier unless the operator names it. Nothing was pushed. To unblock, the operator sends, in the session doing the work:

> Разрешаю add_repo с access push для 108 репозиториев vovas-music из tmp/mp3/repos.txt (или из списка, который собирается из audio-URL FLAC-песен), чтобы запушить в них MP3-копии мастеров.

Then the session calls `add_repo` (owner `vovas-music`, `access: "push"`) for each repository itself, and only then hands the encoding and pushing to subagents.

Facts the next run needs (`tmp/` dies with the machine, so they are here):

- **The repository and branch come from `audio`'s URL, never from `repo:`**, which is an id: `entropy-end`, `solitude`, `one-day`, `ultimate-abstraction` live in `Divine-Discontent--album-` (branch `master`); `otvet`, `ne-toropi` in `rus-`; `in-the-flesh` in `ghosts-of-flesh`; `lake`, `fireflies` in `stories`; `meow` and `like-that` are on `master`. 108 repositories in all; group the jobs by the URL's repository so no two agents push to one.
- `git clone --filter=blob:none` still fetches every blob on checkout: clone with `--no-checkout` and sparse-check-out only the README. Set `core.quotePath=false`, or `git ls-tree` octal-escapes Cyrillic names and an existing-MP3 check misses them.
- `bezm` already holds `В безмерности небес.mp3` (10135509 bytes) beside its FLAC — `boundless-skies` needs no copy, only its `podcast` frontmatter. Expect more such; skip rather than overwrite.
- The repositories checked so far have no `README.md` file list to extend.

**Left:** part 2 as planned once unblocked, then part 3.

## DRY notes

- **Shared:** `feedHtml` is the one hast→HTML path for both kinds of item; the song prose goes through `renderProse`, the same compile the page runs, so a story renders identically on the page and in the feed apart from the feed-only pass.
- **Reused:** `localizeSong`/`universeOf` for the song's prose per locale, the `makingOf` message the page already titles the story with, `songPath` for the link, `visitElements` (`hast-elements.ts`) for the URL pass, `getAbsoluteUrl` for the origin; `escapeXml` stays for every non-CDATA field. The podcast half reuses `seconds` for the duration, `songPicture` for the episode image, `SITE_CONFIG.author` for the owner, and `music-collage.ts` with its hash manifest for the square cover — a second cut of the same collage, not a second collage script.
- **Not extracted:** the order "world, then making-of under its label" is restated in `songFeedEntries` rather than pulled out of `story.tsx`, which lays it out as Mantine components; the shared part is the two inputs, and two lines of ordering are cheaper than an abstraction both callers would bend around.

## Open questions

The recommendation is in force in the plan above.

1. Which feeds get the body:
   - **a (recommended)** — every feed: songs, the Bible, basilisk cases.
   - **b** — songs only.
