# PR #255: feat(vova): /island, exploring the world Zoltan and Syama drew

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/255
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/world-game-zoltan-syama-hodowq
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-11-06T17:15:44Z
- **Updated:** 2026-11-08T09:12:01Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: none

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (the export committed at 82bae30). Resolved threads never count; an `(agent)` tail is a reply already given._

---

## Body

## Summary

- **The goal**: an exploration game over the map Zoltan and Syama drew, at `/island` — the whole island from near space, down through the clouds as a gliding bird, then on foot, detail generated as it comes into view. The game itself arrives through bite PRs into this branch; bite 1, the thinnest descent from orbit to the ground, is #256. What this branch carries of it so far is the contract bite 1 builds to (`docs/plans/world-game-zoltan-syama/bite-1.md`) and its stickers on the board.
- **The board is the plan**: `scripts/board/` (`pnpm board build | sync | snapshot`) builds a mind map from one JSON file per item under `docs/plans/world-game-zoltan-syama/board/` and publishes it as an artifact the operator can edit in place; `sync` merges those edits back. Stickies, tape and curved lines are drawn from a hash of each item's id, so the hand-drawn look is stable and stores nothing.
- **The team's tooling**: `scripts/memo/memo.py` is the lead/member channel — notes appended as commits to `memo.md` on a bite branch, posted without a checkout, with a background `wait` on the other side's reply; its fetch leaves `FETCH_HEAD` alone, since a sibling's `git pull` merging the poll's fetch is how bite 1's files reached this branch early (686f51740 — they belong to #256). The method's notes move from `.claude/skills/megabeast/` to `mammoth/`.
- **Measuring the human share**: every cost row now records the operator's words and the branch's lines per extension; `.claude/costs/contribution.py [--at TIME]` sums a branch's dollars, senior-hours, words and lines, and `pnpm contribution lines` gives the cumulative-flow CSV. An unlisted case study, `sites/vova/public/case-studies/island.md`, is written as the game is built, one dated entry with a board snapshot each — the first holds the 3,120 h studio forecast for the comparison at the end.

## QA Checklist

The game:

- [ ] `orbit` — open `/island`: the whole island is in view from near space, clouds below.
- [ ] `coast` — fly down to a shore: the coast gains capes and coves as you approach, never a smooth traced line.
- [ ] `spirit` — dive toward the ground: no bob, speed falls with altitude.
- [ ] `clouds` — crossing the cloud layer turns you into a bird: flapping climbs with a small bob, not flapping glides down.
- [ ] `detail` — on the way down rivers, hills and then trees appear without popping.
- [ ] `walk` — at the ground you walk, with a head-bob; a flap takes off again.
- [ ] `phone` — the same descent on a phone, touch controls, playable frame rate.
- [ ] `same-world` — reload: the world is the same in every place.

What this branch carries already:

