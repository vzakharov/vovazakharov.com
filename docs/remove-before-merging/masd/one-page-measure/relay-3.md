# Relay 3 — 6b's dry-run cut built and rejected, parked on the re-cut by nouns

The elephant is MASD (PR #169, branch `claude/multi-app-sliced-design-7bn3oq`); this branch, `masd/one-page-measure`, is PR #216, based on the elephant, carrying bite 6a (significance by modularity) and bite 6b (the mushroom game split into slices). `relay-2.md` beside this file is the previous relay.

## Standing constraints

- «не надо гонять игру на каждом пуке … по крайней мере не делать это до финалайза» — no `play:mushrooms` (nor other runs of the game) before `/finalize`.
- «давай только не городи поверх исправлять, а остановись, подумай, скажи мне что думаешь, и вместе решим» — on the layout, propose and decide together; do not build fixes on top unasked.

## The conversation

1. **Operator:** `/relay take masd/one-page-measure — разложить игру с грибами по слайсам (6b), спросив про 27 тестов, что смотрят на слой выше`
   **Agent:** Attached, resumed the plan, put the 27-tests question (recommended: move them up beside the page; alternative: fixtures moved down) and the two unreviewed layout calls (the map stays in the page; the overrides). Meanwhile built the move:
   - renamed three exports a barrel would hold twice (4763c65);
   - wrote a move script and moved 179 files with two barrels per Phaser-mixed slice (e7a4c9a);
   - knip, typecheck, `check:masd`, Steiger (bar the 27 tests), vova's build and all 2273 meadow tests went green.

   A `play:mushrooms` run on phoneS complained three times. A baseline run at the pre-move commit was started to tell whether the complaints were new, and stopped on the operator's next message.

2. **Operator:** «что-то я не уверен, что мне нравится сейчас разбиение, пример который сразу бросился в глаза: червяк -- внутри entity "гриб", при этом в pages/mushroom/ui/scene есть src/mushrooms/pages/mushrooms/ui/scene/house-worm.ts, а между ними -- "meadow", которое как название фичи звучит непонятно. казалось бы, логично: сущности "гриб" (чистый, без червяков) и "червяк", фича "червяк в грибе", дальше -- widget meadow, и страница. Т.е. слойность позволяет, и так звучит, по крайней мере на нативных слух, более логично. сколько ещё таких примеров -- не знаю. и ещё, не надо гонять игру на каждом пуке. Я вообще подумываю о том чтобы значительно порезать все эти прогоны -- они были важны пока игру строили, а сейчас что они проверят? и являются ли они необходимым набором, чтобы проверять? не знаю. но по крайней мере не делять это до финалайза.» and, mid-turn, «давай только не городи поверх исправлять, а остановись, подумай, скажи мне что думаешь, и вместе решим»
   **Agent:** Stopped the baseline run, edited nothing, and named the cause. The dry-run tree followed the import graph, which reproduces how the code is stitched (`draw-house` paints mice and the worm; `worm.ts` imports `house.ts`), not the nouns. Listed the like cases:
   - `entities/mushroom` holds four nouns;
   - `firefly` and `flower-genes` sit in `shared/world`;
   - `entities/insect` holds its encounters (pollen, shelter, perching);
   - `features/meadow` is the game state plus keeping;
   - the page is the whole scene.

   Proposed entities, features for the encounters, `widgets/meadow` for the scene, then the page. Asked about the house, the revert, and writing the tree first.

3. **Operator:** «> Светлячок попал туда, потому что одиночный слайс из одного файла забраковала бы проверка / ну значит нужно было его совать прямо туда где его используют, в страницу или где -- а иначе что это за лайфхак такой, совать в shared лишь бы штайгер не ругался? по entities и необходимости одним знать про другие думаю, есть идея сделать supserset слайсов FSD в виде "подсущностей" или "надсущностей" (т.е. какие-то сущности считаем базовыми, они друг друга не импортят, потом другие сущности слайсом выше могут их сочетать) -- но до тех пор пока можно обходиться более-менее осмысленной группировкой в фичах ("цветок вырастает, когда нажимаем на травку" = фича), попробовать делать так. рассмотри свои вопросы в контексте этого пояснения, перезадай что осталось»
   **Agent:** Accepted the shared rule (`firefly`, `flower-genes`, `shelter-seats` leave `shared`) and re-asked three questions, each with a recommendation. Proposed, without asking, the order: revert e7a4c9a, write the target tree file, untie in place, then move. (verbatim in Last agent turn)

The session was then parked by the cache keepalive, with no operator answer yet.

## Intent

MASD's significance rule judged on a real restructure of the game. The operator wants the cut to read right to a native ear — slices named for nouns and for what happens — more than to follow the code's current stitching. They are wary of hacks that satisfy a checker and of heavy runs that no longer earn their time.

## Decisions

- **Base entities never import one another; where two meet is a feature named for what happens.** "Super-entities" (entities composing entities a level up) is the operator's idea for later, tried only when feature grouping stops sufficing.
- **Nothing goes into `shared` to quiet a checker.** A file goes where it is used.
- **The dry-run cut (e7a4c9a) is rejected as a domain cut.** Its tooling and its findings carry over:
  - two barrels per Phaser-mixed slice, the importer choosing by whether it reaches Phaser;
  - each barrel holding what is imported through it;
  - the renames.
- **Finding for 6a, recorded in the plan:** modularity tests whether a cut holds; nouns draw it.
- **Play runs wait for `/finalize`.**

## Errors and dead ends

- `shared/lib` past Steiger's 15 modules was first fixed by sending page-only helpers back to the page and `door-tap` to the mushroom. That still stands as a principle, but it was made on the rejected cut.
- A barrel holding "everything" fails knip, which wants each barrel to hold what is imported through it. Steiger counts tests among `shared/lib`'s modules.
- `play:mushrooms` needs `PUPPETEER_EXECUTABLE_PATH=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome` in this container.
  - It takes far over 10 minutes for all screens; one screen with six plays takes about 5.5 minutes.
  - On phoneS, e7a4c9a's run reported "the run from mushroom-1 to mushroom-2 drew no runner", "no tap where bee-1 rests ever reached it" and "the planted flower is not drawn full grown". Whether these predate the move is **unknown**: the baseline run was stopped.
- A git worktree with a symlinked `node_modules` breaks Turbopack. `pnpm install --frozen-lockfile --offline --ignore-scripts` in the worktree works in 4 s.

## State

- **Branch:** `masd/one-page-measure`, pushed, head 5bc0be9.
- **PR:** #216, draft, base `claude/multi-app-sliced-design-7bn3oq`. Its title, body and `squash-message.md` still describe the API-width third and are refreshed once 6b is built.
- **Plan:** `docs/plans/multi-app-sliced-design.paused.md`. `## Eaten so far` holds the rejected cut and the operator's rules; `## Rest of the bite` holds the three questions and the proposed order.
- **Code on the branch:** e7a4c9a's cut is live. The proposed first step reverts it.
- **Estimate:**
  - this session: 3 h senior developer (the cut and its checks);
  - handed on: about 2 h senior architect (the noun tree and the feature boundaries, with the state's flow) and 8 h senior developer (untying the house, worm, mice, flower genes and game state, then the move and checks).
- Nothing running or waiting: no CI, no PR subscription, no check-in.

## Pointers

- `docs/plans/multi-app-sliced-design.paused.md` § "Rest of the bite": the questions and order.
- `layout-tools.md` here: `layout.ts`, `who.ts`, `phaser.ts`, `move.ts`, `merge.ts`, `rename.ts` and `redo.sh`. Copy them into `tmp/modularity/`. `move.ts` assumes the pre-move tree, which a revert of e7a4c9a restores.
- `mushrooms-tree.md` here: the rejected dry-run tree, the start for the noun tree.
- `src/mushrooms/pages/mushrooms/CLAUDE.md`: the meadow tests. They run in about 20 minutes on 4 CPUs, in three chunks under 10 minutes each: the lower layers, then the page's tests in two halves.
- This session: https://claude.ai/code/session_01ECv1nPFhgfj82FFEr7uB7e

## Next step

Wait for the operator's answers to the three questions in the plan's `## Rest of the bite` (the house in the mushroom; one feature per nameable interaction; the meadow's state in `widgets/meadow`) and to the proposed order. Then:

1. revert e7a4c9a;
2. write the target tree for their look;
3. after their look, untie and move.

No game runs before `/finalize`.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages,
usually unneeded but harmless; the reply proper is usually its last
paragraphs.

```text
Принято про светлячка. Он уезжает туда, где его используют, и то же правило касается всего, что я положил в shared ради тишины в проверках. `flower-genes` — это цветок, а `shelter-seats` — это укрытие под шляпкой. Shared остаётся для того, что правда ни о ком: земля, камера, палитра, геометрия.

Твоя рамка: базовые сущности друг о друге не знают, а их встречи живут в фичах с внятными названиями. С ней вопросы сократились до трёх.

**1. Домик — часть гриба?** По твоему правилу это законно: `house.ts` знает только гриб и больше никого. Если домик остаётся в грибе, червяк и мыши становятся базовыми сущностями. Они знают только себя, а окна и двери получают параметрами. Их встреча с грибом — это фичи «червяк выглядывает из окна» и «мыши бегают между дверями». Рекомендую оставить домик в грибе: без жильцов он просто часть того, как гриб выглядит.

**2. Насколько мелко резать фичи?** Твой пример, «цветок вырастает, когда тапаешь по травке», — это одна фича на одно взаимодействие, которое игрок может назвать словами. Кандидаты:
- цветок вырастает от тапа;
- пчела пьёт нектар;
- насекомое садится на цветок;
- насекомое прячется под шляпкой от дождя;
- червяк выглядывает из окна;
- мыши бегают между дверями;
- поляна сохраняется и открывается.

Рекомендую резать так и сливать две фичи в одну только там, где их код по-настоящему общий. Проверять это будет модулярность из 6a: склеенную случайно пару она не пропустит.

**3. Где живёт состояние всей поляны?** Это `game.ts`, сейчас в `features/meadow`. Оно складывает все сущности вместе, значит, живёт выше них. Но фича «цветок вырастает» сейчас импортирует это состояние, а оно импортирует её (`game` ↔ `sprouting`). Фича не может смотреть вверх, на виджет. Значит, каждая фича должна работать со своим куском: списком цветов, грибами, насекомыми. Состояние целиком держит `widgets/meadow` вместе со сценой и раздаёт фичам их куски. Рекомендую так, но это самая крупная развязка во всём плане: меняется то, как ход игры проходит через код.

Порядок работы отдельным вопросом не ставлю, а предлагаю как план. Первый переезд (e7a4c9a) откатываю обычным revert-коммитом. Потом пишу целевое дерево файлом рядом с `mushrooms-tree.md`, ты смотришь. Дальше развязываю код на старом месте, а перекладываю уже по готовому дереву. Если хочешь иначе, скажи.

27 тестов «на слой выше» отложены до дерева. Прогоны игры будут только на финалайзе.
```
