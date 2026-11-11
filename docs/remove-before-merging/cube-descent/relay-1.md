# Relay 1 — the cube's Descent stream, parked

Parked by the cache keepalive's last wake, with the stream's work finished and
reported. No operator typed in this session: it was seeded by the lead session
(`session_01DaohkEZGmfg7XD5wRftBnA`) with one `/go` prompt.

## 1. Standing constraints

From the seeding prompt, verbatim:

> This is a one-shot autonomous run: ask the operator nothing, write no plan
> file, open no PR, publish no preview, never touch main.

> committed and pushed to claude/cube-descent only

> keeping `Input.clip` (idclip) working

From `docs/plans/cube-beauty.streams.md` § "Rules for every stream", which the
prompt bound the run to: stay in the stream's directories
(`src/cube/features/player/**`, `src/cube/scripts/play-cube.ts`, and, where
forced, `entities/world/model/{lever,hole}.ts` and the call of `play` in
`pages/cube/ui/cube-canvas.tsx`); everything else is read-only and goes to the
lead as a request; no `Math.random`, `Date.now` or `performance.now`; no lint
suppressions; the only allowed marker is `masd-disable insignificant`; never
run `/finalize`; the lead merges.

`docs/plans/cube-beauty.in-progress.md` is the lead session's claim, not this
one's: it is not renamed or edited from this branch.

## 2. The conversation

**Seed (the lead session, as `/go <task>`):**

> Build the cube's Descent stream on branch claude/cube-descent (cut from
> claude/cube-liminal-332pmv, already checked out as the base): read
> docs/plans/cube-beauty.in-progress.md, then docs/plans/cube-beauty.streams.md
> § "Rules for every stream" and § "Descent", and build exactly that contract —
> the lever shrinks the body where it stands, the first-time look at the hands,
> roaming the floor small, the plain hop into the hole, `handsOf`, the cues —
> keeping `Input.clip` (idclip) working, with tests, every gate in the rules
> green, committed and pushed to claude/cube-descent only. Note the slab now
> has a thickness (`SLAB_THICK`, `CEILING_HEIGHT` in
> src/cube/shared/lib/room-shape.ts): the hole is a short shaft. This is a
> one-shot autonomous run: ask the operator nothing, write no plan file, open
> no PR, publish no preview, never touch main. When done (or when you must
> stop), send one message with mcp**claude-code-remote**send_message to
> session_01DaohkEZGmfg7XD5wRftBnA: your branch and head sha, what is built,
> what is left, and anything you need changed outside your directories. no PR

**Agent:** built the contract, ran every gate, ran `/polish` in a subagent,
sent the one message to the lead, and reported in chat in Russian: what the
body now does, what is left, and what was passed to the lead (verbatim in Last
agent turn).

**Keepalive wake (a hook, not the operator):** asked for `/relay park`; this
file is that park.

## 3. Intent

The operator's words, from the streams file: the lever "just shrinks you",
standing "a little aside from the hatch — so that, if you really want, you can
even run about the upper floor small. And when you walk up to the hatch you
simply jump, with no pulling-up or lowering-down". The first time "you may
look at your hands and around and say wtf; the second, here we go again;
you'll get creative". Ruled out: the old pull-over-the-hole, shrink-and-fall-
through sequence.

## 4. Decisions

- **`Player` is `Posed & { act, lever, sincePull, strode, cues }`**, `act`
  null while standing or walking, whole or small; small is told by
  `pose.scale < 1`, not by a flag. Beat a `small: boolean`: the pose already
  says it, and a refresh resumes whole from the URL either way.
