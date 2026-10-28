# Relay 1 — sub-entities / segment order (MASD methodology discussion)

## Standing constraints

- «не надо релеить, пока обсуждаем.» — the operator does not want a relay while
  a discussion is running. (They later approved this particular relay:
  «ладно, давай как закончат передавать новой сессии, будем там допереливать из
  пустого в порожнее:)».) They also said «давай не создавать пока новую сессию»
  once mid-way, then lifted it.
- «но пока пусть уж лежит раз лежит» — the draft plan on the branch stays as is
  until the discussion settles; nothing is implemented.
- The operator frames the work as **designing a methodology** (MASD), not fixing
  this repo: «мы разрабатываем архитектурную методологию. То, что у нас в аппе
  "вот так", это, конечно хорошо, но в рамках нашего обсуждения этой темы мы
  говорим о "вообще", а не о нас. Это не значит что нужно покрыть все-все
  юскейсы, но значит, что мы должны насупать "то самое", которое будет работать
  и структурно, и идиоматически».
- FSD precedent is not a mitigating argument: «оно не смягающее -- именно из-за
  таких обстоятельств мы и пытаемся придумать ~~велосипед~~ что-то новое».
- Don't reason without looking: «типичный Клод: рассуждаю-рассуждаю, а
  посмотреть забыл :)» — check claims in code/sources before stating them;
  «инфа 100%?» was asked twice about unverified claims.

## The conversation

1. **Operator** (`/task`): «Sub-entities — the second item of docs/masd.md §
   "Open directions": a facet several entities share (the occupant is the first)
   as a named kind of slice of its own rather than a file in `shared/world`, the
   name itself still open (the operator: «надо только имя получше подобрать:
   абстракции? зародыши? кирпичики/parts?»). Read that section and
   .claude/rules/masd.md first. The MASD work landed in #169.»
   - **Agent:** routed to plan-and-hand-off; created branch
     `claude/masd-role-slices`, wrote the draft plan (a sliced `roles` layer
     between `entities` and `shared`, moving `occupant.ts` and `seat-reach.ts`),
     opened draft PR #225, posted the squash proposal. Asked 3 questions (name
     roles/parts/facets/traits; layer vs marked slices; occupant+seat vs occupant
     only).
2. **Operator:** «я вобще хотел сначала обсудить, но передающая сессия видимо
   решила сразу дать таску :) метаюсь между roles и traits. roles сразу понятно,
   но достаточно распространённый термин; traits уникален но малопонятен. давай
   представим какие-то ещё, негрибные и даже не игровые ситуации, где возможно
   необходимо такое вынесение. у меня одна есть на уму но не хочу биасить тебя,
   потом скажу. есть ещё вопрос, решает ли два уровня сущностей все возможные
   проблемы с точки зрения графов/топологии (не знаю подходит ли слово); то есть
   не может ли быть такого, что после ролей нам понадобятся подроли, потом ещё,
   потом ещё, и черепахи до самого дна? и альтернативный подход: делать всё
   внутри entities, но задать там "ранги" как мы сделали в приложениях, и любая
   вышестоящая entity может импортить из нижестоящей. ну и самый большой вопрос,
   стоит ли оно того вообще? ведь если мы его вводим, мы его вводим по всему
   MASD-у (иначе cross-app importing непонятно что из себя представляет). короче,
   думаем пока, поспешили малость с планом:) но пока пусть уж лежит раз лежит»
   - **Agent:** non-game examples (commentable/taggable, GitHub GraphQL
     interfaces, purchasable, schedulable, located); roles (DCI) vs traits
     (Rust); layers can't bound depth (longest path), ranks can but lose meaning;
     ranks inside entities: conflicts with FSD sideways ban, `@x` is FSD's
     pairwise answer; worth it modestly — asked for their example.
