# The cube intro: the operator's brief and answers, verbatim

Moved out of `docs/plans/cube-intro.in-progress.md` to keep that file under the line limit; the plan's § "Steering since" continues from here.

## The brief (the operator's words)

> хочу intro sequence для кубика [...] представь: ты открываешь глаза, немного
> стонешь, приподнимаешься, и понимаешь, что ты на крошечном песчаном
> необитаемом острове. о твои ноги хлещут волны.
>
> ты встаёшь (сначала видишь только море), оборачиваешься, и видишь: в
> нескольких десятках метров от тебя в воздухе висит куб 5х5х5 метров. в
> основном чёрный, но с серыми полосами, которые уменьшаются каждую половину
> оставшейся длины [...] Материалы otherworldly, издают какой-то звук и не
> привычным глазу образом играют в предзакатном солнце, насколько это может
> позволить чёрный/серый цвет.
>
> на верхней полосе -- дверной проём, и в него виднеется какая-то обстановка.
> что совершенно не вяжется со всем этим, к низу этого дверного проёма
> приставлена совершенно обычная приставная лестница.
>
> с этого момента можно ходить, управлять клавишами, пройтись по острову и тп,
> даже поплыть вдаль (пока -- без края). Как только ты приближаешься к кубу, ещё
> одна cut scene: ты наклоняешься, смотришь под куб -- под ним ничего нет, то
> есть он реально висит в воздухе (это нужно чтобы дать понять, что весь наш
> лабиринт действительно находится в одном кубе).
>
> После этого возвращается обычное управление.
>
> когда подходишь к приставной лестнице, ты можешь нажать E, и следующей
> кат-сценой ты забираешься наверх и, через дверной проём, оказываешься в нашей
> самой первой комнате на первом этаже.
>
> там где на скрине дверь, должен быть проём, и внутри не должно быть
> естественного освещения, куб изнутри должен освещаться предзакатным солнцем,
> которое светит ровно в эту щель. Остальное должно остаться, контраст между
> обыденностью внутри и видом куба снаружи. Единственное, не знаю что делать с
> деревом. Его расположение процедурное, поэтому просто "убирать" не хочется.
> Пусть будет, тем комичнее. Солнце должно играть "об него".
>
> Ну а дальше всё как было, с небольшим изменением: давай рычаг заменим на
> таблетку, лежащую на том же уровне на небольшой полочке. Анимация
> "берёшь-несёшь ко рту-звук глотания". Кроме первого раза -- первый раз ты её
> поднимаешь и как бы рукой немного проворачиваешь, разглядывая. При этом
> возникает подсказка: Press Y то drink, N to put down. Если пьёшь -- анимация
> довершается, ты уменьшаешься, дальше как обычно -- руки, взгляд вокруг.
>
> Что касается острова: он должен быть отрисован супер-пупер, прям супер-пупер,
> не отличишь от настоящего. И вода, с прибоем и шумом, и солнце и облака в небе
> -- всё, разумеется, процедурно-детерминированно, как мы любим.
>
> Вдохновляться можно рисунком с борды "острова" [...] через сколько-то итераций
> [...] это всё станет частью одного мира: наш остров посреди океана в том же
> мире, где остров Золтана и Сямы. Если поплывёшь -- через сотни километров
> доплывёшь до берега. А может и взлетишь. Но это потом :)

The three attached pictures are under `tmp/session-images/` (gitignored, die
with the container): the banded rectangle from the "Куб с уменьшалкой" artifact,
floor 1's room with the door, bench, plant and clock, and the island board's
ocean-at-sunset inspiration ("Noniv/web-ocean … Nothing copied").

## The one batch of questions

What was asked (1 lamps on floor 1 off, sun the only light; 2 branch from `main`
or stack on #275; 3 when the intro plays, skipping, the ladder both ways; 4 the
pill everywhere, "first time" per browser, the prompt's language; 5 the machine
and the frame rate; 6 preview slot and a ceiling on spend) and the answers,
verbatim, 2026-11-12:

