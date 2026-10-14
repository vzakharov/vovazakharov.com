# PR #150: refactor(vova): albums and artists live in their own frontmatter

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/150
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/music-catalogue-frontmatter-q4h7ze
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-13T19:53:33Z
- **Updated:** 2026-10-14T05:26:59Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 2

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `apps/vova/public/music/artists/damy-i-gospoda.md`:3 — unresolved — last: @vzakharov (human) 2026-10-14T05:22:06Z — "зачем нужен order? порядок должен быть обратный по количеств…" → [↓](#t01)
- **T02** `docs/remove-before-merging/squash-message.md`:16 — unresolved — last: @vzakharov (human) 2026-10-14T05:24:29Z — "not contesting, but а зачем нам вообще в кодбазе знать что-т…" → [↓](#t02)

---

## Body

## Summary

- Moves what `MUSIC_ALBUMS` (with #147's `wip`), `PROJECT_DISPLAY_NAMES`, `MUSIC_PROJECT_SLUGS` and `PROJECT_GLOSSES` held into the frontmatter of each album's and artist's own `.md` under `apps/vova/public/music/`, read through `albumFrontmatterSchema`/`artistFrontmatterSchema` by the new `catalogue-files.ts`; an album's cover is found by its file on disk rather than a `cover: true` flag.
- Keeps the build failing on a misspelt `album:`/`project:`: `pnpm music:codegen` (`scripts/generate-music-names.ts`) generates `src/shared/music-catalogue/names.ts` — the `MusicAlbum`/`MusicProject` unions and `MUSIC_PROJECT_SLUGS` — from those files, and vet runs it beside `styles:codegen`, failing when it had to write.
- Every album and artist page now links its `.md`, since every one has a file.
- Asked in review of #148 (https://github.com/vzakharov/vovazakharov.com/pull/148#discussion_r4263026823).

Plan: `docs/plans/music-catalogue-frontmatter.completed.md`.

## QA Checklist

- [ ] `index` — the music index lists the same artists in the same order, with the same album tiles and covers.
- [ ] `vagabond` — `/music/albums/vagabond` reads _Vagabond_ by GENERATED in English and «Скиталец: по следам Конюхова» by Полуживые in Russian.
- [ ] `yoohie` — `/music/artists/yoohie/ru` shows Йухи; `/music/artists/poluzhivye` glosses _The Half-Alive_.
- [ ] `md-link` — every album and artist page shows a `.md` link that opens its file.
- [ ] `typo` — a song with `album: vagabnd` fails `pnpm build:vova`.
- [ ] `codegen` — renaming an artist file and running `pnpm music:codegen` rewrites `names.ts` and exits non-zero; a second run exits 0.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `index` | yes (screenshot diff) | no | `/preview` |
| `vagabond` | yes | no | `/preview`, both locales |
| `yoohie` | yes | no | `/preview` |
| `md-link` | yes | no | built HTML |
| `typo` | yes | by the build | the union is the check |
| `codegen` | yes | by vet | vet fails on a stale `names.ts` |

https://claude.ai/code/session_017QrtMp84xuEyzNEnCDoeH2

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-13T19:53:49Z — "Proposed squash title/body: ``` refactor(vova): albums and a…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-13T19:53:49Z

[https://github.com/vzakharov/vovazakharov.com/pull/150#issuecomment-6153931145](https://github.com/vzakharov/vovazakharov.com/pull/150#issuecomment-6153931145)

Proposed squash title/body:

```
refactor(vova): albums and artists live in their own frontmatter (pr #150)
```

```
An album's or an artist's names, billing and glosses sat in TypeScript
registries beside the markdown file that already carried its prose and
hook, so one release was described in two places. Each album and artist
now has one file under apps/vova/public/music/, its frontmatter holding
what the registries held; a locale's title or name reuses a song's
field, a string renaming it there and { translation } glossing it.

A misspelt album or project in a song still fails the build:
`pnpm music:codegen` generates the MusicAlbum and MusicProject enums
from those files, committed and checked by vet as styles:codegen is, so
the types stay literal for every call site and script. An artist's slug
is its file name and its place on the music index an `order` field; an
album's cover is read off the covers directory rather than stated.
Every album and artist page links its .md, since every one has a file.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `apps/vova/public/music/artists/damy-i-gospoda.md`:3 — unresolved — last: @vzakharov (human) 2026-10-14T05:22:06Z — "зачем нужен order? порядок должен быть обратный по количеств…" → [↓](#t01)
- **T02** `docs/remove-before-merging/squash-message.md`:16 — unresolved — last: @vzakharov (human) 2026-10-14T05:24:29Z — "not contesting, but а зачем нам вообще в кодбазе знать что-т…" → [↓](#t02)

<a id="t01"></a>

### `apps/vova/public/music/artists/damy-i-gospoda.md`:3 — unresolved

```diff
@@ -0,0 +1,6 @@
+---
+name: 'Дамы и господа'
+order: 8
```

**@vzakharov (human)** — 2026-10-14T05:22:06Z

зачем нужен order? порядок должен быть обратный по количеству песен, при равных -- обратный хронологический по последнему релизу

---

<a id="t02"></a>

### `docs/remove-before-merging/squash-message.md`:16 — unresolved

```diff
@@ -0,0 +1,28 @@
… 12 lines elided …
+field, a string renaming it there and { translation } glossing it.
+
+A misspelt album or project in a song still fails the build:
+`pnpm music:codegen` generates the MusicAlbum and MusicProject enums
```

**@vzakharov (human)** — 2026-10-14T05:24:29Z

not contesting, but а зачем нам вообще в кодбазе знать что-то про конкретные названия? (это вопрос, не запрос)

---

## Timeline (status, references, and other events)

- **2026-10-13T20:16:25Z** @vzakharov — _base_ref_changed_
- **2026-10-14T05:26:59Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/150#pullrequestreview-5513410897.
