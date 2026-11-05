# Relay 8 — review of 2026-11-05 answered: eviction re-download, three variations, squash record; parked

## Standing constraints

None stated by the operator.

## The conversation

0. **Launch**: `/handle claude/in-browser-llms-unsquatted-24jeaq`
   - **Agent**: attached (the auto-branch delete answered `stale info`: it was never pushed), committed the export (four human threads awaiting an answer, `docs/pr/247/pr.md`), took the review lane (paused plan, no draft) and worked the four threads:
     - T01 (five-percent stale opt-in): «серой строки не нужно, а вот при нажатии модалка -- с новым текстом а ля "ой, куда-то подевалось, скачиваю снова, может занять a while [ОК]" (скачивание начинается сразу -- optedIn же) -- да» → 0165f637, then cf8ea4b5 (flag folded into `Loading` for type-overlap); verdict 0.6 recorded in `writing/notes/five-percent-verdicts/claude/in-browser-llms-unsquatted-24jeaq/verdicts.json`.
     - T02 (squash message): «во-первых это ж устарело? во-вторых, не надо позиционировать это как "была проблема, вот решили". это новая фича не для решения какой-то проблемы» → squash proposal rewritten as a new feature (a98c18ed, comment edited), PR retitled `feat(unsquatted): name variations from a small model in the browser`.
     - T03 (`IDEAS_ASKED = 2 * IDEAS_SHOWN`): «не, пусть будут равны, 6 долговато генерится, экономия в 2 раза будет заметна. ну а если будет меньше или не будет -- что ж, ideating overlord отдыхает значит» → e286ce7a: ask 3, examples cut to three names each, `MAX_NEW_TOKENS` 60 → 30.
     - T04: «module-level let ничем не чреват, мемори-ликами там какими-нибудь или ещё чем?» → answered on GitHub, no code: one model per tab by design, `??=` + reset-on-failure + `dispose()` in `clear`; only dev HMR can orphan a model's GPU memory.
     - Replied on all four threads; `/polish` in a subagent: f958dab2 (`/dry`), 2ca4398e (`/tend-prose`); its `/five-percent` ran out of context and posted nothing. PR body refreshed for the Qwen flow (13-item QA checklist). Asked two questions: extract the thrice-written self-clearing cached promise (recommended: keep), and whether to publish to preview for the `evicted` walk. (verbatim in Last agent turn)

## Intent

Variations on unsquatted from Qwen3.5-0.8B in the visitor's browser (WebGPU), desktop only, triggered by the lightbulb among the field's buttons, its ring showing load and then generation. The operator is walking it on a real GPU (Chrome, Arc) via the preview and answering on the PR. The feature is framed as new, never as a fix for a problem (T02).

## Decisions

- **Eviction**: the opt-in stands when the weights are evicted. `present` in `useIdeas` is `boolean | undefined` (unknown / missing / there); `evicted = agreed && present === false`; `brainstorm` calls `turnOn` when evicted, so the press re-downloads at once and then generates for the pressed label. `IdeasOffer` keeps which dialog is open (`'offer' | 'evicted'`) so the notice stays until OK even after the download finishes. Beat the five-percent proposal's re-shown grey offer line (operator rejected it).
- **Copy**: `ideas.evicted` and `ideas.ok` in `checker/config/messages/en.json`; the evicted dialog shows `copy.loading`'s percentage, not the opt-in's long `downloading` text (which mentions Stop).
- **Three asked, three shown** (`IDEAS_SHOWN` alone); fewer after the parser's cuts is accepted, the shrug covers none.
- **The `/five-percent` candidate the polish subagent drafted** (let Android with `deviceMemory >= 8` see the bulb) was not posted: it goes against the desktop-only intent.

## Errors and dead ends

- The session-start hook installed `main`'s dependencies; this branch needs `pnpm install --frozen-lockfile` before lint/tsc, or `@huggingface/transformers` and `@webgpu/types` read as unresolved (≈54 spurious ESLint errors).
- Writing reply files with `cat >` is blocked by a hook; use `Write`, then `gh api …/replies -F body=@<file>`.

## State