> карт-бланш -- супер
>
> поясню, кривые руки -- украшать не надо; контраст между ослепительным
> реализмом предазкатного острова и недореализмом остального -- будем считать
> творческим выбором. вопросы:
>
> 1- да; конечно желательно чтобы при этом в комнате было хоть что-то видно
>
> 2- давай так, к слову возможно так будет проще и борду править поверх
>
> 3- урл сменяется на наш стандартный "запоминающий при обновлении страницы хеш"
> (честный, не cheated) при переходе дверного проёма. то есть если обновишь до
> этого -- сцена с начала, если после -- уже сразу внутри.
>
> 4- "первый раз" -- только на самом первом этаже. подсказка и вся игра только
> на английском
>
> 5- окей. пока у меня вся остальная игра где-то на 111 fps. У меня M2 Pro 16 GB
>
> 6- давай на 2, на 1м может быть #275, сообщи той сессии о разделении. потолка
> нет, лимиты остановят 🙂 ориентируйся на 500-1000 долларов по API cost-ам
> (затраты можешь посмотреть по cost ledger-у той сессии). ну или просто
> посмотри сколько было там и сколько нужно тебе чтобы сделать так же хорошо:
> кучи уровней нет, зато есть зверские требования к реализму.
>
> по твоим решениям: солнце наверное лучше всё-таки сзади или сбоку от куба,
> если смотреть на него с места "просыпания", потому что иначе ты сразу видишь
> дверь и лестницу in your face, это не так интересно
>
> > Солнце стоит
>
> ну ок, пусть пока так
>
> > Дерево остаётся
>
> не понял какое дерево, но пусть остаётся :)

How each is read:

1. Lamps off on floor 1, and the room must still be readable: the sun's patch
   lights the rest by bounce, tuned until the bench, the walls and the hole can
   be made out.
2. Read as "stack on #275" («править поверх»): `claude/cube-review-perf` is
   merged into this branch (34f30eac) and merged again as it moves; the PR's
   base is that branch. The reading was told to the operator; reverse it if they
   say so.
3. No `localStorage`, no skip key. The honest address fragment is first written
   when the body crosses the doorway inward; a refresh before that plays the
   intro from the start, after it starts inside. `?cheated_to=` as today.
4. The inspect-and-ask beat happens on floor 1 only, every game; every other
   floor's pill is taken and swallowed at once. English only.
5. The machine is an M2 Pro, 16 GB, where the game runs near 111 fps; the
   outside holds 60 there.
6. Preview slot 2; #275's session is told slot 1 is theirs. Spend to aim for:
   $500–1000 at API rates.

The stylised hands and body stay as they are — the contrast with the island is
the operator's creative choice («кривые руки -- украшать не надо»). "Дерево" was
the operator's own word for the potted plant in floor 1's room.

## Steering on 2026-11-12

Moved from the plan's "Steering since" when it outgrew the file cap; each entry is the operator's words and how the lead read them.

- **2026-11-12 22:32Z, the sun's direction**, with a sketch over floor 1's room
  (`docs/remove-before-merging/cube-intro-j2wt34/frames/operator/sun-direction.webp`):
  two dashed rays from the top of the door running diagonally into the room and
  down to the floor near its middle, a parallelogram of light round the hole.

  > направление света солнца какое-то вот такое, наверное, должно быть

  Read at first as direction and steepness both, and the sun was raised to 17°;
  then, as a comment on the board's note about it (relayed by the board
  session):

  > я тут в основном про направление в двумерной плоскости говорил, 30 градусов
  > я там специально не отсчитывал :)

  So the sketch fixes the beam's direction across the floor and nothing else;
  the elevation went back to 9°.

- **2026-11-12 ~22:34Z, a comment on the board itself** (on the "one ocean"
  card, relayed by the board session): "no Russian in the board whatsoever". The
  board session translates every quote; the lead sends verdicts in whatever
  language they were said.

- **2026-11-12 ~22:50Z, randomness and the goal behind it**:

  > все же исполнители понимают, что всё что касается случайности должно
  > использовать наш `rolled`?

  > цель -- любая вещь, любое явление должно выглядеть абсолютно идентично в
  > один и тот же момент времени для двух игроков на разных машинах в одной
  > точке

  The contract named `src/dice` but not `roll` / `rollWith`; now it does, and
  every build session was told. Sand's pushed shape already rolled. The second
  sentence was the contract's first rule; it now also rules out anything that
  remembers earlier frames (accumulated foam, reprojected clouds, a stepped
  simulation), told to core, sky, sea and sand. Footprints are per-player
  history, so they are out unless the operator asks for them.

