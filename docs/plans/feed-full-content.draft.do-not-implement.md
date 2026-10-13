> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) *before* touching code.

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

## DRY notes

- **Shared:** `feedHtml` is the one hast→HTML path for both kinds of item; the song prose goes through `renderProse`, the same compile the page runs, so a story renders identically on the page and in the feed apart from the feed-only pass.
- **Reused:** `localizeSong`/`universeOf` for the song's prose per locale, the `makingOf` message the page already titles the story with, `songPath` for the link, `visitElements` (`hast-elements.ts`) for the URL pass, `getAbsoluteUrl` for the origin; `escapeXml` stays for every non-CDATA field.
- **Not extracted:** the order "world, then making-of under its label" is restated in `songFeedEntries` rather than pulled out of `story.tsx`, which lays it out as Mantine components; the shared part is the two inputs, and two lines of ordering are cheaper than an abstraction both callers would bend around.

## Open questions

The recommendation is in force in the plan above.

1. Which feeds get the body:
   - **a (recommended)** — every feed: songs, the Bible, basilisk cases.
   - **b** — songs only.