- **Member names were chosen by `pnpm type-overlap`**, which compares names
  repo-wide: `actFor` (not `since`), `shrinkLook` (shared by `Holed` and the
  shrinking act through the base `Looking`), `lever` (not `pulled`, which the
  page's `Frame` declares), and `Glimpse`'s `aside`, `toHands`, `handsUp`.
  Cues discriminate on `cue`, acts on `act`.
- **The pull needs only reach of the lever** (`LEVER_REACH`, unchanged because
  `press.ts` uses it for signs), not a body over the hole. A body that pulls
  while standing on the hole hops in as soon as the look lets it go.
- **Rooted for the whole act**, gaze taken only for the look's span; with no
  look rolled the gaze stays free through the shrink.
- **The look is a property of the holed room**: `looks(seed)(room)`, floor 1
  always `FIRST_LOOK`, deeper rooms rolled through dice. It reaches `play`
  through `Holed.shrinkLook`, so `play` stays pure.
- **Any hole on the floor takes a small body**; it hops when its middle is
  within half a hole plus half its radius of the hole's middle.
- **`DROP` is 0.25 of the upper floor's room side**, not 0.5: the lower
  floor's rooms are half as tall. Gravity 0.8 sides/s², about a second's fall.
- **No air control**: falling, the body only looks.
- **Step cues come from the player** (`strode` against a 0.15-side stride),
  though the Sound stream's contract also has a `pace(walked, moved)`; the
  lead picks one when wiring.
- **Nails** were added so a turned hand reads as a back, both sides being
  `skin`.

## 5. Errors and dead ends

- The first test of the fall assumed a 0.5 drop; `DROP` is 0.25.
- A rolled glance around shorter than 1.4 s whips the head past 0.1 rad a
  frame; the roll is 1.4–2 s.
- `polish` was meant to run in the foreground and ran in the background; its
  report arrived before anything else touched the tree.

## 6. State

- Branch `claude/cube-descent`, cut from `claude/cube-liminal-332pmv` at
  `24b37aec`; pushed head before this file `e782b4b3`. No PR, by instruction.
- No plan file of this session's. `docs/plans/cube-beauty.in-progress.md` and
  `cube-beauty.streams.md` are the lead's.
- Gates at `e782b4b3`, all exit 0: `typecheck`, `lint`, `lint:fsd`,
  `check:masd`, `masd:clusters`, `check:cycles`, `check:poison`,
  `type-overlap`, `format:check`; `pnpm test` 145 pass, 0 fail.
  `pnpm play:cube` shot nine frames with no page error.
- The final message to the lead was delivered. Nothing is running or waiting;
  the keepalive watcher has exited.
- Estimate, unchanged, all of it this session's: 6 h senior
  gameplay-programmer, 2 h senior game-designer, 2 h senior technical-artist.
  No remainder is handed on.

### Watches

None.

## 7. Pointers

- `src/cube/features/player/model/play.ts` — `play`, `Player`, `Cue`, `Act`.
- `…/model/look.ts` — `Look`, `looks`, `glimpse`, `gazeOf`; `…/model/fall.ts`
  — the hop, the shaft, the dip; `…/model/shrink.ts` — the scale curve and the
  lever's swing; `…/model/hands.ts` — `handsOf`.
- `…/model/play.test-kit.ts` — the fixtures every player test shares.
- `src/cube/scripts/play-cube.ts` — the pull's seven shots.
- `src/cube/pages/cube/ui/cube-canvas.tsx` — the three lines changed there.
- Asked of the lead, outside this stream's directories: the stale comment at
  `src/cube/entities/world/model/pose.ts:28`; Vec3 helpers exported from
  `entities/world` so `hands.ts` drops its own.
- `/polish`'s deferred five-percent note: `play-cube`'s hands and around shots
  fire at fixed seconds tied to `FIRST_LOOK`; keying them off `glimpse` would
  need it exported from the slice.
- This session: https://claude.ai/code/session_01DaohkEv5QzP5HRqvoP2WgS

## 8. Next step

Wait for the operator, or for the lead session writing back with fixes. Nothing
is pending.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Все гейты зелёные на отполированной голове; коммичу остаток и отправляю отчёт ведущей сессии.

Вова, спуск собран и запушен в `claude/cube-descent` (голова `e782b4b3`); отчёт ведущей сессии доставлен. PR не открывал, превью не публиковал, main не трогал.

Проверено: все десять гейтов из правил потока зелёные, 145 тестов проходят, `pnpm play:cube` снимает новую последовательность без ошибок страницы.

Что теперь делает тело:

- **Рычаг.** Целое тело в пределах досягаемости рычага дёргает его и за две секунды сжимается вдвое там, где стоит. Ноги на это время прикованы.
- **Взгляд.** На первом этаже взгляд забирается на 5,2 секунды: вниз на руки, руки переворачиваются, потом взгляд по сторонам. Глубже взгляд короче и бросается костями по комнате, часто его нет вовсе.
- **Маленьким по этажу.** Ходит в своём масштабе: вдвое медленнее, вдвое уже, вдвое ниже.
- **Прыжок.** Наступив на край любой дыры, маленькое тело подпрыгивает, падает по шахте и приземляется целым телом этажа ниже, с приседом на полсекунды. Целое тело по дыре просто проходит.
- **`idclip`** работает как раньше.
- **`handsOf`** отдаёт руки квадами (`skin` с ногтями и `fabric`-рукава) в системе комнаты; вне взгляда на руки — пусто.
- **`cues`** — что случилось за кадр: шаг и его сила, рычаг, начало сжатия, прыжок, приземление и его скорость, и моменты для реплики (первое сжатие, очередное, приземление).

Что осталось:

- Руки и сигналы страница пока не рисует и не играет — это проводка ведущей сессии. Поэтому руки я видел только в собственной проекции-наброске, а не в шейдере. Читаются как руки, но большой палец после переворота выглядит грубовато.
- В `play-cube` кадры «руки» и «по сторонам» снимаются по жёстко заданным секундам; при перенастройке взгляда их придётся сдвинуть.

Ведущей сессии передано, что нужно поправить вне моих каталогов:

- Комментарий в `entities/world/model/pose.ts:28` («½ после падения в дыру») устарел: тело теперь половинное от рычага и до приземления.
- Векторная арифметика написана в `hands.ts` заново, потому что `entities/world` её не экспортирует.

Проход `/polish` шёл отдельным агентом и добавил два мелких коммита.
```