3. **Operator:** «> Импорт роли из роли будет означать, что роль слишком толстая
   — наоборот же слишком худая? в смысле две худые, если нужно импортить из
   одной в другую или в обе стороны, значит их нужно объединять? например из
   соцсетей: Commentable, Taggable. Но тут мы обнаруживаем что большинство (но
   не все?) вещи у нас одновременно и то и то и (например, для пущей сложности)
   у нас есть какое-то действие (а лучше свойство), которое применимо только для
   того что одновременно и commentable и taggable. И получается, нам нужно либо
   их объединять (и тогда те кто только commentable получают груз из ненужного
   api), либо "совмещать" на уровне фич а не сущностей, а тогда может какие-то
   фичи, которым нужно это что-то новое, тоже должны подниматься -- и так далее.
   мой юс-кейс: схема базы данных в drizzle (например). все таблицы задаются на
   базовом уровне, но для relations между ними нужно знать обе таблицы. Поэтому
   (например в playgramai/playgramapp) пришлось всю эту кухню выносить в shared,
   что тоже -- ну такое. > occupant придётся называть сущностью, хотя это не
   бизнес-существительное — а почему не бизнес? вот это для меня всегда было
   немного obscure. Есть вещи, которые занимают место в поле -- чем себе не
   бизнес?:) > Его собственный выход — @x … — ну, наш выход может быть суперсетом
   этого выхода (или это сабсет?): нужно делать @x, но при этом @x разрешается
   только в направлении рангов. > С кросс-приложенческими импортами слой как раз
   проще всего … — да, но допустим в одном приложении у нас будут roles, а в
   другом что-то другое новое кастомное (если идти по пути что оно "кастомное", а
   не закрепляется на уровне MASD), например wug, вот и возникает вопрос, у нас
   role может импортить из wug или наоборот или ещё как-то»
   - **Agent:** conceded "too thin"; drizzle FKs = natural ranks; occupant as an
     _abstract entity_ mirrors abstract apps; `@x` restricted to rank direction
     is a subset of FSD's; verified Steiger's `forbidden-imports` lets `@x`
     cross-imports pass (`isCrossImportPublicApi`); leaned to ranks.
4. **Operator:** «ну а вот теперь представь что у нас occupant задан в другом
   приложении вообще? например у нас есть другая игра, не грибы, но там тоже есть
   поле, на котором занимают места. и что делать-с?»
   - **Agent:** occupant drops to the common ancestor app (`game`, or a `field`
     app); claimed this needs relaxing "same layer across apps is sideways";
     noted `@x` in an ancestor would name a descendant — proposed a config of
     ranks instead.
5. **Operator:** «> Значит, импорт «сущность потомка → сущность предка» требует
   ослабить это правило, хотя бы для entities. — вот нет, мы изначально исходили
   из "masd -- это композиция, а не наследование" (или как-то так). в сторону,
   про features и widgets -- можешь придумать легитимные примеры "совмещения"?»
   - **Agent:** conceded (composed tree = one tree, ranks apply across it);
     `@x` out; examples: auth gate before like, checkout+coupon, undo,
     share→copy-link; header+user-menu, dashboard cards. Suggested ranks for all
     sliced layers.
6. **Operator:** «не надо релеить, пока обсуждаем. ок, согласен что "для всех
   слайсов". но тогда и решение должно быть единое.»
   - **Agent:** proposed slices as nodes in root `src/masd.json`; asked whether
     "no relay while discussing" should be recorded in their operator entry
     (never answered).
7. **Operator:** «не нравится идея задавать внутреннюю кухню конкретного аппа на
   уровне общего конфига»
   - **Agent:** declaration per slice (a file beside `index.ts`), per app, or
     none (imports as declaration — rejected).
8. **Operator:** «против лишнего файла-то может и не будет, а вот против
   entity-entity импорта будет (если они окажутся в одном аппе)»
   - **Agent:** turn Steiger's `fsd/forbidden-imports` off (boundaries holds it)
     or write a rank-aware Steiger rule; recommended off.
9. **Operator:** «> Это правило и так дублирует boundaries — 100%? > Ранго-
   зависимая копия forbidden-imports через @steiger/toolkit — что это за
   тулкит?»
   - **Agent:** verified by code: Steiger's rule checks only same-layer
     cross-slice (unless `@x`) and upward-layer imports within one app root;
     boundaries covers both plus public API and cross-app, reading
     import/type/export/require/dynamic import alike. Gap: boundaries lints only
     `src/**/*.{ts,tsx}`, Steiger any source extension (none exist now).
     `@steiger/toolkit` is only in devDeps for the plugin's types (knip.ts
     comment, f00deba).
