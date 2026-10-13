> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) *before* touching code.

# Full content in the RSS feeds

## Why

A feed item carries only its blurb. `feedEntries` (`src/shared/content/feeds.ts`) puts the song's hook — or an article's `description` — into `<description>`, and nothing else, so a reader opening a song in NetNewsWire sees one line and no story or words. That was a deliberate call ("the body is rendered for the page, and reads wrong anywhere else"); this plan reverses it.

The XML error in the browser (`Failed to parse QName 'xmlns:'`) is out of scope: the served file is well-formed (xmllint, Python, libxml2 in push mode split at byte 64 all accept it), and a reload of the same URL renders it.

## What an item carries

- `<description>` stays the blurb — the line a reader's list shows under the title.
- A new `<content:encoded>` (namespace `http://purl.org/rss/1.0/modules/content/`) carries the body as HTML in a CDATA section, the convention every mainstream reader renders in its reading pane.
  - **A song** (`/music/songs/<locale>/feed.xml`): its cover, then what the page shows below its header, in the page's order — the world (`universe:<locale>`), the making-of (`lang:<locale>`, under the `makingOf` label when a world precedes it), then the words: the sung column, and the crib in the feed's language under it where the two differ (a feed reader has no columns). Each column's notes follow it as a short list, the noted phrase marked with a numbered `<sup>`. A transliteration is left out, being a reading aid behind a switch. Credits are left out, the page link being one click away.
  - **An article** (the Bible, basilisk cases, and any article collection that gains a feed): the rendered body.
- Every `href`, `src`, `srcset` and `poster` in the HTML is absolute — a reader resolves nothing against the site.
- Elements the page draws twice for a reason that does not hold in a reader are dropped: a pull quote (`aria-hidden`, the sentence already in the body), the seal end mark.

## Steps

1. **`src/shared/lib/rss.ts`** — `RssItem` gains optional `content` (an HTML string). `renderRss` declares `xmlns:content` on `<rss>` and writes `<content:encoded><![CDATA[…]]></content:encoded>` when present, splitting any `]]>` in the HTML across two CDATA sections. Tests in `rss.test.ts`: the element is written, the namespace is declared, a `]]>` survives.
2. **`src/shared/content/feed-html.ts`** (new, `server-only`) — `feedHtml(tree, origin)`: clones a hast root, absolutizes URL attributes, drops `aria-hidden` blocks, serializes with `hast-util-to-html` (a new direct dependency; already in the tree under shiki at 9.0.5). Unit-tested on a hand-built tree.
3. **Articles** — `feedEntries`'s article branch passes `rendered.tree` through `feedHtml` into `content`.
4. **Songs** — the music branch moves out of `shared/content/feeds.ts` into `pages/music` as `songFeedEntries(locale)`, exported through the slice's barrel, because the story cut (`sections.ts`), the words (`songLyrics`) and the world (`universeOf`) all live there and `shared/content` may not import upward. It renders the world and story with `renderProse` (the page's own pipeline) and builds the words' hast from `SongLyrics` with the stanza/line/note shape `lyrics.tsx` reads, then hands the assembled root to `feedHtml`. `shared/content/feeds.ts` keeps the article branch; `src/app/lib/feed.ts` (the app layer, which may import pages) picks the music entries from `pages/music` for the `music` collection.
5. **The doc comment** on `feedEntries` is rewritten to the new contract: the blurb in `description`, the body in `content:encoded`, absolute URLs.
6. **Check** — `pnpm build:vova`, then validate `out/music/songs/en/feed.xml` with xmllint and look at one song item and one Bible item in the built XML; `./scripts/vet.sh` at `/finalize`.

## DRY notes

- **Shared:** `feedHtml` is the one hast→HTML path for both kinds of item; the song prose goes through `renderProse`, the same compile the page runs, so a story renders identically on the page and in the feed apart from the feed-only pass.
- **Reused:** `splitSections`/`localeProse`/`universeOf`/`songLyrics`/`readVerse` for the song's parts, `visitElements` (`hast-elements.ts`) for the URL pass, `getAbsoluteUrl` for the origin, `escapeXml` stays for every non-CDATA field.
- **Duplicated on purpose:** the words' markup. `lyrics.tsx` renders Mantine components with popover notes and a transliteration switch, none of which a reader can run; rendering it with `react-dom/server` would ship class names with no stylesheet and a popover as dead markup. The feed builds plain `<p>` stanzas with `<br>`s from the same `SongLyrics` data, so what is shared is the data, which is the part that can drift.

## Open questions

Recommendations are in force in the plan above.

1. What a song's item carries:
   - **a (recommended)** — cover, world, story, words, crib, notes, as above.
   - **b** — the story only; the words stay a page visit.
2. Which feeds get the body:
   - **a (recommended)** — every feed: songs, the Bible, basilisk cases.
   - **b** — songs only.