- **2026-11-12 ~22:50Z, on the footprints being dropped — a principle**:

  > да, где-то на борду большими буквами: Interactions come at a price. Это и в
  > фигуральном и в буквальном смысле: любое, что меняет состояние мира силами
  > одного игрока (вплоть до "пнуть мячик на полу") -- только покупкой.
  >
  > в более философском смысле, можно вспомнить про всяких
  > исследователей-первооткрывателей, у которых это первая заповедь; про sound
  > of thunder у бредберри, про эффект бабочки итдитп

  Written into `src/cube/CLAUDE.md` with the two rules it stands beside, into
  the contract, and sent to the board session for the board, in English, large.
  What it decides here: no footprints, no wake or ripples from the player's
  body, no sand disturbed; and the lead's reading for the pill — the shelf holds
  a pill for whoever comes next, the one taken being the taker's own. That
  reading was told to the operator in passing.

- **2026-11-12 ~22:55Z, on sea dropping its baked texture — a rule**:

  > это наверное стоило тоже обозначить: никаких текстур. все стены, полы,
  > потолки этажей куба отрисованы процедурно, здесь мы делаем то же

  Read as: nothing drawn is looked up from a stored image, baked or computed —
  no FFT maps, no sky map, no noise texture, no lookup table; the frame's own
  screen-space targets (scene, reflection, bloom, a layer's reduced-resolution
  pass) are what the renderer already has and stay. In `src/cube/CLAUDE.md` and
  the contract; core, sky and sea re-briefed. The reading of screen-space
  targets was told to the operator in passing.

- **2026-11-12 ~22:56Z, a comment on the board's rules zone, on the pill**
  (relayed by the board session):

  > упс, а таблетку ведь мы действительно берём. ну ладно, пока придумаем для
  > этого какой-то философский смысл ("таблетки на самом деле нет, это твоё
  > собственное воображение, представляющее необходимость принять решение как
  > физический, экстернальный объект и таким образом снимающее с себя
  > ответственность"

  So the taking is explained, not changed: the shelf keeps its pill for the next
  player, nothing stores "taken". Passed to pill.

- **2026-11-12 ~22:58Z, on the first frames**:

  > судя по картинкам, катсцены "заглянуть под куб" не надо, и так отчётливо
  > видно что он парит

  The look-under scene is cut; walk was told. The scenes left are waking, the
  climb and the climb back down.

- **2026-11-12 ~23:02Z, the ladder vanishes**:

  > давай лестница исчезает после того как ты забрался. без каких бы то там
  > анимаций, эффектов, звуков. просто поворачиваешься -- и нет. выбраться
  > можно, спрыгнув (и не пострадав), но забраться обратно уже нет. выбраться
  > можно и половинного роста, кстати, если выпьешь таблетку и не спустишься на
  > уровень ниже

  Decided: the ladder and its shadow are drawn until the body first crosses the
  doorway inward and never after; a game that starts inside has none. Stepping
  off the sill drops the body 3.6 m to the sand unhurt, at full or half height;
  no way back in. The climb-down scene is gone. Told to walk, shell, core,
  sound.

- **2026-11-12 ~23:03Z, lettering** (after learning the signs and posters are
  lettered on a canvas because WebGPU draws no text):

  > запишите на доску в todo, чтоб рисовал. так будет интереснее и их "распад"
  > по мере спуска на нижние этажи делать

  A todo on the board, sent to the board session: letters drawn in the shader,
  so their decay down the floors can be a procedure. Not part of this run.

- **~23:08Z, on the board's pill card**: «swallow а не drink наверное» — the
  prompt is "Press Y to swallow, N to put down". Pill is not told yet.
- **~23:10Z, on the price rule's card**, a musing and no decision: «навеяло: мы
  призраки? мы умерли? это "по ту сторону"?»
- **~23:10Z, to the lead**: «лимит кончается; пусть все приостановятся, я сожму
  контекст чтобы завтра продолжить». Every child was told to push `wip:`, report
  one line and wait for the word "resume"; the lead's check-in was deleted.
