# PR #140: feat(vova): open every song, and the music batch around it

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/140
- **Author:** @vzakharov (human)
- **Base ← Head:** main ← claude/music-open-all-songs-2g882w
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-11T12:23:07Z
- **Updated:** 2026-10-11T13:10:13Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 2

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `docs/music/hidden-songs.retired.md`:1 — unresolved — last: @vzakharov (human) 2026-10-11T13:03:29Z — "нет, не надо никаких надгробий -- суть-то остаётся -- остали…" → [↓](#t01)
- **T02** `src/pages/music/lib/sections.ts`:52 — unresolved — last: @vzakharov (human) 2026-10-11T13:04:26Z — "а это что такое, для чего понадобилось?" → [↓](#t02)

---

## Body

## Summary

- Opens every song: `hidden: true` and the `TBD` placeholders go, `description` becomes optional, and the page shows the story where there is one, the description only where there is none, and nothing where the song has neither.
- Smaller page asks: instrumentals show their story unclamped; «Наша история» and «Мир, какой он есть» lose their dictation-verbatim stories; following the playing song resumes whenever the reader lands on its page; «За горизонт» moves onto Сильней любви.
- Published from the branch (`deploy.yml`, `site: vova`) ahead of the merge, at the operator's ask.
- Still to come on this PR: concept albums' in-universe story vs. making-of, once the Divine Discontent dictation arrives.

## QA Checklist

- [ ] `songs-open` — `/music` lists songs that were hidden (e.g. Ghosts of Flesh tracks); none shows "TBD".
- [ ] `no-story` — a song with neither description nor story shows no empty block between the header and the lyrics.
- [ ] `story-wins` — «Наша история» shows its story, not its description; the page's meta description is still the description.
- [ ] `instrumental` — an instrumental with a story shows it whole, no «…».
- [ ] `follow` — play a song, navigate away, then open the playing song's page by any link: the next track change follows again.
- [ ] `horizon` — Сильней любви lists «За горизонт» as 6, «Птичка» 7, «Слизь» 8.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `songs-open` | yes | build | every route renders in `pnpm build` |
| `no-story` | yes | no | visual, `/preview` |
| `story-wins` | yes | no | visual |
| `instrumental` | yes | no | visual |
| `follow` | partly | no | client navigation |
| `horizon` | yes | build | duplicate track numbers fail the build |

https://claude.ai/code/session_01RKc3x3EbqQV5Y8X714jiay

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-11T12:23:20Z — "Proposed squash title/body: ``` feat(vova): open every song,…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-11T12:23:20Z

[https://github.com/vzakharov/vovazakharov.com/pull/140#issuecomment-6108979285](https://github.com/vzakharov/vovazakharov.com/pull/140#issuecomment-6108979285)

Proposed squash title/body:

```
feat(vova): open every song, and the music batch around it (pr #140)
```

```
Every song in the catalogue is public. A song used to stay hidden until
it had a description and a story in both languages; it now publishes as
it is, and the page shows the story where there is one, the description
only where there is none, and neither where the song has neither. The
description stays the meta description, optional in both locales
together, and the scaffolder no longer writes a placeholder for it.
`pnpm music:untold` lists what each song still lacks.

An instrumental shows its story whole, there being no words for it to
crowd. Following the playing song resumes whenever the reader lands on
its page, not only from the player bar's title. «За горизонт» joins
Сильней любви as its sixth track, and the stories of «Наша история» and
«Мир, какой он есть» are cut down from the dictation they were set from.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `docs/music/hidden-songs.retired.md`:1 — unresolved — last: @vzakharov (human) 2026-10-11T13:03:29Z — "нет, не надо никаких надгробий -- суть-то остаётся -- остали…" → [↓](#t01)
- **T02** `src/pages/music/lib/sections.ts`:52 — unresolved — last: @vzakharov (human) 2026-10-11T13:04:26Z — "а это что такое, для чего понадобилось?" → [↓](#t02)

<a id="t01"></a>

### `docs/music/hidden-songs.retired.md`:1 — unresolved

**@vzakharov (human)** — 2026-10-11T13:03:29Z

нет, не надо никаких надгробий -- суть-то остаётся -- остались песни, которые надо доделать

---

<a id="t02"></a>

### `src/pages/music/lib/sections.ts`:52 — unresolved

```diff
@@ -46,16 +46,22 @@ export function splitSections(body: string): ReadonlyMap<string, string> {
   return sections;
 }
 
+/** Whether text says anything to a reader once its HTML comments — notes for whoever edits the file — are gone. */
+function says(text: string): boolean {
+  return text.replaceAll(/<!--[\S\s]*?-->/g, '').trim() !== '';
+}
```

**@vzakharov (human)** — 2026-10-11T13:04:26Z

а это что такое, для чего понадобилось?

---

## Timeline (status, references, and other events)

- **2026-10-11T12:42:41Z** @vzakharov — _deployed_
- **2026-10-11T13:05:04Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/140#pullrequestreview-5483399208.
- **2026-10-11T13:09:06Z** @vzakharov — _deployed_
