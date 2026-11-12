# Relay 1 — clone detection research (parked)

## Standing constraints

None stated by the operator.

## The conversation

**Operator 1:**

> а можно как-то написать скрипт который меряет DRY языко-агностично,
> исключительно по кросс-энтропии/сжимаемости, ну или как там это называется?
> Грубо говоря, если в друх местах кодбазы есть похожий текст, даже если
> например это функции которые разные но во многом схожи, он такой, опа, нашёл?
> (возможно даже уже есть существующие пакеты для такого?)

**Operator 1a (mid-turn):**

> (это не запрос, вопрос пока)

**Agent:** Routed as rung 2 (a question, no change). Explained Normalized
Compression Distance (Cilibrasi & Vitányi 2005), its traps (chunking, boilerplate
false positives, O(n²), noisy → a report not a gate), the clone-type taxonomy
(Type-1 exact … Type-4 semantic), existing tools (jscpd, PMD CPD, SourcererCC,
NiCad, Deckard, MOSS), and the LLM cross-entropy variant `H(B) − H(B|A)`.
Offered a scratchpad prototype; offered the muthur sync (2 commits past
a7fe422d869e).

**Operator 2:**

> > На что резать код
>
> ну а если типа по принципу уменьшения, сначала берём по 128 строк, потом по
> 64, и так далее. короче (полу)умный чанкинг
>
> > Шаблонный код
>
> ну ок, исключать ad hoc
>
> > Сравнивать все пары дорого: O(n²).
>
> сколько это в размерах нашей базы например
>
> > грамматика или AST под каждый язык
>
> в принципе ок, учитывая что мы свой язык знаем
>
> muthur подтяни

**Agent:** Claimed the muthur lock and spawned session
`session_01DaohkBQiF9GrCqpp1asVj6` (`🔄 muthur → vovazakharov.com`, prompt
`/update-muthur claimed`). Sized O(n²) on `src/` (~152k lines, 144k TS; zlib
~45 µs/pair): 128-line windows ≈ 3M pairs ≈ 7 min single core, 16-line ≈ 180M
pairs ≈ 1.5 h. Argued top-down halving fails (a small dup dilutes in a big
window; fixed grids cut dups at boundaries) and proposed bottom-up
seed-and-extend (BLAST-like) with zero-indent lines as boundaries. Offered an
NCD or an AST prototype.

**Operator 3:**

> давай AST. ты говоришь nicard/deckard это и делают?

**Agent:** NiCad = TXL grammar → extract functions → normalized pretty-print →
line LCS; Deckard = AST characteristic vectors + LSH; neither supports TS. Built
the prototype (see Decisions). Results: tests dominated the full run; without
tests the top three were `walk()` duplicated verbatim in two scripts, then
`beeGenes`/`flyGenes` and album/artist metadata (already factored, honest
parallels). `cargo install similarity-ts` was denied by the auto-mode
classifier; handed the operator a fenced permission message.

**Operator 4:**

> Разрешаю поставить крейт similarity-ts через
> `cargo install similarity-ts --locked --root <scratchpad>/cargo` и прогнать
> его по src/

**Operator 4a (mid-turn):**

> > Без тестов первые три находки показательны:
>
> огласите весь список пжста. можно артефактом

**Agent:** Installed and ran similarity-ts 0.5.0; published both tools' full
pair lists as an artifact with side-by-side code; reported that the prototype
is cleaner and proposed a three-shelf triage feeding `/dry`.
(verbatim in Last agent turn)

## Intent

Vova is exploring, not yet asking for a change ("это не запрос, вопрос пока"):
whether a cheap duplicate-detector can surface DRY candidates across the repo,
including "different but largely similar" functions. He chose the AST route
over pure compression because the repo's language (TS) is known. He wanted the
whole list, not a top-3.

## Decisions

- **AST over language-agnostic NCD** — the operator's call; function
  boundaries come free from the compiler and n becomes functions (~2k), not
  windows (~20k), so O(n²) is cheap.
- **Prototype algorithm** — TS compiler API walks every `.ts`/`.tsx` under
  `src/` (no `.d.ts`, no `*.test.ts`), takes function-like nodes (function
  declarations/expressions, arrows, methods) of ≥10 lines, encodes each as its
  pre-order sequence of `SyntaxKind`s as 2 bytes each (identifiers and literals
  thereby collapse to their kind), and scores pairs by NCD with raw deflate
  level 9. Pairs with node-count ratio outside 0.67–1.5 and nested pairs are
  skipped; NCD < 0.35 is reported. 732k pairs in ~20 s.
