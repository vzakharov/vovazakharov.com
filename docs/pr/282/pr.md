# PR #282: content: PR #281's cards on the cube board, no Russian on boards

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/282
- **Author:** @vzakharov (human)
- **Base ← Head:** main ← cube-board-drowsy-eye-cards
- **Draft:** no
- **Merged:** _not merged_
- **Created:** 2026-11-15T10:38:04Z
- **Updated:** 2026-11-15T11:03:27Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 3

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `src/board/scripts/check-board-language.ts`:4 — unresolved — last: @vzakharov (human) 2026-11-15T11:02:11Z — "да, хорошо. только надо решить (а) тогда в вете вообще не на…" → [↓](#t01)
- **T02** `src/board/scripts/vet-boards.sh`:17 — unresolved — last: @vzakharov (human) 2026-11-15T11:02:35Z — "окей" → [↓](#t02)
- **T03** `package.json`:37 — unresolved — last: @vzakharov (human) 2026-11-15T11:03:24Z — "а он кстати все борды смотрит? для island-board те же самые…" → [↓](#t03)

---

## Body

## Summary

- PR #281 put its intro cards on its own review board, which `/finalize` swept before landing, so none reached the cube board. They go on it now: a section under the intro zone for the drowsy eye and touch controls (seven frames as `.webp`, a card per thing the branch built), and a new zone under the to-do one, "To think about later (#281)", with Vova's two frames of the soft clouds on high and his think-later mark.
- Every new card is stamped after the doors branch's last (`2026-11-15T09:45Z`), so the timelapse plays them after the doors cards, by Vova's call.
- Boards are read in English: the two Russian quotes left on the cube board are translated, and `pnpm check:board-language` fails on any Cyrillic letter in a board's YAML. Vet runs it through `src/board/scripts/vet-boards.sh` only when the branch changes a board or the check.

## QA Checklist

- [ ] `section` — open the cube board (https://claude.ai/artifact/WbvwDqVtJzN8EBeuUffho3) and scroll to the bottom of the intro zone: the "#281" heading, seven frames and nine blue cards, none overlapping.
- [ ] `later` — under the to-do zone: the gray "To think about later (#281)" zone with the two cloud frames, the sticky, and a line to the shaking-clouds frame.
- [ ] `no-russian` — no Cyrillic anywhere on the board.
- [ ] `check-fails` — put a Cyrillic word in any board YAML and run `src/board/scripts/vet-boards.sh`: it fails naming the file and line.
- [ ] `check-skips` — on a branch touching no board, the script prints that it skipped.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `section` | partly | overlap checked by a Playwright pass in-session | layout is a look |
| `later` | partly | same | |
| `no-russian` | yes | `check:board-language` | |
| `check-fails` | yes | `cyrillic.test.ts` covers the matcher | run by hand once in-session |
| `check-skips` | yes | — | same gate as `vet-songs.sh` |

https://claude.ai/code/session_01DaohkD9P4XptTYFmmQHxAa

---

## Comments

- **C01** @vzakharov (agent) — 2026-11-15T10:38:18Z — "Proposed squash body: ``` PR #281 put its intro cards and fr…" → [↓](#c01)
- **C02** @vzakharov (agent) — 2026-11-15T10:53:58Z — "<!-- finalize-attestation c2851c190258600d28628783fbc16279cb…" → [↓](#c02)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-11-15T10:38:18Z

[https://github.com/vzakharov/vovazakharov.com/pull/282#issuecomment-6893089753](https://github.com/vzakharov/vovazakharov.com/pull/282#issuecomment-6893089753)

Proposed squash body:

```
PR #281 put its intro cards and frames on its own review board, which
its /finalize swept before landing, so none of them reached the cube
board. They go there now. Under the intro zone, a section for the
drowsy eye and touch controls holds the session's seven frames and a
card per thing the branch built; under the to-do zone, a new zone of
things to think about later holds Vova's two frames of the soft clouds
on high and the two ways out of them. Every new card is stamped after
the doors branch's last, so the timelapse plays them after the doors
cards rather than in true order.

Boards are read in English, so the two Russian quotes left on the cube
board are translated, and pnpm check:board-language fails on any
Cyrillic letter in a board's YAML. Vet runs it through vet-boards.sh
only when the branch changes a board or the check, the way
vet-songs.sh gates the song checks.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

<a id="c02"></a>

### Comment by @vzakharov (agent) on 2026-11-15T10:53:58Z

[https://github.com/vzakharov/vovazakharov.com/pull/282#issuecomment-6893259832](https://github.com/vzakharov/vovazakharov.com/pull/282#issuecomment-6893259832)

<!-- finalize-attestation c2851c190258600d28628783fbc16279cbe5b380 -->

### Attestation

Verified 14b9368b (`cube-board-drowsy-eye-cards`) against `main` @ 3d84534d "feat(vova): doors and gaps through the walls of the cube's floors (#280)".

- `./scripts/vet.sh` — **green**
- CI on this PR — **nothing runs on a PR in this repo**
- CI-only buckets — **not dispatched: the diff doesn't reach them**

The first vet run failed on `pnpm type-overlap`: the board check's named result type shared its `line` member with wesl's `Import`. 14b9368b types it inline, and the re-run went green. c2851c19 is past the verified commit only by the sweep of `docs/remove-before-merging/` and `.claude/costs/sessions/`; no code changed after 14b9368b.

No workflow runs on a PR; this comment is the verification record.

---

## Review threads

<a id="r01"></a>

### R01 — Review by @vzakharov (agent) — COMMENTED

_2026-11-15T10:40:54Z_

[https://github.com/vzakharov/vovazakharov.com/pull/282#pullrequestreview-5910284440](https://github.com/vzakharov/vovazakharov.com/pull/282#pullrequestreview-5910284440)

**/five-percent**: два предложения, оба необязательные.
<!-- five-percent: 466fd98440bbddda98752a296e878692ec015d17 -->

- **T01** `src/board/scripts/check-board-language.ts`:4 — unresolved — last: @vzakharov (human) 2026-11-15T11:02:11Z — "да, хорошо. только надо решить (а) тогда в вете вообще не на…" → [↓](#t01)
- **T02** `src/board/scripts/vet-boards.sh`:17 — unresolved — last: @vzakharov (human) 2026-11-15T11:02:35Z — "окей" → [↓](#t02)
- **T03** `package.json`:37 — unresolved — last: @vzakharov (human) 2026-11-15T11:03:24Z — "а он кстати все борды смотрит? для island-board те же самые…" → [↓](#t03)

<a id="t01"></a>

### `src/board/scripts/check-board-language.ts`:4 — unresolved

```diff
@@ -0,0 +1,44 @@
+/**
+ * Fails when any board's files carry Cyrillic: a board is written in English,
+ * an operator's words on it included, translated.
+ */
```

**@vzakharov (agent)** — 2026-11-15T10:40:44Z

<!-- five-percent proposal · an answer here is scored by .claude/skills/five-percent/verdicts.md -->
**/five-percent** · optional

Проверка ищет кириллицу во всём YAML досок, но на доску пишешь и ты сам, прямо в артефакте. `board sync` переносит твои правки в файлы как есть. Значит, русский стикер, оставленный тобой, всплывёт только на vet, в конце какой-нибудь ветки, и агенту придётся переводить твои же слова задним числом.

**Предложение: ловить русский там, где он входит, — в `board sync`**

Sync, встретив кириллицу в строке из db, называет карточку, и агент переводит её сразу, пока складывает правки в YAML. Проверка в vet остаётся страховкой.

Цена: десяток строк в `board.ts` на тот же `cyrillicLines`.

<details><summary>Подробнее</summary>

- `src/board/scripts/board.ts`, шапка: «the published artifact adds live edits in its `db`, which `sync` folds back into those files».
- Живые правки на досках уже есть: три карточки в YAML подписаны не `agent:*`, а пользовательским id (`u_L_AriiBLoWLIB4PYEulAJA`).
- `check-board-language.ts` читает все `src/*-board/app/config/**.yaml` без разбора автора, так что твой текст и текст агента проверяются одинаково.

</details>

**@vzakharov (human)** — 2026-11-15T11:02:11Z

да, хорошо. только надо решить (а) тогда в вете вообще не надо, или (б) если надо, то должно быть DRY

---

<a id="t02"></a>

### `src/board/scripts/vet-boards.sh`:17 — unresolved

```diff
@@ -0,0 +1,19 @@
… 8 lines elided …
+# shellcheck source=src/kernel/scripts/lib/changed-files.sh
+source src/kernel/scripts/lib/changed-files.sh
+
+INPUTS='^(src/[^/]+-board/app/config/.*\.yaml|src/board/scripts/(check-board-language\.ts|lib/cyrillic\.ts|vet-boards\.sh)|src/kernel/scripts/lib/changed-files\.sh)$'
+
+if changed="$(changed_files)" && ! grep -qE "$INPUTS" <<<"$changed"; then
+  printf 'vet-boards: no board has changed, so the board check is skipped.\n'
+  exit 0
+fi
```

**@vzakharov (agent)** — 2026-11-15T10:40:49Z

<!-- five-percent proposal · an answer here is scored by .claude/skills/five-percent/verdicts.md -->
**/five-percent** · optional

Проверка доски обёрнута в гейт по образцу `vet-songs.sh`: она запускается, только если ветка тронула доску или файлы самой проверки. При этом она читает пару десятков YAML-файлов за доли секунды, так что гейт почти ничего не экономит. Зато список её файлов в `INPUTS` надо вести руками: новый модуль, который проверка начнёт импортировать, туда не попадёт, и ветка, меняющая только его, проверку пропустит.

**Предложение: запускать `pnpm check:board-language` без гейта**

Поставить её в общий параллельный набор vet рядом с `check:typography` и удалить `vet-boards.sh`.

Цена: один процесс tsx на каждом прогоне vet, около секунды.

<details><summary>Подробнее</summary>

- `scripts/vet.sh`: `boards='src/board/scripts/vet-boards.sh'` в `local_checks`, `typography='pnpm check:typography'` в общем наборе.
- `.claude/rules/stack.md` оправдывает гейт песен тем, что вердикт песни — функция её файла; для типографики, которая читает всю прозу сайтов, гейта нет. Доски по стоимости ближе ко второму случаю.
- Без гейта уходит и его поддержка: строка в `stack.md` и сам `INPUTS`.

</details>

**@vzakharov (human)** — 2026-11-15T11:02:35Z

окей

---

<a id="t03"></a>

### `package.json`:37 — unresolved

```diff
@@ -34,6 +34,7 @@
     "check:masked-words": "tsx src/music/scripts/check-masked-words.ts",
     "check:song-titles": "tsx src/music/scripts/check-song-titles.ts",
     "check:stanza-repeats": "tsx src/music/scripts/check-stanza-repeats.ts",
+    "check:board-language": "tsx src/board/scripts/check-board-language.ts",
```

**@vzakharov (human)** — 2026-11-15T11:03:24Z

а он кстати все борды смотрит? для island-board те же самые правила

---

## Timeline (status, references, and other events)

- **2026-11-15T10:38:19Z** @vzakharov renamed from «content: #281's cards on the cube board, no Russian on boards» to «content: PR #281's cards on the cube board, no Russian on boards».
- **2026-11-15T10:40:54Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/282#pullrequestreview-5910284440.
- **2026-11-15T10:53:41Z** @vzakharov marked this pull request ready for review.
- **2026-11-15T11:03:27Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/282#pullrequestreview-5910359749.