10. **Operator:** «> Дыра закрывается одной строкой … — а до этого -- запретить
    вообще любые другие файлы, чтобы когда введём это не проскользнуло мимо нас.
    > @steiger/toolkit … — ну ок, мне тоже кажется, что на boundaries писать
    > надёжнее что ли как-то, более mature штука. и всё-таки как-то интуитивно
    > решение с рангами внутри слайса мне нравится меньше чем введение
    > дополнительных слайсов, хотя кажется это against all logic. Вроде внутри
    > слайса -- позволяет сколько угодно уровней надстраивать. Но может, в этом и
    > проблема?.. у нас как-то не остаётся "идеологического объяснения", что
    > является чем (как было в случае с role vs entity)»
    - **Agent:** agreed to forbid non-`.ts/.tsx` sources in layers; ranks lack
      meaning, a layer is an answer to "what is it"; split needs into _role_
      (many implement one facet) vs _relation_ (a pair, e.g. drizzle
      relations, FSD `@x`).
11. **Operator:** «и он (@x) меня бесит потому что выглядит как хак :)»
    - **Agent:** proposed `relations` above entities as the mirror of `roles`
      below.
12. **Operator:** «но тогда по сути (если отойти от идеоматики), relations и
    roles это просто виды entity, стоящие над и под обычными entity
    соответственно, то есть мы вводим три слоя entity»
    - **Agent:** yes — three strata (Chen's ER); turtles closed by meaning;
      said no need to stretch to features/widgets without a live case.
13. **Operator:** «> Я бы записал её строкой в «Open directions» … — давай я
    сразу зафреймлю: мы разрабатываем архитектурную методологию. …» (verbatim
    in Standing constraints)
    - **Agent:** stress-tested three strata: holds for M:N, polymorphic, pair
      UI, cross-app; breaks on 1:N FK in table definitions; options: schema as
      contract in shared / FK as relation / ranks.
14. **Operator:** «> Но натягивать роли и связи на фичи я бы не стал, пока там
    нет живого случая. — но мы же как раз обсуждали случаи (и для фич и для
    виджетов) -- возможно, в предыдущей сессии?»
    - **Agent:** conceded (same session); roles generalize (undoable,
      auth-gated, dashboard-card) as contracts that know no entity; relations
      for features/widgets = the layer above; FSD's deprecated `processes`.
15. **Operator:** «а что если банально [feature|entity|widget]-compositions (без
    roles и relations; на entity остаётся два уровня -- решает и вопрос
    relations, и вопрос roles [но не два одновременно])?»
    - **Agent:** pluses (uniform, MASD's own word); breaks when both sides are
      compositions (GitHub star: user=actor, repo=starrable); placement depends
      on imports.
16. **Operator:** «> звезда — связь user и repo … — да, но "звезда" это по сути
    действие (поставить звезду), "автор-пост" -- тоже "сделать пост". ты можешь
    придумать примеры, когда такие вещи (по сути relations из обсуждений выше)
    _не_ реализует "действие"? > Гриб лежит в entities … — согласен.... но как
    же всё-таки быть с композитными фичами и виджетами. > Почему три страта
    этого не боятся — ну это понятно, но четыре страта будут бояться ещё меньше
    чем три, и так далее :)»
    - **Agent:** non-action relations: pair reads (slots), policies like
      `canEdit` (expressible over roles), schema; composite features/widgets =
      role below + wiring above (IoC), `roles` as the home for contracts;
      strata count = number of definitions. Proposed one `roles` layer.
17. **Operator:** «> схема — контракт в shared, как мы и решили — да не то чтоб
    мы решали, просто иначе никак не выходило»
    - **Agent:** named the seam; options: redefine shared ("may describe stored
      data shape") or a `data` layer.
18. **Operator:** «> Есть смягчающее обстоятельство: FSD допускает то же самое в
    shared/api … — оно не смягающее -- именно из-за таких обстоятельств мы и
    пытаемся придумать ~~велосипед~~ что-то новое»
    - **Agent:** proposed criterion: segmented layer for what is a graph by
      nature, sliced for what splits; claimed MASD app shared already knows
      business.
19. **Operator:** «> MASD давно не держит «shared не знает бизнеса». … — опят
    же, это "не от хорошей жизни" мы туда это засунули, и вот все эти темы с
    подсущностями/надсущностями, среди прочего, могут и такое решить. > Граница
    бизнеса в MASD — это приложение … — так ли это? есть ли в приложенческих
    shared всё-таки что-то, что "не знает бизнеса"?»
    - **Agent:** surveyed every app `shared`: plenty is business-free
      (mushrooms `lib` geometry/motion, `ui` shapes/synth; music
      NotedSpan/FactLine/duration; shell UI kit; blog hast helpers); business
      parts: `shared/world`, palette, `random`, music catalogue, basilisk
      content. Proposed a domain floor below entities.
20. **Operator:** «> Значит, наша тема шире, чем «роли». … — вот, об чём я и
    говорю. > А роли — лишь та её часть, что режется на слайсы. … — вот это не
    понял, попроще пжст»
    - **Agent:** plain explanation: sliced (parts don't need each other) vs
      segmented (drizzle tables need each other).
21. **Operator:** «> Чтобы такие вещи работали, им нужно лежать вместе, там, где
    все видят всех. — но со строгим направлением импорта, как в "корневом"
    masd.json»
    - **Agent:** one layer of slices with a declared DAG; roles are slices with
      no edges; ranks acceptable when the layer itself carries meaning; name
      candidates parts/domain/basis.
22. **Operator:** «ещё поидеируем. мысли вслух, не значит так называть, а в
    каком направлении думаю: foundation, fundamentals, roots. при этом должно
    быть идиоматически понятно, что является entity, а что <то как мы назовём>»
    - **Agent:** test "can you point at one?" (entity = has instances);
      recommended `foundations`.
23. **Operator:** «foundations/concepts нравится-ish по идиоматике "извне", но не
    очень по идиматике "изнутри" (как сущности, но могут импортить друг друга в
    строгом порядке)»
    - **Agent:** `bricks` (strata, definitions, masonry as alternatives).
24. **Operator:** «substrate/substrates/substrata/strata/: каждый слой над
    другим»
    - **Agent:** recommended `substrata`; caveat strata imply a total order.
25. **Operator:** «собственно есть ещё угол subentities/protoentites
    (prototypes? гы), один минус который вижу сразу -- "user" это вполне себе
    entity, с другой стороны может и нет (часто ли мы оперируем "юзером" именно
    как объектом бизнеса?)»
    - **Agent:** sub-/proto- ask about degree, not kind; user decomposes
      (profile = entity, identity/table/actor = lower layer).
26. **Operator:** «> prototypes — забавно точно … фатальное. — фатальное или
    наоборот показательное? потому что кто сейчас на низком уровне работает с
    prototypes в js (имею в виду с какой вероятностью возможна реальная коллизия
    в коде)»
    - **Agent:** conceded JS collision is not fatal; real objections: product
      meaning "draft/mockup", fits only contracts.
27. **Operator** (image: Captain Vrungel, «Как вы яхту назовёте, так она и
    поплывёт!»): «> пост не происходит от таблицы posts … — ну можно поспорить,
    что post-как-таблица-drizzle это как раз неполноценное entity -- она скорее
    описывает контракт; все реальные действия реализуются уже выше (ниже?) по
    коду. про грибы что возразить не знаю. в направлении bricks какие ещё идеи
    могут быть? > Получается та же беда, что с essences — к слову: essentials.
    вот же ж у нас проблемы :)»
    - **Agent:** conceded tables are contracts; essentials reads as shared;
      bricks-family: underpinnings, masonry, footings (collides with `Footing`),
      blocks, atoms.
28. **Operator:** «как вообще по-английски можно сказать "то, из чего
    состоит"?»
    - **Agent:** constituents, components, ingredients, elements, parts, makeup,
      composition, matter, constitution; highlighted `constituents`.
29. **Operator:** «ingredients... это может быть интересно»
    - **Agent:** test built into the word (a dish is served, flour isn't);
      nested ingredients = strict partial order; ranked ingredients first.
30. **Operator:** «как у нас ещё эти ground и view в картину входят?» (mid-turn:
    «типичный Клод: рассуждаю-рассуждаю, а посмотреть забыл :)»)
    - **Agent:** read the code: `ground`/`view` and pinhole/eye-height/pan/
      stride/walk are a space/camera engine with no domain (only `FLOWER_SIZE`
      and comments); `shared/world` file graph is acyclic; split into engine
      (kitchen → shared), dusk/weather, domain ingredients (occupant,
      seat-reach, shelter-seats, crowding, anchored-ground, bed-place, acting).
31. **Operator:** «передать можно, но на последок ещё одна бешенная мысль: не
    вводим новых слоёв, но вводим строгий порядок в shared»
    - **Agent:** order is useful but shared would still know business; started
      `/relay`.
32. **Operator** (interrupting the relay): «> shared по-прежнему знает бизнес —
    но ты сам уже считая выше понял что не везде граница такая чёткая» … «давай
    не создавать пока новую сессию»
    - **Agent:** stopped the relay before writing anything; conceded: a layer
      forces a binary call on borderline files, an order in shared expresses a
      gradient; proposed "no new layers, strict order in segmented layers,
      shared knows the domain increasingly upwards".
33. **Operator:** «ага, а что с мультиаппами? просто любой shared верхнего аппа
    может импортировать любой shared нижнего? изначально обсуждали такого для
    всех слоёв, но у них был запрет на импорт внутри вообще, а здесь вроде
    конфликтов не возникает»
    - **Agent:** cross-app needs nothing new (app order already orders it);
      ordering shared tightens rather than loosens, so no conflict with
      composition; order is between segments, free inside a segment; measured:
      every app's shared segments are already acyclic in production code (only
      `mushrooms/shared/lib/cruise.test.ts` reaches `world`); `shared/world`
      should be split into purpose-named segments to express the gradient.
34. **Operator:** «поразительно, конечно, обсуждали 280к токенов, а пришли к
    такой банальщине :) итого что, в shared должен быть файлик с одним массивом,
    задающим порядок слоёв -- начиная с того кого импортировать могут все,
    заканчивая тем кто может импортировать всех? собственно.. раз shared это у
    нас сегмент, то если расширить постановку, то в принципе сделать во всех
    сегментах обязательный порядок. если сегменты стандартные то
    config<-model<-lib<-(или наоборот?)api<-ui, если есть нестандартные (как в
    shared), нужно задавать вручную»
    - **Agent:** array (total order over the partial graph) is fine; write it
      highest-first like `LAYERS`; measured same-slice segment imports in this
      repo: ui→model 164, ui→lib 33, ui→api 5, api→model 5, nothing reverse —
      operator's order fits all; claimed "classic FSD: model → api".
