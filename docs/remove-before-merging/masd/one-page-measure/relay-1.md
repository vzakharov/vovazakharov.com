# Relay 1 — bite 6a of MASD, from a spent measure to modularity

The elephant is MASD (PR #169, branch `claude/multi-app-sliced-design-7bn3oq`); this branch, `masd/one-page-measure`, is bite 6a, PR #216, based on the elephant. The elephant's own relay chain lives in `docs/remove-before-merging/multi-app-sliced-design-7bn3oq/`; this is the bite's first.

## Standing constraints

None stated in this session.

## The conversation

1. **Operator:** `/from-branch claude/multi-app-sliced-design-7bn3oq`, then mid-turn: «давай мерджить текущий слайс, потом синкать с мейном, потом брать следующий»
   **Agent:** Did all three:
   - Landed bite 5c, #214 (`masd/music-pages`), into the elephant after merging the elephant's one new commit into it and a green vet; the squash is 4410930.
   - Synced the elephant with `main` (#213 WIP albums last, #215 one audio element on iOS). There were seven conflicts, resolved in efc806b: #213's split went onto `pages/artist` and `pages/music`, `wip.heading` into `src/music/shared/i18n/messages`, and `wipApart` joined the catalogue barrel; `fetching-deck.ts` went beside `decks.ts` in `features/player/model`. Vet was green on the merged head.
   - Took bite 6 cut in half: 6a is the measure, 6b the game's restructure. A spike showed boundary-vs-internal edge cohesion cannot tell a module from a grab bag, while public-API width can. Built "a one-reference slice is significant when its barrels hand on at most a third of the names its files export" into `scripts/masd-check.ts`, with tests and a `masd.md` line, and moved `PUBLIC_API` into `eslint/masd-graph.ts`. Polished, then opened draft #216 with a squash proposal.
2. **Operator:** «чё-т я не уверен.. когда вся вот эта эвристика начинается, начинаются вопросы типа "а почему треть, а не четверть, или не половина"? итп / прежде чем бросаться с головой в это, давай посмотрим, что у нас получится по разделениям чисто в виде дерева, одной простынёй, без переноса кода»
   **Agent:** Produced a dry-run slice tree of the game, every file assigned and nothing moved; four iterations took the broken edges from 200 to 13. The tree:
   - `shared/lib`, `shared/world` (ground, eye, weather, dusk), `shared/ui`;
   - `entities/mushroom` (house, mouse, worm), `insect` (pollen), `flower`, `firefly`;
   - `features/meadow` (game, sprouting, saves, `api/`);
   - the page, holding the scene's ~120 files, which the graph shows as one interwoven piece.

   The entities have two consumers each; the meadow model and the page each have one, so the count cascades everything back into one slice. Proposed exempting an app with one page instead of a number.

3. **Operator:** «а типа карта-виджет?»
   **Agent:** The map works as `widgets/map` once nine helpers it takes from the scene move down (a dusk constant, `iconLighting`, `drawMoon`, `DoorSeating`, `flowersOf`/`Stand`, and the ground's `brow`/`lawn`/`mottles` look), but it too has one consumer.
4. **Operator:** «а можно ли "треть" формализовать как-то, чтобы это была не "треть", а какое-то вычисляемое значение?»
   **Agent:** Newman's modularity. A slice's own term `e_ii − a_i²` > 0 means more imports inside it than a degree-preserving random rewiring would put there, with no tuned number. It was measured on the dry-run tree with the map as a widget and a control slice of ten random scene files:

   | slice              | multiple of chance |
   | ------------------ | ------------------ |
   | map                | ×12                |
   | meadow             | ×8                 |
   | flower             | ×7.6               |
   | insect             | ×5                 |
   | mushroom           | ×4.5               |
   | junk               | ×1.0               |
   | firefly (one file) | 0                  |

   Whether merging a slice into its consumer raises Q does not reject the junk (×0.96 against the huge page), so the slice's own term is the test.

5. **Operator:** «ну вот тут была ещё такая идея, что если весь апп = одна страница, то тогда может быть она и должна жить на уровне аппа? … НО тогда возникает эдж-кейс типа, а что если у нас аппа -- ДВЕ страницы? тогда все мытарства по-новой? ¯\_(ツ)\_/¯»
   **Agent:** `check:masd` already spares a slice whose one reference is the app layer. With two pages, the count works where they share, and a page needing its own slicing becomes an app of its own. Recommended this structural route and closing #216.
6. **Operator:** «/plainly расскажи мне что это такое» (Newman's modularity)
   **Agent:** A plain explanation: `a²` is the chance an edge lands both ends in a group, shown on a six-file toy graph.
7. **Operator:** «но это не решит вопрос с импортами не в страницу (или аппу), а между сущностями и фичами -- точно так же придётся (например) все грибы совать в фичу "грибы", потому что иначе сущность гриб будет insignificant. зло это или добро, правда, ещё надо понять»
   **Agent:** Merging a one-consumer slice into its consumer is good when the slice has no boundary of its own, and evil when it is a module, because the public-API enforcement inside it is lost. The count cannot tell the two apart; modularity can. Proposed the page-in-app now and modularity later.
8. **Operator:** «ну так ты же сверху красивую табличку нарисовал, из которой следует что уже многое выглядит / вообще идея "умного" определния "что модуль а что нет" мне нравится, в рамках MASD или вне её» (with a screenshot of that table)
   **Agent:** Decided modularity replaces the third, wrote it into the plan as `## Rest of the bite`, and began a relay. Mid-turn the operator sent three messages:
   - «подозреваю что в FSD её не сделали потому что "слишком сложно" (или просто "не догадались"), но это же было всё до агентов; человеку совать туда-сюда модуля и считать модулярность это адская мука, а агенту -- наслаждение (да ведь?:-D»
   - «не, давай без свежей пока»
   - «надо довести до понимания, а в свежей уже начинать»

   The agent re-paused the plan, built nothing, agreed on the joke (the count is what a human checks by eye; modularity is three lines over a graph `check:masd` already builds), and put three questions: rescue or replace the count; which graph; page in `app` or not.

9. **Operator:** «1 / > Если заменить подсчёт целиком, однофайловый слайс всегда «не модуль»… / два потребителя = по определению нужно "поднимать" (или "опускать", всё время путаюсь с направлениями слоёв) / 2 -- пусть следующая сессия посчитает так и так, приценится, там и решим / 3 -- пока не трогаем»
   **Agent:** Recorded all three in the plan (9000d0acf). Shared blocks drop to a lower layer.
10. **Operator:** «подсчитает два варианта, потом поставит на паузу, да?»
    **Agent:** Yes, and made it explicit in the plan (4587018f4). (verbatim in Last agent turn)
11. **Operator:** «давай» — this relay.

## Intent

The operator wants MASD's significance rule to tell a module from a grab bag by computation, with no tuned number, within MASD or outside it. They want each decision understood before code is written, which is why the graph question is measured first and put to them.

## Decisions

- **Modularity rescues, it does not replace the count.**
  - **Rejected alternative:** replacing the count entirely, which would flag every one-file slice, since a single file has no internal edges.
  - **The rule:** a slice with two consumers or more is significant by definition, because a block two slices share drops to a lower layer. A slice with one consumer passes when `e_ii > a_i²`. A slice with none is flagged.
- **The API-width third is dropped.** It beat edge cohesion in the first spike, but the operator rejected any tuned number («а почему треть, а не четверть»). The code on the branch still carries it, until the rest of the bite replaces it.
- **"Dry-run tree"** is the game's files assigned to slices on paper, nothing moved: `mushrooms-tree.md` in this directory.
- **The page's placement is out of the bite** («пока не трогаем»). The page stays in `pages/mushrooms`, and moving it to `app` is neither done nor ruled out.

## Errors and dead ends

- **API width ≤ ⅓:** built, tested and polished, then rejected as an arbitrary number.
- **Edge cohesion:** a well-layered slice imports downward, so its edges leave it. It scored real modules 20–48%.
- **The merge-gain sign** (merge a slice into its consumer when that raises Q): it does not reject a random slice next to a huge page.
- **Cutting the scene into widgets** (flower bed, mushroom bed, insects, sky): about a hundred sideways edges, so the scene stays one piece.
- **A bare `git pull` in this container fetches every ref and can hang past two minutes.** Fetch the named branch instead.

## State

- **Branch:** `masd/one-page-measure`, pushed. The head is this summary's commit; before it was 4f9574fc5 (a cost row) on top of 4587018f4.
- **PR:** #216, draft, base `claude/multi-app-sliced-design-7bn3oq`. Its title, body and squash proposal (`squash-message.md` here) still describe the API-width third and follow whatever replaces it.
- **Plan:** `docs/plans/multi-app-sliced-design.paused.md`. `## Rest of the bite` is the contract; `## Rest of the elephant`'s 6b carries the tree.
- **`compare/fsd-vs-masd`:** carries `masd.md` as of the width rule (c2fc98a41); it follows the next `masd.md` edit.
- **Elephant:** synced with `main` at efc806b, vet green.
- **Estimate:**
  - this session: 0.5 h senior developer (the landing and the sync) and 2 h senior architect (the measure's design and the tree);
  - handed on: about 1.5 h senior developer, for measuring the two graphs, then rewriting `check:masd` with its tests, rule line and PR.

## Pointers

- `docs/remove-before-merging/masd/one-page-measure/mushrooms-tree.md`: the dry-run tree, with each slice's file list (`m:` is `model/`, `s:` is `ui/scene/`) and the 13 broken edges.
- **The spike scripts lived in the scratchpad and are gone.** Rebuilding them:
  - Use `ts.preProcessFile` per file in `src/mushrooms/pages/mushrooms`, resolving `@/` and relative specifiers to files, tests left out.
  - Assign files to slices with a regex map, the tree file's lists being the source.
  - Each import is one edge; `e_ii` is edges inside / all edges; `a_i` is edge ends on the slice / (2 × edges).
  - The control "junk" slice was the scene files `grain tending rain-drops picker insect-sink spore-sight far-band window-glow gait-spot bake-picture`.
- `scripts/masd-check.ts`: `narrowApi`, `exportedNames`, `sourceFile`, `isExported` and `NARROW_API` are the code to replace; `locate`, `resolveImport` and the reference walk stay.
- `scripts/masd-check.test.ts`: the `describe('a slice with one reference and a narrow public API')` block is the one to rewrite.
- Open from the elephant's relay-13: whether to widen `.claude/rules/i18n.md`'s `paths:` to `src/*/shared/i18n/**`.
- This session: https://claude.ai/code/session_01HbwDMNsRgD8RbxTKqsBhnm

## Next step

`go`: the plan's `## Rest of the bite`. First count modularity both ways: over the slice's own app alone, and over its app with its descendants. Run both on the game's dry-run tree and on the repo's real slices. Show the operator where the verdicts differ and what each costs in code, then pause with that question, nothing built (the operator: «пусть следующая сессия посчитает так и так, приценится, там и решим»; «подсчитает два варианта, потом поставит на паузу, да?» — yes).

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages,
usually unneeded but harmless; the reply proper is usually its last
paragraphs.

```text
Да. Посчитает оба варианта и встанет на паузу с вопросом, какой строить: дальше без твоего выбора работа не идёт. В плане это было только подразумеваемо, дописываю явно.

Да, так и будет. Свежая сессия посчитает оба варианта графа на дереве игры и на настоящих слайсах репо. Потом покажет, где вердикты расходятся и сколько кода стоит каждый вариант, и встанет на паузу с вопросом, ничего не построив. Строить будет сессия, у которой уже есть твой выбор.

Раньше это в плане только подразумевалось, теперь записано явно (4587018f4). Скажи «давай», и я передам работу через `/relay`.
```
