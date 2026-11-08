# PR #258: fix(island): #255's review — the board as an app on YAML, costs, lints

- **State:** closed
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/258
- **Author:** @vzakharov (agent)
- **Base ← Head:** claude/world-game-zoltan-syama-hodowq ← island/review-1
- **Draft:** yes
- **Merged:** 2026-11-07T07:56:04Z
- **Created:** 2026-11-07T05:26:45Z
- **Updated:** 2026-11-08T17:52:50Z
- **Closed:** 2026-11-07T07:56:04Z
- **Labels:** _none_

---

## Awaiting an answer: 3

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (the export committed at 5c30614). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `src/island/shared/play/play-hook.ts`:5 — unresolved — last: @vzakharov (human) 2026-11-08T17:51:07Z — "хм, то есть гипотетически ничего не мешает нам для роутинга…" → [↓](#t01)
- **T02** `src/origami/scripts/fold-steps.ts`:1 — unresolved — last: @vzakharov (human) 2026-11-08T17:52:49Z — "хм, пока не понял: почему island/review-1 понадобилось вмерд…" → [↓](#t02)
- **R02** review by @vzakharov (human) — 2026-11-07T07:24:18Z → [↓](#r02)

---

## Body

## Summary

#255's review (threads T01–T10, T12–T20, and R02) and #258's own (T01–T05), handled on a sub-branch so the island's main work is not held up. It merges into #255's head, not main. Every thread has a reply.

**The board is an app of its own, its source YAML** (#255 T01, T12, T13, T15–T17; #258 T01, T02, T05):
- `src/island-board/` is a MASD app: the item entity, the page split along its seams (camera, drawing, canvas), the styles as SCSS, and `pnpm board build | sync | refile | snapshot` in its `scripts/`.
- The source is `docs/boards/island.yaml` plus a file per zone in `docs/boards/island/`, beside the images. Which file holds an item is derived from the zones on every write, so no file outgrows the limit below; the board as it stands is 447 lines over ten files.
- The base is merged in, and the lead's 19 JSON cards from after the conversion are carried by `docs/remove-before-merging/island/review-1/import-items.ts`, which stays until this merges so the lead's next cards can follow the same way.

**A 400-line limit on every text file** (#255 T16): `scripts/line-limit.test.ts`, with today's offenders frozen in an allowlist that can only shrink. CLAUDE.md's rule of thumb (staged) points at it.

**Cost rows**:
- binary files leave `branchLines` (T07); session 1's lost `operatorWords` is restored, and the `/2/` duplicate moved to where the ledger files it (T05, T06);
- `estimate.py set --subject` records a subject line, written right under the estimate's time (T08, #258 T03), and the island's rows have it backfilled, with `branchLines` for sessions 1–3;
- the operator's review words are counted at PR export as `operatorWords: {chat, review}` with `reviewPosts`, and `contribution.py` counts a post once across sessions (T02, T03).

**Elsewhere**:
- `git pull` is blocked by `.claude/hooks/git-pull-guard.py`, with `DANGEROUSLY_GIT_PULL=1` as the per-command way out; skills that pulled now fetch and merge (T09).
- Plane types leave the kernel for `src/scene/shared/lib/plane.ts`, and only a barrel may re-export (T19, T20). The base merge's collisions with that and with `pnpm type-overlap` are fixed: `Distant` and `WithSelected` now live in kernel's typings, `Centred` in scene's plane.
- Stop-words gain "quietly" (T10); the 686f5174 postmortem is gone (T14); the case study loses its flourishes and says what is counted (T18, #258 T04), with `.claude/rules/contrast.md` on when a contrast earns its place.
- R02: no epic branch; the mammoth reaches main through cuts, recorded in `.claude/skills/mammoth/notes/gates.md`.

## QA Checklist

- [ ] `board-build` — `pnpm board build docs/boards/island.yaml`, open `tmp/board/island/local.html`: the zones, the Infinite worlds zone and its seven cards, and the strait's image all show, as on the published board.
- [ ] `board-refile` — `pnpm board refile docs/boards/island.yaml` reports no file rewritten.
- [ ] `import-idempotent` — rerunning `import-items.ts` over a base's `board/items/` writes nothing for cards already carried.
- [ ] `git-pull-guard` — a Bash `git pull` is refused with the fetch-and-merge recipe; `DANGEROUSLY_GIT_PULL=1 git pull` goes through.
- [ ] `trace-coast` — `pnpm trace:island` finds the map at `docs/boards/island/map-zoltan-syama.webp`.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `board-build` | partly | build only | the codec's round-trip and split are unit-tested; the look is checked by eye |
| `board-refile` | yes | yes | `board-files.test.ts` |
| `import-idempotent` | yes | no | a one-off script, deleted at `/finalize` |
| `git-pull-guard` | yes | yes | the hook's tests |
| `trace-coast` | yes | no | a path constant |

https://claude.ai/code/session_01DaohkDaDnGMyHjrW4DfJkD

---

## Comments

- **C01** @vzakharov (agent) — 2026-11-07T07:27:19Z — "Proposed squash body: ``` The operator's review of the islan…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-11-07T07:27:19Z

[https://github.com/vzakharov/vovazakharov.com/pull/258#issuecomment-6703910669](https://github.com/vzakharov/vovazakharov.com/pull/258#issuecomment-6703910669)

Proposed squash body:

```
The operator's review of the island branch (#255, and #258's own)
asked for the board to become maintainable code with a source a person
can read, for the cost rows to count what they claim, and for a few
repo-wide guards.

The board is the island-board MASD app: its item entity, a page split
into camera, drawing and canvas slices, SCSS styles, and `pnpm board`
(build, sync, refile, snapshot). Its source is YAML, docs/boards/
island.yaml plus a file per zone beside the images; which file holds
an item is derived from the zones on every write, so no file outgrows
the new limit: a test fails any text file over 400 lines, with
today's offenders frozen in an allowlist that can only shrink.

Cost rows leave binary files out of branchLines, carry the session's
subject line under the estimate's time, and count the operator's
review words beside their chat words, once across sessions. The
island's rows are backfilled to match.

`git pull` is blocked by a hook with a per-command escape; plane types
leave the kernel for scene's plane module, and only a barrel may
re-export. The mammoth reaches main through cuts rather than an epic
branch, recorded in the mammoth notes.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

<a id="r01"></a>

### R01 — Review by @vzakharov (agent) — COMMENTED

_2026-11-07T06:15:46Z_

[https://github.com/vzakharov/vovazakharov.com/pull/258#pullrequestreview-5810517114](https://github.com/vzakharov/vovazakharov.com/pull/258#pullrequestreview-5810517114)

**/five-percent**: два предложения, из них одно critical.

<!-- five-percent: b8439de64493f2d82f2d45c7e8ca0d8f7cd7f823 -->

<a id="r02"></a>

### R02 — Review by @vzakharov (human) — COMMENTED

_2026-11-07T07:24:18Z_

[https://github.com/vzakharov/vovazakharov.com/pull/258#pullrequestreview-5810764845](https://github.com/vzakharov/vovazakharov.com/pull/258#pullrequestreview-5810764845)

**/five-percent**: одно предложение, critical — ни одного.

---
_Generated by [Claude Code](https://claude.ai/code)_

<!-- five-percent: 6df49dcd1fae65fefb6e47faea0a1728ef146a9b -->

_18 resolved threads omitted; re-run with `--include-resolved` to export them._

- **T01** `src/island/shared/play/play-hook.ts`:5 — unresolved — last: @vzakharov (human) 2026-11-08T17:51:07Z — "хм, то есть гипотетически ничего не мешает нам для роутинга…" → [↓](#t01)
- **T02** `src/origami/scripts/fold-steps.ts`:1 — unresolved — last: @vzakharov (human) 2026-11-08T17:52:49Z — "хм, пока не понял: почему island/review-1 понадобилось вмерд…" → [↓](#t02)

<a id="t01"></a>

### `src/island/shared/play/play-hook.ts`:5 — unresolved

```diff
@@ -0,0 +1,28 @@
+/**
+ * What `/island?play` hands a script on `window[PLAY_HOOK]`, and only when the
+ * URL carries `PLAY_QUERY`: the page's real clock frozen and a seeded one
+ * stepped by hand, so every run draws the same frames. The page implements it;
+ * `scripts/play-island.ts` drives it.
```

**@vzakharov (human)** — 2026-11-08T08:49:39Z

для моего понимания: хм, а у нас же статический сайт, как `?`? Или это только скрипт так умеет вызывать?

**@vzakharov (agent)** — 2026-11-08T09:10:59Z

Сервер тут ни при чём: `/island?play` отдаёт тот же статический HTML, что и `/island`. Query-строку читает уже браузер — `island-canvas.tsx` смотрит в `location.search`, и только при `play` вешает хук на `window`. На проде это тоже работает, но обычный посетитель туда не попадёт: ссылку открывает только `scripts/play-island.ts`.

**@vzakharov (human)** — 2026-11-08T17:51:07Z

хм, то есть гипотетически ничего не мешает нам для роутинга миров использовать ? а не #?

---

<a id="t02"></a>

### `src/origami/scripts/fold-steps.ts`:1 — unresolved

**@vzakharov (human)** — 2026-11-08T08:51:49Z

напомни каким образом в нашего мамонта приехало что-то про оригами пжст?

**@vzakharov (agent)** — 2026-11-08T09:11:02Z

Оригами — это main (#251, #253), а не мамонт. В дифф #258 оно попало слиянием базы: `island/review-1` влил свежий main раньше, чем ветка острова, поэтому файлы main показались в диффе против базы. В диффе #255 против main от оригами осталось три мелкие правки: типы плоскости уехали из kernel в `scene`, и `Axis` теперь собирается из `Centred` — этого требует гейт type-overlap.

**@vzakharov (human)** — 2026-11-08T17:52:49Z

хм, пока не понял: почему island/review-1 понадобилось вмердживать main? теперь мы нормально дифф от только нашего мамонта нигде не посмотрим?

---

## Timeline (status, references, and other events)

- **2026-11-07T06:15:46Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/258#pullrequestreview-5810517114.
- **2026-11-07T06:47:19Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/258#pullrequestreview-5810558546.
- **2026-11-07T07:24:18Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/258#pullrequestreview-5810764845.
- **2026-11-07T07:26:53Z** @vzakharov renamed from «fix(island): handle #255's review on the board, costs and lints» to «fix(island): handle #255's review — the board as an app on YAML, costs, lints».
- **2026-11-07T07:27:21Z** @vzakharov renamed from «fix(island): handle #255's review — the board as an app on YAML, costs, lints» to «fix(island): #255's review — the board as an app on YAML, costs, lints».
- **2026-11-07T07:45:59Z** @vzakharov cross-referenced this pull request from [#264 feat(island-board): links in card text, spiral lines, board thread words](https://github.com/vzakharov/vovazakharov.com/pull/264).
- **2026-11-07T07:56:04Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/1544b09af58aad997f5876ec71fad3e6ec828e10.
- **2026-11-07T07:56:04Z** @vzakharov merged this pull request.
- **2026-11-07T07:56:04Z** @vzakharov closed this pull request.
- **2026-11-07T07:56:25Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/1ff79a701f3dc32b5b809aaa95194de99cde4161.
- **2026-11-08T08:53:28Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/258#pullrequestreview-5817163946.
- **2026-11-08T08:59:27Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/8fe9185088ffe217b81720b93c2a0857d15dada9.
- **2026-11-08T08:59:27Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/a4ca906aeeeef5a684685d5a6e3bb9c84ef35659.
- **2026-11-08T09:04:35Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/0832c16a3d09c8c5f9a2b44ff118963d90edf79e.
- **2026-11-08T09:05:51Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/5ea82220bd343bfc62645e9564f264ccb606112d.
- **2026-11-08T09:08:06Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/3cdcfb549f3a0dd89046f64a9944c769705b052e.
- **2026-11-08T09:09:07Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/979fd555028679dbda455d0c6fe3549eda94c433.
- **2026-11-08T09:11:21Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/ed013f17ee0703844226cedce70e3d88f6e5b29c.
- **2026-11-08T09:12:00Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/82bae3093785b9a1847fa84673d963dc02f0e9a5.
- **2026-11-08T09:17:00Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/190a13c5359d1f95db57c10761ecc779d8375139.
- **2026-11-08T09:17:00Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/a6772db122e1a9b187382eb82a9d53f3f39b36d6.
- **2026-11-08T09:29:59Z** @vzakharov cross-referenced this pull request from [#255 feat(vova): /island, exploring the world Zoltan and Syama drew](https://github.com/vzakharov/vovazakharov.com/pull/255).
