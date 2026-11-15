# Relay 2 — portals in the cube, carte-blanche lead

## Standing constraints

- «в мейн не мерджишь, превью более чем достаточно»
- «не передавай! никаких релеев, есть автокомпакт» — this park is the keepalive's last wake on an idle session, not a relay the lead chose.
- «ты делаешь, что хочешь, создаёшь каких хочешь подагентов и подсессии, они НЕ создают свои пиары, но полируют свои ветки, потом ты их забираешь»
- «здесь и дальше архивируй сессии которые больше не нужны»
- PR #283 stays a draft; /finalize only when asked. Boards are English only. Children write in English and never open PRs. Never resolve or re-open GitHub review threads; leave artifact threads for people. Don't re-offer the muthur sync. Reply in Russian, informal «ты», address him as «Вова».
- A child's model is chosen for its package: fix-ups run on Opus, not Fable — «почему та сессия на фейбле?», «сожрём шща весь лимит» (now in `.claude/skills/carte-blanche/SKILL.md`).

## The conversation

The run began in earlier sessions (relay-1.md, and this session's own pre-compaction transcript; see Pointers). After compaction this session:

- (resumed) Merged package B's final head a8549f95 (A4 sign "SOME DOORS ARE / MORE EQUAL / THAN OTHERS", no arrow; FOR SALE moved off the portal wall; reference model renamed `.js.txt`), regenerated the board's door/sign webps, added a sign close-up, board v116; preview slot 2; vet run started; asked B for a live walk on the real hub. Told Вова all that.
- B walked the real hub live (6 → 10, URL pushed, Back returned), archived. vet failed on an uncommitted cost row, then ran.
- **Вова:** «какой мне нужн урл чтобы встать у этой двери на 6м этаже? 🙈» → Computed an address from `firstPortal` + `encodeAddress` (carried from floor 1, `hatch: null, fell: 1`): https://preview2.vovazakharov.com/cube#hgHCKitJPJqM2vpUWw — floor 6, room (13,9), facing the hub's south wall; checked headless ("Floor 6", "Press E to open the door").
- **Вова** (two screenshots): «крутяк, только створки изнутри и снаружи раскрыты в разные стороны» + mid-turn «плюс есть небольшое подтормаживание/мигание при проходе. это может быть конечно и не-баг-а-фичей, но всё ж глянуть можно» → Cause: each wall rolls its own hinge and paint (`doorLook`). Decided a hinge rule; quoted into the plan; started package D (Fable, by inertia). vet at that point red: format, type-overlap, knip.
- **Вова:** a screen recording → frame analysis showed ~0.65 s held frame then floor 8.
- **Вова:** «а оно даже не заснялось нормально. ща попробую ещё» → handed type-overlap/knip to D, fixed the board yaml format myself.
- **Вова:** second recording + still, «вот, и видео и конкретный кадр» → one game frame at the threshold, still floor 6, doorway black with a sliver of floor 7 out of place; frames committed (`docs/remove-before-merging/frames/cube-portal-threshold-glitch-*.jpg`), sent to D.
- **Вова:** «его и в первый раз не было, сама запись видимо глючнула» → no freeze to fix; freeze hunt dropped.
- **Вова:** «это мы когда решили? получается, портал можно будет распознать по цвету?» → Admitted the lead decided one shared portal paint alone; switched to paint by family (hub keeps its own rolled paint, spokes take their hub's), so portals don't stand out.
- **Вова:** «почему та сессия на фейбле?» / «сожрём шща весь лимит» / «попроси закруглиться и/или открыть новую» → Interrupted D, asked it to wrap up, recorded the model lesson in the skill. D reported (hinge done with tests; dropout cause found: mask quad on the wall line clipped by the near plane 0.004; one shared paint, stale), archived. Started E on Opus on the same branch.
- E reported (51841919): dropout fixed (mask `DOORWAY_DEEP` past the line), `familyOf` paint, gates, frames; archived. Merged (fast-forward), 297 tests. vet red only on line-limit: E's move of the meadow's `Timed` to kernel `Clocked` grew `src/mushrooms/pages/mushrooms/model/game.ts` past its frozen 427. The lead reverted the clock move in mushrooms and renamed the portal view's `now` to `epochMs` (2d598133); estimates for D/E sessions recorded; vet green. Board v117 (leaf pair + threshold), committed cc2883fd. Reported to Вова (verbatim in Last agent turn).

## Intent

Portals in the cube per the board's decided row: hub-and-spoke fair network, one-minute period, no lift — an ordinary door that shows the far floor at this room's scale, the far floor's surfaces in the near floor's air and lens, crossing swaps air and lens. A first-portal tutorial sign. Вова steers sporadically; the preview is the deliverable, never main.

## Decisions

- Air is everything a floor looks through, its lens included; Вова: «посмотреть на глючный этаж обычными глазами, а потом "вглючиться" в него -- то что надо».
- Hinge: a portal's leaf hangs on the jamb at the left of one walking east or south; `farSideOf` keeps `toward`, so every pairing agrees.
- Paint by family (`familyOf` in world/model/portals.ts). Beat: one paint for all portals — gives portals away by colour.
- Threshold: the far view's doorway mask lies `DOORWAY_DEEP` past the wall line. Beat: leaving it on the line, clipped by the near plane for a frame.
- The portal view's instant is `epochMs` (the shared epoch), distinct from the meadow's insect clock `now`. Beat: E's shared kernel `Clocked`, which broke mushrooms' frozen line count.
- Crossing cost measured by D and left alone: arrival mesh built on the crossing frame (~56 ms), floors far−2..far compiled cold on first arrival.
- A post-crossing lock is on the board (`p-go-lock`) as "to think about, not now".

## Errors and dead ends

- The first recording's 0.65 s stall was the recorder, not the game.
- D was started on Fable; Вова stopped it over the usage limit. Lesson in the skill.
- A preview was dispatched before a push and built the old head; caught by checking `headSha`, redispatched.

## State

- Branch `claude/cube-board-portal-forks-ilv09n`, PR https://github.com/vzakharov/vovazakharov.com/pull/283 open, draft. Last pushed before this park: cc2883fd. vet green at the estimates commit (all checks passed). Preview slot 2 (https://preview2.vovazakharov.com) serves 51841919 — every visible change; later commits are a type rename, docs and the board.
- Plan: `docs/plans/cube-portals.paused.md` (renamed from `.in-progress.md` by this park).
- Board: https://claude.ai/artifact/WbvwDqVtJzN8EBeuUffho3 v117.
- No child sessions running; A, B, C, D, E all archived. Child branches `claude/cube-portals-{model,door,sign,polish}` all merged.
- Pending for /finalize: the meadow's half-hour suite (`VET_MEADOW=1`), since E changed mushrooms type imports (`Turned` moved to kernel typings).

### Watches

https://claude.ai/artifact/WbvwDqVtJzN8EBeuUffho3
https://claude.ai/artifact/Gf2FbMjCKfXwD8jHSgw8nw
https://claude.ai/artifact/B4xj4PY3mCEPYhZx1p3tCW

## Pointers

- `docs/plans/cube-portals.paused.md` — the lead's memory: rules, answers, decisions, team, state.
- `.claude/skills/carte-blanche/SKILL.md` — the run's mode, with this session's model lesson.
- `src/cube/entities/world/model/{portals,portal-counts,portal,door,hint}.ts` — the network, the far side, the leaf, the sign.
- `src/cube/pages/cube/ui/{portal-view,portal-pass,cube-scene,walk}.ts`, `src/cube/pages/cube/lib/portal-frame.ts` — far view and crossing.
- `src/cube-board/app/config/cube/{portals,portal-views,portal-door}.yaml` — board rows; board pipeline: ArtifactData list → `pnpm -s board sync … tmp/board-rows/items` → `check:board-language` → `board build` → Artifact publish with a `files` map for new images.
- `docs/remove-before-merging/frames/cube-portal-*` — frames; `pnpm portal:cube` shoots them.
- The address before floor 6's hub: `#hgHCKitJPJqM2vpUWw`.
- This session's transcript: https://claude.ai/code/session_01DaohkBxB5aodsuLB2dftcE

## Next step

Wait for Вова. Nothing he asked is pending; his last ask (the two door defects) is fixed and on the preview. When he next steers, quote it into the plan, flip it back to `.in-progress.md`, and route the code to a child on a model fit for the package.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Vet зелёный. Обновляю доску новыми кадрами двери.

Same versions as before, nothing new. Publishing:

Вова, обе вещи, которые ты нашёл в двери, исправлены, и это уже на превью: https://preview2.vovazakharov.com/cube#hgHCKitJPJqM2vpUWw. Ссылка та же: стоишь перед дверью на шестом этаже. Полная проверка (vet) прошла.

- **Створки.** Теперь это одна створка, если смотреть с обеих сторон. С шестого она висит слева и открыта от тебя, после прохода с седьмого — справа и открыта к тебе. Цвет у всех портальных дверей не общий, а свой для каждой семьи (хаб и двери, куда он ведёт). Поэтому портал по цвету не узнать.
- **Порог.** Чёрного кадра больше нет. Картинку того этажа сдвинули чуть дальше середины стены. Теперь ты пересекаешь линию перехода раньше, чем ближняя граница камеры дойдёт до картинки, и она не обрезается.

По ходу пришлось откатить одну правку E. Он вынес общий тип часов из игры с грибами, и от этого её файл вылез за лимит строк. У портала и у грибов часы разные, поэтому я переименовал поле в коде портала, а грибы вернул как было.

На доске (v117) три новых кадра:
- та же створка за шаг до порога;
- она же за шаг после, если оглянуться;
- кадр изнутри проёма за миллиметр до перехода, где раньше было чёрное.

Ссылка: https://claude.ai/artifact/WbvwDqVtJzN8EBeuUffho3

Сессии D и E заархивированы. PR #283 остаётся черновиком. Когда будешь финализировать, надо будет ещё прогнать долгий получасовой набор тестов игры с грибами: E всё-таки поменял там один импорт.

Хук сам вернул строку расходов к версии из последнего коммита. Больше ничего не закоммиченным не осталось.
```