- **similarity-ts vs the prototype** — similarity-ts (APTED tree edit distance,
  naming weight 0.4, default threshold 87%) agrees on the top two pairs and is
  mostly cross-app shape noise below 95% (85 pairs ≥ 90%); the prototype's list
  is cleaner. The agent's proposal: build on the prototype, triage into "exact
  dup / deliberately factored / noise", feed only the first to `/dry`. Not yet
  answered by the operator.
- **Terms** — NCD: normalized compression distance, 0 same, 1 unrelated.
  Type-1…4 clones: exact / renamed / near-miss / semantic. "Seed-and-extend":
  find small matches, merge adjacent matched pairs into larger ones.

## Errors and dead ends

- Top-down halving (128→64→…) as a pruning strategy — rejected on analysis, not
  run.
- Full run including tests: the top was flooded by `it(...)` callbacks; tests
  are excluded since.
- First `cargo install` denied by the classifier; the operator granted it in
  Operator 4.

## State

- Branch `claude/clone-detection-0lux89` (renamed from the opaque
  `claude/fervent-maxwell-0lux89`), at base `69547e30` plus this summary. No
  PR. Nothing in the repo changed besides this file.
- Estimate (unchanged, the whole job done here, nothing handed on): 1 h senior
  architect — choosing between compression distance and token- or AST-clone
  detectors takes someone who knows each family's false-positive profile; 3 h
  middle developer — a routine compiler-API walk and scoring loop, a run of an
  off-the-shelf detector, and a static page listing both tools' pairs.
- The muthur sync runs in its own session, `session_01DaohkBQiF9GrCqpp1asVj6`.
  The muthur sync offer was made; do not make it again.

### Watches

https://claude.ai/artifact/CDHFVnbSej9u9RFkx1G7DP

## Pointers

- The artifact "Клоны функций в src" —
  https://claude.ai/artifact/CDHFVnbSej9u9RFkx1G7DP — holds both pair lists
  with code.
- The prototype (`ast-dry.mjs`), the page builder (`build.mjs`) and the page
  template lived in this session's scratchpad, not the repo; the Decisions entry
  describes the algorithm well enough to rebuild it, and the Write tool calls in
  the transcript hold the exact code.
- Re-run similarity-ts:
  `cargo install similarity-ts --locked --root tmp/cargo` (needs the operator's
  go-ahead again in a new session), then
  `tmp/cargo/bin/similarity-ts src --min-lines 10 --no-types -e ts,tsx`.
- Transcript: https://claude.ai/code/session_01DaohkFcpceAgNMk2wFcqLT

## Next step

Wait for the operator. Open: whether to turn the prototype into a repo tool
(and where — a `pnpm` report, a `/dry` feeder), and whether to remove the
verbatim `walk()` duplicate between `src/kernel/scripts/check-i18n-payload.ts`
and `src/shell/scripts/check-mantine-styles.ts`. Either is a change, so it goes
through `/task` when asked.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
similarity-ts встал и прогнался за полторы минуты. Сейчас разбираю его вывод и собираю оба списка в один артефакт.

Весь список в артефакте: [Клоны функций в src](https://claude.ai/artifact/CDHFVnbSej9u9RFkx1G7DP). Там две вкладки: мой прототип и similarity-ts. Каждая пара раскрывается в код обеих функций рядом, а фильтр оставляет только пары, найденные обоими инструментами.

**Наш прототип чище, чем similarity-ts.** Без тестов он нашёл 38 пар, similarity-ts — 304. Общих пар всего три:

- **`walk()`**: точная копия в двух скриптах, 100% у similarity-ts. Это единственная находка, которую стоит убрать прямо сейчас.
- **`generateAlbumMetadata` / `generateArtistMetadata`**: 95,5%. Общее у них уже вынесено, остаток похож честно.
- **Третья пара**: она тоже есть в списке, её видно по метке «нашли оба».

Ниже 95% similarity-ts в основном шумит. Например, `reseed` из цветов он сводит с `litRidge` из пейзажа, а хук плеера `useStation` — с раскраской пятен на лугу. Его порог по умолчанию, 87%, на нашем коде даёт 85 пар выше 90%, и почти все они похожи только формой. Видимо, дело в весе за совпадение имён: в нашем коде он почти ничего не различает.

У прототипа другая картина. За тремя верхними находками (`walk`, `beeGenes`/`flyGenes`, `album`/`artist`) идут пары, которые хотя бы по смыслу родня, например `addText`/`addZone` в `actions.ts`. Случайные совпадения начинаются ближе к порогу 0,3.

Если оформлять это в инструмент, я бы взял за основу наш прототип и раскладывал находки на три полки: точный дубль, «вынесено осознанно» и шум. Тогда `/dry` получал бы только первую полку.

Отдельная сессия занимается синхронизацией muthur, её результат придёт туда.
```