35. **Operator:** «> В классическом FSD модель часто вызывает api … — инфа 100%?
    > нестандартные сегменты — массив рядом с ними … — при этом стандартные
    > тоже перечислять?»
    - **Agent:** FSD docs give no segment order; api and model both claim
      "data types"; if an array exists it lists all segments and may not reorder
      the standard ones.
36. **Operator:** «> это была практика сообщества — опять же, инфа 100%? :)»
    - **Agent:** checked: FSD tutorial has no `model` segment code; official
      todo-app shows `entities/task/model` importing `shared/api` (cross-layer).
37. **Operator:** «> Стандартные перечислять — да, если массив есть — а
    разрешать ли менять направление стандартных?»
    - **Agent:** only project-wide (one decision for all of `src/`), never per
      app or slice; MASD ships a default.
38. **Operator** (screenshot of the todo-app quote): «не, ну это тогда вообще
    про другое :) а какие-нибудь популярные репы на FSD есть посмотреть?»
    - **Agent:** conceded (cross-layer is irrelevant); launched a survey
      subagent.
39. **Operator** (mid-turn): «ладно, давай как закончат передавать новой
    сессии, будем там допереливать из пустого в порожнее:)»
    - **Agent:** reported the survey and ran this relay (verbatim in Last agent
      turn).