- Branch `claude/in-browser-llms-unsquatted-24jeaq`, base `main`, draft PR https://github.com/vzakharov/vovazakharov.com/pull/247, `mergeStateStatus` **DIRTY** (main advanced with #248 share popover; not merged in, per the loop — `/finalize` or `/sync-branch` does that). Last pushed commit 6c5717b7, then this relay's commit.
- Plan `docs/plans/qwen-everywhere-unsquatted.paused.md`, Left list current: 0 push protection on deploy, 2 real-browser walk, 2a five pre-existing `pnpm type-overlap` groups, 3 prompt retune, 4 `/five-percent` over this review's changes (floor still 7cd1ac34).
- Unanswered-by-the-operator replies: all four threads carry an agent tail now.
- Not on preview: the last preview run published f8d6bd76; e286ce7a onwards is unpublished.
- Estimate: this session 1.5 h senior developer (re-download on eviction threads a third state through a hook, its button and its dialog) + 0.5 h senior editor (squash record re-cut to a feature's three paragraphs). Remainder handed on: 0.5 h senior prompter (retune after real WebGPU output), 1.5 h middle qa (each desktop browser by hand on a real GPU, the `evicted` walk included), 0.5 h middle developer (the type-overlap groups and the base merge).

## Pointers

- `src/unsquatted/pages/home/ideas/offer/lib/use-ideas.ts` — `present`, `evicted`, `turnOn`, `brainstorm`.
- `src/unsquatted/pages/home/ideas/offer/ui/ideas-offer.tsx` (dialog mode), `ideas-modal.tsx` (evicted variant, `withPercent`).
- `src/unsquatted/pages/home/ideas/brainstorm/lib/prompt.ts`, `engine.ts` (`MAX_NEW_TOKENS`, module-level `loaded`).
- `docs/remove-before-merging/in-browser-llms-unsquatted-24jeaq/squash-message.md` — the squash proposal's source.
- `docs/pr/247/pr.md` — the export this session committed; re-take with `python3 scripts/export-github-item.py 247`.
- Transcripts: this session https://claude.ai/code/session_01DaohkC7xCgLHrKbBUPMB5E; relay 7's https://claude.ai/code/session_01DaohkFrRuoQzcYJnfCCfeo.

## Next step

Wait for the operator. Pending from the last turn: (1) whether to extract the self-clearing cached promise written three times in `local-model.ts`/`engine.ts` (recommended: keep); (2) whether to publish the branch to preview for the `evicted` walk. Still open after that: `/five-percent` over this review's changes, the DIRTY merge state and the type-overlap groups (both `/finalize`'s), the real-GPU walk.

## Last agent turn

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Обновляю описание PR под то, что ветка реально делает (Qwen, лампочка, кольцо).

Вова, ветка дочищена и запушена, а описание PR [#247](https://github.com/vzakharov/vovazakharov.com/pull/247) переписано под Qwen: лампочка, кольцо, повторная загрузка после очистки кеша. Чеклист тоже новый, 13 пунктов.

`/polish` сделал два коммита:
- f958dab2: проценты загрузки теперь считает одна функция, три ряда кнопок модалки собраны в один, а три одинаковые проверки «имя не пустое» в `name-checker.tsx` — в одну.
- 2ca4398e: подрезаны комментарии. Один был неверный: в `use-ideas.ts` он говорил, что `startModel()` грузит модель, хотя этот вызов нужен, чтобы в замер времени генерации не попала загрузка.

Его третий проход, `/five-percent`, не доработал: субагенту не хватило контекста, и ревью на PR не появилось. Единственное, что он успел придумать, — показывать лампочку и на Android с памятью ≥ 8 ГБ. Это идёт против «только десктоп» в плане, так что я бы это не постил. Значит, по правкам из этого ревью `/five-percent` фактически не прошёл; пометил это в плане, и `/finalize` прогонит его заново.

Два вопроса, работу они не держат:
1. Обещание, которое при ошибке сбрасывает само себя, написано руками трижды: `engine` и `loading` в `local-model.ts`, `loaded` в `engine.ts`. Общий хелпер упрётся в сбросы в `forgetModel` и `clear`, поэтому советую оставить как есть. Или вынести?
2. Повторную загрузку после очистки кеша на настоящей видеокарте никто не прогонял. В чеклисте это пункт `evicted`: удалить веса в DevTools → Application → Cache Storage, перезагрузить страницу и нажать лампочку. Выложить ветку на превью, чтобы ты это потыкал?

`pnpm type-overlap` всё ещё падает на пяти старых группах из пункта 2a плана, и на них остановится `/finalize`.
```