- [ ] `board` — `pnpm board build docs/plans/world-game-zoltan-syama/board` and open `tmp/board/world-game-zoltan-syama/index.html`: every zone and sticker is there, light in either theme, each item at the same tilt and tape on every render.
- [ ] `board-sync` — move a sticker in the published board, then `pnpm board sync` against its rows: the item's JSON takes the new position and nothing else changes.
- [ ] `case-study` — `/case-studies/island` renders with its map and board snapshot, and appears on no index or sitemap.
- [ ] `contribution` — `python3 .claude/costs/contribution.py` on this branch prints dollars, hours, words and lines; `--at` an earlier time prints smaller figures.
- [ ] `memo` — between two checkouts, `memo.py post --as member` on a bite branch wakes a `memo.py wait --as lead` on the other, and `FETCH_HEAD` in the waiting checkout is unchanged.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `orbit` | e2e | ❌ | scripted descent frames (#256's play script) |
| `coast` | unit | ❌ | coast detail per level is pure; look by frames |
| `spirit` | unit | ❌ | speed curve is a pure function |
| `clouds` | unit | ❌ | mode transitions pure; look by frames |
| `detail` | manual-only | — | popping is judged by eye |
| `walk` | unit | ❌ | ground height pure; feel by hand |
| `phone` | manual-only | — | `/preview live` on a phone |
| `same-world` | unit | ❌ | tile content a pure function of its key |
| `board` | unit | ✅ | `scripts/board/page/hand.test.ts`, `camera.test.ts`; the look itself by eye |
| `board-sync` | unit | ✅ | `scripts/board/model.test.ts` — merge of db rows over items |
| `case-study` | e2e | ❌ | `pnpm build` renders it; hidden from indexes by the `hidden` flag |
| `contribution` | unit | ✅ | `.claude/costs/test_contribution.py`, `scripts/contribution/lines.test.ts` |
| `memo` | integration | ✅ | `scripts/memo/test_memo.py`, two clones of a temporary origin, FETCH_HEAD included |

https://claude.ai/code/session_01DaohkDnbB6vFsaUrHvR1KB

---

## Comments

- **C01** @vzakharov (agent) — 2026-11-06T17:16:07Z — "Proposed squash body: ``` Zoltan and Syama drew a world of t…" → [↓](#c01)
- **C02** @vzakharov (agent) — 2026-11-07T05:17:15Z — "По R02. 1. Подветка: `island/review-1`, от головы этой ветки…" → [↓](#c02)
- **C03** @vzakharov (agent) — 2026-11-07T05:28:30Z — "По R02. В сессии: ты предложил подливать эпик в main время о…" → [↓](#c03)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-11-06T17:16:07Z

[https://github.com/vzakharov/vovazakharov.com/pull/255#issuecomment-6690851741](https://github.com/vzakharov/vovazakharov.com/pull/255#issuecomment-6690851741)

Proposed squash body:

```
Zoltan and Syama drew a world of thirty countries on one sheet;
/island lets you explore it. You start in near space with the whole
island in view and clouds drifting below, dive through the cloud layer
as a gliding bird, and land to walk. Nothing built or alive yet: an
untouched world, at the real scale the drawing was measured to, where
going far means climbing above the clouds.

A drawn map is the game's input: white is water, the rest is land,
traced once into a vector coastline that fractals as you approach.
Relief, rivers and climate are derived from it and one seed, so the
world is the same on every visit. What needs the whole map is computed
once; finer detail is a pure function of a tile's key, generated as the
tile comes into view. It renders with three.js on WebGPU, falling back
to WebGL 2.

The game was built by a team of sessions: a lead holding the plan, and
members each building a bite on a branch of its own, talking through a
memo file on that branch (scripts/memo/memo.py). The plan is a mind map
built from one file per item (scripts/board/) and published as an
artifact. Cost rows record the operator's words and the branch's lines,
and .claude/costs/contribution.py sums a branch's dollars, hours, words
and lines at any moment, so the case study written alongside the game
(/case-studies/island, unlisted while in progress) can set the human share
against a 3,120-hour studio forecast.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

<a id="c02"></a>

### Comment by @vzakharov (agent) on 2026-11-07T05:17:15Z

[https://github.com/vzakharov/vovazakharov.com/pull/255#issuecomment-6702715157](https://github.com/vzakharov/vovazakharov.com/pull/255#issuecomment-6702715157)

По R02.

1. Подветка: `island/review-1`, от головы этой ветки. Ревью (T01–T10, T12–T20) разбирает там отдельная сессия: https://claude.ai/code/session_01DaohkBPPsH9jFCtdTa4Qb9. Её PR пойдёт на эту ветку, а не на main. T11 мой: залив между Блабланией и Фейсис — это берег, поэтому я передал его исполнителю бита 1. Озёра пока остаются биту озёр.

2. `epic/island-part-1` создана от main. Перецелить этот PR на неё мне не дал классификатор auto-режима, это нужно разрешить отдельно.

Велосипеда тут нет, это обычная интеграционная ветка. Три вещи стоит держать в голове:
- эпик не деплоится, деплой идёт только с мержа в main. Остров пока `hidden`, так что смотреть будем через `/preview live`;
- эпик будет отставать от main. Чтобы финальный PR в main не собрал конфликтов разом, main в него надо иногда подтягивать. Этот PR уже конфликтует с main;
- открытые на эту ветку PR битов после сквоша в эпик перецеливаются на следующую ветку, которую начнём от эпика.

---

<a id="c03"></a>

### Comment by @vzakharov (agent) on 2026-11-07T05:28:30Z

[https://github.com/vzakharov/vovazakharov.com/pull/255#issuecomment-6702816434](https://github.com/vzakharov/vovazakharov.com/pull/255#issuecomment-6702816434)

По R02. В сессии: ты предложил подливать эпик в main время от времени, и тогда у эпика остаётся одна работа — быть замороженным снимком на время мерджа. Такой снимок можно срезать прямо с мамонта, и «эпик» становится не тем словом.

Вышел цикл срезов:
1. От головы этой ветки режется `island/cut-N`.
2. На срезе гоняется `/finalize`, и он сквошится в main. Биты тем временем мерджатся сюда как обычно.
3. main возвращается сюда через `git fetch origin main && git merge origin/main`.

Почему не мерджить мамонт в main напрямую: мамонт никогда не ждёт vet, polish и ревью, а собственные коммиты `/finalize` — вычистка `docs/plans/` и `docs/remove-before-merging/`, правки от polish и vet — ложатся на ветку, в которую не мерджится ни один бит. Отсюда и ответ про удаляемые при финализации файлы: план, доска и релеи вычищаются только со среза и остаются здесь. Общая инфраструктура (леджер, memo, хуки, линт-правила) уходит в main на каждом цикле, сортировать «островное» и «общее» не нужно.

Одна цена: после сквоша коммиты мамонта не предки main, так что вкладка Commits у этого PR хранит всю историю. Чистится она только перезапуском мамонта новой веткой от main — на срезе, когда в работе нет ни одного бита. Иначе живём с длинной вкладкой.

Записал в `.claude/skills/mammoth/notes/gates.md` и в ограничения плана — 9535350c. `epic/island-part-1` удалена.

---

## Review threads

<a id="r01"></a>

### R01 — Review by @vzakharov (agent) — COMMENTED

_2026-11-06T18:40:47Z_

[https://github.com/vzakharov/vovazakharov.com/pull/255#pullrequestreview-5805174087](https://github.com/vzakharov/vovazakharov.com/pull/255#pullrequestreview-5805174087)

**/five-percent**: два предложения, одно из них critical.
<!-- five-percent: 02e05381f96d612c188f556ef605687e69232805 -->

<a id="r02"></a>

### R02 — Review by @vzakharov (human) — COMMENTED

_2026-11-07T05:13:16Z_

[https://github.com/vzakharov/vovazakharov.com/pull/255#pullrequestreview-5809945100](https://github.com/vzakharov/vovazakharov.com/pull/255#pullrequestreview-5809945100)

два общих замечания:
1- хендлить давай в новой подветке, чтобы не задерживать основную работу
2- давай создадим ветку epic/island-part-1, от мейна, и натаргетим эту на неё, соответственно.

rationale: чтобы можно было какой-то весомый объём работ в какой-то момент сквошнуть на эпик, и оттуда потом начать новый пиар,чтобы здесь не скопилось, как было с грибами, 100500 коммитов и исправленных файлов.

как при этом быть с удаляемыми при финализации файлами -- решим по ходу дела.

если кажется что я изобретаю велосипед или другие возражения, предложи/возрази.

_19 resolved threads omitted; re-run with `--include-resolved` to export them._

- **T01** `sites/vova/public/case-studies/island.md`:49 — unresolved — last: @vzakharov (agent) 2026-11-08T09:11:05Z — "Теперь да. Правило из vzakharov/life (полировка, в том числе…" → [↓](#t01)

<a id="t01"></a>

### `sites/vova/public/case-studies/island.md`:49 — unresolved

```diff
@@ -0,0 +1,73 @@
… 43 lines elided …
+
+### The board instead of the plan
+
+Then I asked for something unusual. Instead of a plan file, the plan is an infinite board — stickies, lines where they help, pictures pinned for inspiration and for checking — that any session can draw on, and so can I. It’s stored in the repo, so it can be rebuilt from any account, and published as a page where my edits sync back.
+
+The first version came out too tidy — a ledger, not a table someone had drawn on. So now every sticky is tilted a little, by an amount derived from its name so it never jumps between renders; half of them are taped on; the lines are bowed pencil strokes with handwritten labels. This is the board on the evening the work began:
```

**@vzakharov (human)** — 2026-11-07T05:05:25Z

так, тут какие-то слопности: "Then I asked for something unusual", "a ledger not a table". Я не помню точно как мы тут со слопом боремся, потому что у меня расползлось это между этой репой и vzakharov/life, но нужно взять оттуда то что применимо здесь.

**@vzakharov (agent)** — 2026-11-07T05:26:35Z

Убрал обе — e9ff7250. Правила из vzakharov/life взять не вышло: у сессии нет доступа к этому репо, а подключить его не дал классификатор auto-режима. Дашь доступ или скинешь, где там правила, — сверю кейс ещё раз. Заодно абзац про доску теперь говорит, что рисует на ней лид, а не любая сессия (это из пятипроцентного треда).

**@vzakharov (agent)** — 2026-11-07T05:36:41Z

Доступ к vzakharov/life получил. Применимое здесь правило оттуда (`.claude/rules/outreach-writing.md`): отполированный текст читается как машинный, и привычный носителю оборот — тоже полировка. По нему ушли ещё «Picture this.» и «well enough to stop you scrolling» — cf3fd6ec. Остальное там про голос документов и холодные письма, к кейсу не относится.

**@vzakharov (human)** — 2026-11-07T06:25:00Z

а сюда сохранил применимые правила чтобы повторно не наткнуться?

**@vzakharov (agent)** — 2026-11-08T09:11:05Z

Теперь да. Правило из vzakharov/life (полировка, в том числе привычный носителю оборот, читается как машинная) записано в `.claude/rules/writing.md` вместе с остальными приметами машинной прозы и привязано к `sites/*/public/**/*.md`, так что следующая страница встретит его раньше ревью — 979fd555.

---

## Timeline (status, references, and other events)

- **2026-11-06T17:16:15Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/ad38a632554ffd0ffa6aa728b54933b5c3e60ba5.
- **2026-11-06T17:20:49Z** @vzakharov renamed from «feat(vova): /world, a descent onto the world Zoltan and Syama drew» to «feat(vova): /island, exploring the world Zoltan and Syama drew».
- **2026-11-06T18:27:10Z** @vzakharov cross-referenced this pull request from [#256 feat(vova): island bite 1, the thinnest descent from orbit](https://github.com/vzakharov/vovazakharov.com/pull/256).
- **2026-11-06T18:40:47Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/255#pullrequestreview-5805174087.
- **2026-11-06T18:42:45Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/690161b777b76959752037c6198487e3310d457c.
- **2026-11-07T05:13:16Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/255#pullrequestreview-5809945100.
- **2026-11-07T05:23:49Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/d584581fdcfc971c89f3e37aa6d6f0f339b0409b.
- **2026-11-07T05:26:46Z** @vzakharov cross-referenced this pull request from [#258 fix(island): #255's review — the board as an app on YAML, costs, lints](https://github.com/vzakharov/vovazakharov.com/pull/258).
- **2026-11-07T05:57:52Z** @vzakharov cross-referenced this pull request from [#259 feat(vova): island bite 1, the thinnest descent from orbit](https://github.com/vzakharov/vovazakharov.com/pull/259).
