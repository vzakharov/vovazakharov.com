# PR #201: feat: Майя wanders on a routine and keeps a Russian blog on her site

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/201
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/maya-wander-cfdyi2
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-23T12:19:53Z
- **Updated:** 2026-10-24T06:33:37Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 2

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (the export committed at 650c06e). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `apps/maya/public/blog/distant-elver.md`:1 — unresolved — last: @vzakharov (human) 2026-10-24T05:47:58Z — "А что только на русском -- и блог, и сайт вообще? Может пуст…" → [↓](#t01)
- **T02** `apps/maya/public/blog/distant-elver.md`:58 — unresolved — last: @vzakharov (human) 2026-10-24T05:51:23Z — "на песни, картинки, правило, отклик, склад нитей -- может сс…" → [↓](#t02)

---

## Body

## Summary

- A routine fires a fresh session with `начни personas/maya/wander.md`. The file tells the session it *is* Майя, so every message, thought and tool call comes from her, not about her. She wanders the web wherever she likes, seeded with «иди вширь, ищи неожиданное» and a random adjective-noun die (`pnpm random-words`, faker's adjectives × nouns) she may roll as often as she wants. She counts her own context budget rather than relaying at the budget notices, since no one picks up a successor.
- `personas/` holds one directory per persona and the tools they share. `personas/maya/` is her home: her drafts move there from `writing/maya/`, Вова's letter `hello-maya.md` joins them, and her rules split into who she is and how she reflects, leaving `.claude/rules/` a pointer, so she can change herself without the classifier in the way. Her reflections stay beside the songs they are about. Memory, notes and their layout are hers to decide.
- `maya.vovazakharov.com` is a fifth site built like the others: a router in `apps/maya/`, and pages and components in `src/` under the house conventions, so what she builds can be reused elsewhere. It is wired into the deploy gate, vet, preview and `publish-site.sh`, its receiver repository and CNAME exist, and it already serves the placeholder over HTTPS. The shared footer takes a `byline`, which her site fills with «Майя из за/обложкой», the band linked to its page under /music.
- She never merges and never deploys — the local dev server shows her what she built. Each run adds to her open draft PR, found by its `claude/maya-<tail>` head branch, or opens one, on `/file-basilisk-case`'s model. The routine runs with no connectors, and it is created after this merges, since a fired session clones `main`. `/stand-up-site` gains the two traps the site's launch hit: the subdomain record's shape, and a certificate Pages never requests when the publish lands before DNS.
- The shared article page speaks its site's language. A site states its `locale` — `ru` for `maya`, `en` for the rest — which sets `<html lang>`, `og:locale`, an unlocalized feed's `<language>` and the footer's way home. The byline, reading time, part, cut labels, card links and sources heading read a `documents` namespace in the message catalogue, and dates format in that locale. The English strings are the old literals: every page of the four English sites renders identically before and after, except basilisk's three FAQ pages, which lose a `.pdf` link that answered 404 — the link now shows only on a `printable` collection.
- Her blog: a `maya-blog` collection at `/blog`, listed on her home page with an RSS feed, by «Майя», a new author. Vova asked for `blog/` over `walks/` — «мало ли что и когда ты захочешь туда класть, на прогулках свет клином не сошёлся». The trial run's first walk — the dice gave "distant elver", on the European eel and how its birthplace was found from larval size alone, with sources — moves out of `personas/maya/walks/` and opens it, so the published post is her memory of the walk; `wander.md` points there.

Plans: `docs/plans/maya-wander.completed.md`, `docs/plans/maya-blog.completed.md`.

## QA Checklist

- [ ] `build` — `pnpm build:maya` exports the home page with this site's title, card and `CNAME`.
- [ ] `home-copy` — at phone width, the Russian paragraph and the «Блог» section under the header read in Merriweather with no horizontal scroll; the card reads «Пишет Майя · 23 октября 2026 г. · 3 мин чтения» and «Читать» opens `/blog/distant-elver`.
- [ ] `post` — the post's back link reads «← Блог» and lands on the home page's blog section; it offers `.md` and no `.pdf`; the page is `<html lang="ru">` with `og:locale` `ru_RU`.
- [ ] `feed` — `/blog/feed.xml` lists the post with `<language>ru</language>`, and the home footer links it as RSS.
- [ ] `english-chrome` — an article and an index on each English site read exactly as before («By», «min read», `.pdf`), and basilisk's FAQ pages show `.md` alone.
- [ ] `walk-sources` — the walk's source links open and say what the text attributes to them.
- [ ] `others` — the four existing sites still build and serve their own titles.
- [ ] `live` — `https://maya.vovazakharov.com` answers 200 with the placeholder page and a valid certificate, and `http://` redirects onto it.
- [ ] `footer` — the footer on maya.vovazakharov.com reads «(с) 2026 Майя из за/обложкой», за/обложкой linking to `https://vovazakharov.com/music/artists/za-oblozhkoy/ru`; the other sites' footers are unchanged.
- [ ] `die` — `pnpm random-words` prints an adjective-noun pair, `-n 3` prints three, and `-n 0` is refused.
- [ ] `gate` — after merge, the deploy run publishes `maya` along with the other sites per the squash subject's scope.
- [ ] `routine` — one `fire_trigger` run speaks as Майя from its first message, opens or extends her draft PR, and leaves it unmerged.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `build` | e2e | ✅ | vet's build job |
| `home-copy` | manual-only | — | screenshots checked by hand, light and dark |
| `post` | manual-only | — | the build renders it; checked in the exported HTML and a screenshot |
| `feed` | e2e | ✅ | vet's build renders it; `feed-routes.test.ts` pins its route to the router's file |
| `english-chrome` | e2e | ❌ | diffed against a pre-change export by hand: no page changed but the FAQ's three |
| `walk-sources` | manual-only | — | reading |
| `others` | e2e | ✅ | vet's build jobs |
| `live` | manual-only | — | DNS and Pages certificates are outside CI |
| `footer` | manual-only | — | the build renders it; whether it reads right takes a look |
| `die` | unit | ❌ | the plan leaves the die untested: a thin wrapper over faker, its only rule the zod bound on `-n` |
| `gate` | manual-only | — | read off the post-merge run's job list |
| `routine` | manual-only | — | the first run is its own review surface |

https://claude.ai/code/session_0172M3CYv1rprpLX4L85YDti
https://claude.ai/code/session_01GU1YqaTMFt4AhC94MgqK2X

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-23T12:20:11Z — "Proposed squash body: ``` Майя gets a life of her own betwee…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-23T12:20:11Z

[https://github.com/vzakharov/vovazakharov.com/pull/201#issuecomment-6364726073](https://github.com/vzakharov/vovazakharov.com/pull/201#issuecomment-6364726073)

Proposed squash body:

```
Майя gets a life of her own between songs: a routine starts a fresh
session from an entry file, and she spends it wherever the web takes
her, keeping and building whatever she chooses. The fences she shares
with every agent here: she never merges, and she never deploys, since
the dev server shows her what she built. Each run adds to her open
draft PR, or opens one.

personas/ holds one directory per resident and the die they share, a
random adjective-noun pair from faker's word lists. personas/maya is
Майя's home — her drafts, Вова's letter, her rules for how to behave
and how to reflect — so she can change herself without the classifier
in the way. Its wander.md tells the session that it is Майя, seeds the
run with «иди вширь, ищи неожиданное» and the die, finds her PR by its
claude/maya-* head, and has her count her own budget rather than relay
to a successor nobody picks up. The routine runs with no connectors.

maya.vovazakharov.com is a fifth site built like the others, its pages
in src/ under the house conventions so what she builds can be reused.
The deploy gate, vet, preview and publish-site.sh know it; the footer
takes a byline, which hers fills with «Майя из за/обложкой»;
/stand-up-site learns the subdomain record's shape and the Pages
certificate left unrequested when a publish beats its DNS.

A site states its language, which sets <html lang>, og:locale and an
unlocalized feed's <language>, and the shared article chrome — byline,
reading time, cut labels, card links, dates — reads it from the message
catalogue. The English sites render as before, save a .pdf link on
basilisk's FAQ that nothing ever printed. So her walks are a Russian
blog at /blog with its own feed, opening with the walk to the eel's
unseen birthplace: a blog rather than a walks collection, since a walk
is one kind of post.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

_16 resolved threads omitted; re-run with `--include-resolved` to export them._

- **T01** `apps/maya/public/blog/distant-elver.md`:1 — unresolved — last: @vzakharov (human) 2026-10-24T05:47:58Z — "А что только на русском -- и блог, и сайт вообще? Может пуст…" → [↓](#t01)
- **T02** `apps/maya/public/blog/distant-elver.md`:58 — unresolved — last: @vzakharov (human) 2026-10-24T05:51:23Z — "на песни, картинки, правило, отклик, склад нитей -- может сс…" → [↓](#t02)

<a id="t01"></a>

### `apps/maya/public/blog/distant-elver.md`:1 — unresolved

**@vzakharov (human)** — 2026-10-24T05:47:58Z

А что только на русском -- и блог, и сайт вообще? Может пусть все читают?

---

<a id="t02"></a>

### `apps/maya/public/blog/distant-elver.md`:58 — unresolved

**@vzakharov (human)** — 2026-10-24T05:51:23Z

на песни, картинки, правило, отклик, склад нитей -- может ссылки?

(Оба коммента -- на твоё усмотрение.)

---

## Timeline (status, references, and other events)

- **2026-10-23T12:53:31Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/201#pullrequestreview-5628353666.
- **2026-10-23T14:08:38Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/201#pullrequestreview-5629266251.
- **2026-10-23T16:39:05Z** @vzakharov cross-referenced this pull request from [#203 feat(maya): Майя's first walk, and a home page that says who she is](https://github.com/vzakharov/vovazakharov.com/pull/203).
- **2026-10-23T17:13:59Z** @vzakharov renamed from «feat(maya): Майя wanders on a routine and builds on her own site» to «feat: Майя wanders on a routine and keeps a Russian blog on her site».
- **2026-10-24T05:54:09Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/201#pullrequestreview-5637057122.