## Intent

The operator is designing MASD as a general architecture methodology, and wants
the answer that is right "in general", structurally and idiomatically, not a
fix for this repo. The topic started as "sub-entities" (a facet several entities
share) and widened into: where does domain-aware code that is not an entity
live, and how is it kept disciplined. Ruled out along the way: ranks inside
`entities` (no meaning), `@x` (a hack), central slice config in `src/masd.json`
(app internals in a shared config), `[layer]-compositions` (placement by
dependency, and the two-sided case), a custom Steiger plugin.

## Decisions (current, all still open to the operator)

- **Current direction: no new layers; strict import order between segments.**
  The operator's «не вводим новых слоёв, но вводим строгий порядок в shared»,
  generalized by them to every segmented place.
- **Order unit = segment**, files inside a segment reach each other freely.
- **Form = an array**, a total order over the partial graph, written
  highest-first like `LAYERS` in `eslint/masd-graph.ts`.
- **Standard segments** (`ui`, `api`, `lib`, `model`, `config`) have one order
  for the methodology; the agent's proposed default (highest first): `ui`, `api`,
  `lib`, `model`, `config` — the operator's `config<-model<-lib<-api<-ui`. A
  project may reorder the standard ones once for all of `src/`; apps and slices
  may only insert their own segments between them. An array, where one exists,
  lists every segment of that place; the checker holds the standard ones to the
  methodology's order.
