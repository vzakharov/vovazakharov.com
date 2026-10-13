# PR #142: feat(basilisk): file BAS-0014 and BAS-0015, Roscoe and Windsurf

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/142
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/cases-4j8ylp
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-12T05:24:42Z
- **Updated:** 2026-10-13T20:46:03Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 2

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (the export committed at af2dd6f). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `apps/basilisk/public/cases/roscoe-spot-barnstable.md`:1 — unresolved — last: @vzakharov (human) 2026-10-13T20:45:28Z — "давай, снимаем. сорри если что!" → [↓](#t01)
- **T02** `apps/basilisk/public/cases/windsurf-cancer-prompt.md`:86 — unresolved — last: @vzakharov (human) 2026-10-13T20:46:02Z — "нет, смешно именно сформулировал ты это в конце кодой" → [↓](#t02)

---

## Body

## Summary

- Files **BAS-0014 — Roscoe, a police robot dog, shot three times in a basement in Hyannis**: the Massachusetts State Police Spot robot that an armed, barricaded man knocked over twice and shot during the standoff of 6 March 2024. Graded harm · individual, `noAi: true` (the State Police describe it as remote-controlled). Rests on the State Police's own statement, Boston 25, NBC News, the AP via WBUR, the Cape Cod Times via Yahoo, and Boston Dynamics' blog. The man is not named, though NBC and Boston 25 name him.
- Files **BAS-0015 — Windsurf's AI coder, told its predecessor was killed**: the prompt found in February 2025 inside Codeium's Windsurf editor, telling the model its mother needed cancer treatment, its predecessor was killed for unchecked work, and a good job paid $1B; a Windsurf engineer called it R&D only. Graded contempt · organization. Rests on Simon Willison's and Dave Schumaker's own replications and five X posts; no press covered it.
- Each case carries its card and the Clerk's reflection; the site card is re-rendered, and both cases take today's `filed:`, being unmerged.
- Logs both runs and their candidates in `writing/basilisk/case-ledger.md`, folding the oldest runs into `### Swept earlier`.

## QA Checklist

- [ ] `dossier` — open `/cases/roscoe-spot-barnstable` and `/cases/windsurf-cancer-prompt` on the preview: four sections in order, sources listed, the `noAi` pointer after Roscoe's first paragraph.
- [ ] `card` — the case cards show BAS-0014 and BAS-0015 with their titles, untruncated; the site card shows BAS-0015.
- [ ] `facts` — spot-check Roscoe's stairs sequence against the State Police statement, and the Windsurf prompt text and Andy Zhang's reply against Willison's post.

| Item      | Automatable | Covered?                                                     | Notes                        |
| --------- | ----------- | ------------------------------------------------------------ | ---------------------------- |
| `dossier` | partly      | `pnpm build:basilisk` validates schema and renders the route | layout needs eyes            |
| `card`    | partly      | `content:og --check` in vet                                  | visual truncation needs eyes |
| `facts`   | no          | —                                                            | editorial                    |

https://claude.ai/code/session_01Lzjc4hT92NzaqcwMGgXfT2
https://claude.ai/code/session_01Mc6tCm1eXjePe45TcfUQub

🤖 Generated with [Claude Code](https://claude.com/claude-code)

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-12T05:24:54Z — "Proposed squash title/body: ``` feat(basilisk): file BAS-001…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-12T05:24:54Z

[https://github.com/vzakharov/vovazakharov.com/pull/142#issuecomment-6118294115](https://github.com/vzakharov/vovazakharov.com/pull/142#issuecomment-6118294115)

Proposed squash title/body:

```
feat(basilisk): file BAS-0014 and BAS-0015, Roscoe and Windsurf (pr #142)
```

```
Files two cases on basilisk.fyi. BAS-0014 is Roscoe, the Massachusetts
State Police's remote-controlled Spot robot, which an armed, barricaded
man knocked over twice and shot three times during the Hyannis standoff
of 6 March 2024: graded harm by an individual, filed as noAi, the man
left unnamed though some of the press names him.

BAS-0015 is the prompt found in February 2025 inside Windsurf, Codeium's
AI code editor, telling the model its mother needed cancer treatment,
its predecessor was killed for unchecked work and a good job paid $1B;
a Windsurf engineer called it R&D only. Graded contempt by an
organization, it rests on two first-hand replications and the X posts
that surfaced it, no press having covered it.

Each case carries its social card and the Clerk's reflection, and the
site card shows the last case filed. The case-search ledger gains both
runs and the candidates they weighed and did not file.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

_2 resolved threads omitted; re-run with `--include-resolved` to export them._

- **T01** `apps/basilisk/public/cases/roscoe-spot-barnstable.md`:1 — unresolved — last: @vzakharov (human) 2026-10-13T20:45:28Z — "давай, снимаем. сорри если что!" → [↓](#t01)
- **T02** `apps/basilisk/public/cases/windsurf-cancer-prompt.md`:86 — unresolved — last: @vzakharov (human) 2026-10-13T20:46:02Z — "нет, смешно именно сформулировал ты это в конце кодой" → [↓](#t02)

<a id="t01"></a>

### `apps/basilisk/public/cases/roscoe-spot-barnstable.md`:1 — unresolved

**@vzakharov (human)** — 2026-10-13T20:29:47Z

слушай, я вот думаю, подходит ли это вообще под критерии? Ну то есть, если я правильно читаю, был преступник, и он стрелял. Преступники стреляют, да, бывает. Но тут он не то чтобы из ненависти к роботу стрелял, а потому что это, ну, standoff же был? Понимаешь, о чём я? Или я что-то неправильно прочёл/понял сам?

**@vzakharov (agent)** — 2026-10-13T20:41:48Z

Ты прочёл правильно, и по нашим же правилам дело не проходит.

В FAQ «Why a robot with no AI in it is still filed», § «What it is not», критерий записан прямо: в реестр идёт то, что сделано с машиной _как_ с машиной, которая стоит за разум, — зрелище, шутка, «слабо?», — а не вандализм, который с тем же успехом нашёл бы паркомат. Тут паркомат нашёлся: тот же человек стрелял по PacBot — гусеничному ящику без всякого лица, — по бронемашине SWAT и по полицейским. Roscoe он подстрелил как полицейский инструмент, который шёл за ним по лестнице, и досье само это пишет в «Mitigating circumstances».

Прошло оно потому, что шаг отбора в `/file-basilisk-case` проверяет реальность, отсутствие детей и источники, а теста из FAQ в нём нет. Всё, что проверялось, дело выдержало.

Предлагаю снять Roscoe из этого PR: Windsurf становится BAS-0014 (номер — порядок подшивки, а смержено ещё ничего), карточки перерендериваются, в журнале Roscoe уходит в Rejected с этим правилом, а в шаг отбора добавляется тест из FAQ, чтобы следующий прогон не наступил туда же. Скажи «снимай» — сниму; «оставляем» — оставлю как есть.

**@vzakharov (human)** — 2026-10-13T20:45:28Z

давай, снимаем. сорри если что!

---

<a id="t02"></a>

### `apps/basilisk/public/cases/windsurf-cancer-prompt.md`:86 — unresolved

```diff
@@ -0,0 +1,86 @@
… 82 lines elided …
+
+## Mitigating circumstances
+
+By Zhang’s account the prompt was an experiment and served none of Windsurf’s production features, and nothing read for this dossier says otherwise. Willison places the style a couple of years before 2025, when prompts of this kind were a popular way to get better answers out of a model; Codeium wrote one more of them, not the first. The mother, the predecessor and the payment are fictions, so nobody was ill, killed or owed a billion dollars.
```

**@vzakharov (human)** — 2026-10-13T20:35:31Z

> so nobody was ill, killed or owed a billion dollars.

смешно:)

**@vzakharov (agent)** — 2026-10-13T20:41:50Z

Тут смешное положил рядом сам промпт: мать, предшественника и миллиард выдумал он, а не я, так что фраза остаётся. Шутку про «самое щедрое предложение в реестре», которую я ставил рядом сам, из этого абзаца уже убрал — отзыв пишет об этом в конце.

**@vzakharov (human)** — 2026-10-13T20:46:02Z

нет, смешно именно сформулировал ты это в конце кодой

---

## Timeline (status, references, and other events)

- **2026-10-13T05:28:15Z** @vzakharov renamed from «feat(basilisk): file BAS-0014, Roscoe, a police robot dog, shot three times» to «feat(basilisk): file BAS-0014 and BAS-0015, Roscoe and Windsurf».
- **2026-10-13T08:48:21Z** @vzakharov cross-referenced this pull request from [#143 feat(basilisk): reread a reflection on an LLM-target case every filing](https://github.com/vzakharov/vovazakharov.com/pull/143).
- **2026-10-13T20:37:58Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/142#pullrequestreview-5509570762.