- **Non-standard segments** (`shared`, `app`, a slice's custom segment) declare
  their array beside them, not in root `src/masd.json`.
- **Across apps nothing changes**: an ancestor is always below; ordering
  tightens free reach, so it cannot conflict with composition.
- **`shared` knows the domain by gradient**, rising up the order; the strict
  "shared knows no business" line is dropped because the code showed it is not
  binary (`ground`/`view` engine with `FLOWER_SIZE`, `dusk`/`weather`,
  `anchored-ground`).
- **`shared/world` is to be split into purpose-named segments** (space/camera
  engine; time and weather; domain pieces such as occupant, seat-reach,
  crowding) so the order expresses the gradient.
- **Forbid non-`.ts`/`.tsx` sources in layers** (`.js`, `.jsx`, `.mjs`, `.cjs`,
  `.mts`, `.cts`) now, so nothing slips past `boundaries` before Steiger's rule
  is ever turned off — the operator's ask in message 10.
- **`model` vs `api` order** is the contested pair: FSD's docs give none; the
  survey (below) shows runtime calls go model→api and type imports api→model.
  The agent argued for `api` above `model` (types low, outgoing calls high);
  not settled.
- **Terms coined**: "kitchen" (business-free tools) vs "ingredients"
  (domain-aware pieces) vs "dishes" (entities); "domain floor" (what knows the
  domain but is not an entity); "pointing test" (an entity has instances you can
  point at).

## Errors and dead ends

- The `/task` went straight to a plan; the operator wanted to discuss first.
- Agent claimed "role importing role = too thick"; it was "too thin / merge".
- Agent claimed cross-app entity imports need relaxing the sideways rule; wrong
  under composition.
- Agent proposed `@x` files as the rank graph; an ancestor would name a
  descendant.
- Agent called "schema in shared" "decided" and FSD's `shared/api` "mitigating";
  both rejected by the operator.
- Agent claimed "MASD's business boundary is the app"; a survey of app `shared`
  disproved it.
- Agent argued about `ground`/`view` across four names without reading them.
- Agent twice claimed FSD convention for model→api without checking; FSD's
  example is cross-layer and irrelevant.

## State

- Branch `claude/masd-role-slices`, head `a2789de` before this relay's commit.
- Draft PR #225 (open, draft), title "refactor: roles, a MASD layer for facets
  several entities share", squash proposal posted; both describe the
  superseded `roles` plan.
- Plan file `docs/plans/masd-role-slices.draft.do-not-implement.md` — describes
  the superseded `roles` layer; to be replaced by a segment-order plan once the
  operator settles it.
- Squash working file
  `docs/remove-before-merging/masd-role-slices/squash-message.md`.
- No CI, no PR subscription, no scheduled check-in.
- Estimate: this session 3 h senior architect ("a methodology-level design
  discussion — a new layer, ranks, compositions and naming weighed against
  FSD's own escape hatches — is architect judgement"). Remainder handed on: 1 h
  senior architect (settling the segment order and rewriting the plan) + 3 h
  middle developer ("splitting `shared/world` into segments and teaching
  boundaries a per-place segment order is routine but wide").
- Not done, asked earlier and never answered: whether «не надо релеить, пока
  обсуждаем» is a standing rule for `.claude/voice/operators/vzakharov.md` or
  `.claude/context-budget/manual-relay/vzakharov`. Don't re-ask unprompted.
- The muthur sync offer was made; do not make it again.

## FSD survey (subagent, outside the repo)

Same-slice cross-segment imports in 7 FSD repos with both `model` and `api`
segments (`from -> to`):

- noveogroup-amorgunov/nukeapp (~415★): api->model 3 (types), model->api 1.
- Shiyan7/kinomore-v2 (~128★, effector): model->api 9, no api->model.
- vissh/vkui-audiopad (~49★): model->api 6, api->model 6 (types).
- iNikAnn/DoHabit (~63★): api->model 2 (types), no model->api.
- aabounegm/cast (~25★): model->api 5, api->model 1 (the only runtime one).
- Barklim/onlyfClient (~24★): api->model 3 (types), model->api 2.
- gyolkin/stellar-burgers (~21★, RTK Query): api->model 3 (types), model->api 1.

Large FSD repos without an `api` segment: Snouzy/workout-cool (~8.6k★, uses
`actions`), yurisldk/realworld-react-fsd (~533★, file-suffix segments). Overall:
runtime calls go model→api, type imports go api→model, no runtime cycles; a
practice, not a stated rule. Re-run by shallow-cloning those repos into `tmp/`.

## Pointers

- `docs/masd.md` § "Open directions" — the source item (sub-entities).
- `.claude/rules/masd.md` — MASD rules; § "Rules" on segmented layers and
  `shared/lib`.
- `eslint/masd-graph.ts` (`LAYERS`, `SLICED_LAYERS`, loader),
  `eslint/masd-boundaries.ts` (`files: src/**/*.{ts,tsx}`, segmented policies
  at the `['app', 'shared'].map` block), `scripts/masd-check.ts`,
  `steiger.config.mjs`.
- `src/mushrooms/shared/world/` — the case study; `occupant.ts`,
  `seat-reach.ts`, `ground.ts`, `view.ts`.
- Steiger's `forbidden-imports`:
  `node_modules/@feature-sliced/steiger-plugin/dist/index.js` (~line 480).
- FSD segments reference: https://feature-sliced.design/docs/reference/slices-segments
- Predecessor transcript:
  https://claude.ai/code/session_01DaohkCQNvFh64xkX3U6A42

## Next step

Continue the discussion — «будем там допереливать из пустого в порожнее:)». The
open points: the `model`/`api` order in the methodology's standard segment
order (with the survey above as evidence), where and how a place declares its
segment array, and how `shared/world` splits into segments. Once the operator
settles it, replace the `roles` plan on this branch with a segment-order plan
(and retitle PR #225), still as a draft, plus the non-`.ts` source ban. Do not
implement before the operator's go-ahead.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Да, `shared/api` — это вообще другой слой, и про порядок сегментов внутри слайса он ничего не говорит. Засчитано.

Популярные репозитории на FSD поищу и проверю их по коду. Это десяток клонов и grep'ов, так что отдам агенту: так их вывод не забьёт и без того толстый контекст.

Договорились: дождусь, пока агент вернётся с разбором репозиториев, допишу его результат в сводку и передам всё новой сессии. Переливать будем уже там.
```
