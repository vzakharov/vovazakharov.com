# Relay 1 — unsquatted shortlist and sharing (parked)

## 1. Standing constraints

None stated by the operator.

The muthur sync offer was made; do not make it again.

## 2. The conversation

**Operator (1):**

> по unsquatted несколько правок:
> 1- поменять хеш-параметр на `#q=` (потому что см. 5)
> 2- убирать хеш-параметр
> 3- при заходе сразу фокусироваться на инпут
> 4- крестик в правой части инпута = стереть то что написано сейчас
> 5- "сердечки" на понравившихся именах, просмотр всех понравившихся на каком-то хешпараме
> 6- расшаривание как ссылка (просто копируется в буфер обмена) и как картинка (наработки для этого уже вроде есть)
>
> по дизайну 5/6 нужно сначала несколько вариантов дать, я выберу

**Agent:** Routed via `/task` → plan and hand off (the operator reserved the
5/6 design). Renamed the branch, mocked three placements for likes (5A counter

- liked view, 5B shortlist section, 5C drawer), three for share (6A in field,
  6B line under results, 6C per card) and three image cards (search mock, one
  domain hero, liked list), wrote the draft plan, opened draft PR
  vzakharov/vovazakharov.com#241 with a squash proposal. Asked five numbered
  questions with recommendations (1a 5A, 2b 6B, 3a card 1 + list card, 4a strip
  the hash after reading it, 5a no autofocus on touch) and offered the muthur
  sync once.

**Operator (2)** (attached a screenshot of the 5B mockup):

> вот такой вариант, но "пустые" сердечки должны показыавться только если недоступен hover, если доступен, только при нём. аналогично в шортлисте.
>
> собственно тогда #... можно не менять, отдельной страницы "залайканные" не будет. давай только будет copy/paste: кнопочка карандаш, нажимаешь -- список с разделителем новой строкой, кнопкой скопировать. вставляешь, сохраняешь -- список обновляется.
>
> +поясни как ты видишь механику просмотра многих ссылок если их больше 4
> +если залайкано несколько вариантов с одним запросом, оно должно идти типа
>
> foxedpage.com
> +X similar (или другое слово вместо similar, но там будут идти все foxedpage.xxx и foxed.page тоже)
>
> расшаривать только конкретное имя, не весь шортлист, вд как на первой карточке, но без "checking..." разумеется -- нужно выдавать либо топ 3 доступных из нашего списка, либо 3 залайканных (ну или типа 2 залайканных + 1 из нашего итд).
>
> для недоступных должно быть нельзя ни залайкать, ни расшарить

**Agent:** Treated it as a plan revision (Part 3 collapse, no go-ahead).
Re-mocked: shortlist with hover-only empty hearts in the card's bottom-right
corner, grouped chips, "+N more ↓" fold, a taken card with no tools; the share
menu; the plain-text editor; phone width; the revised share card. Rewrote the
plan, PR title, body and squash proposal. Explained the >4 mechanics (chips
wrap, 8 shown / 5 on phone, rest behind "+N more ↓", lookups deferred like the
zone grid) and grouping (pure function of the list; a chip opens its name in
the checker, which is how "+2" expands). Asked three questions, with the plan
written to the recommendations (verbatim in Last agent turn).

## 3. Intent

Vova wants unsquatted.com's checker to let a visitor collect names they like,
manage that list, and share a single found name, without the page growing a
second view. He ruled out a separate "liked" page or hash view, sharing the
whole shortlist, and liking or sharing anything unavailable.

## 4. Decisions

- **Shortlist section (5B)** between the checker and "Up for grabs" beat a
  liked view replacing results (5A) and a drawer (5C): operator's pick.
- **Hash keeps its current form** (`#name`, `#name.zone`); `#q=` existed only
  for a liked view that no longer exists. Operator: «#... можно не менять».
- **Strip the hash after reading it; typing writes nothing to the address**
  (old Q4a). Unanswered, so the recommendation stands. Cost: reload forgets
  the name.
- **No autofocus on `pointer: coarse`** (old Q5a). Unanswered, so it stands.
- **Hearts and share icons sit at the card's bottom-right, on the price line**:
  the first mock placed them on the name line and they wrapped. Empty ones show
  only on hover where `(hover: hover)`, always on touch. Filled always.
- **Taken or pending names get neither heart nor share.**
- **Grouping**: `a.z` joins the group of a liked domain named `az` or `za`
  (a split of that name), else heads group `a`. The chip's representative is
  the first-liked domain whose name is the group's label. "Siblings" is the
  recommended word (open Q1).
- **Editor**: "✎ edit" turns chips into a textarea, one domain per line, with
  Copy / Cancel / Save. Save replaces the list after cleaning with `host()`
  from `rows.ts`, dropping blanks and repeats and naming invalid lines (which
  block the save).
- **Share = one available domain**, via a menu on the card's or chip's share
  icon: Copy link (`https://unsquatted.com/#<domain>`, "copied ✓" for 2 s) and
  Share as image (canvas 1200×630, page fonts, light-palette tokens,
  `navigator.share` with files, else download). Card rows: the shared domain
  bold, then the sharer's liked available siblings (♥), then other available
  domains in `rowsFor` order. Only resolved free/maybe verdicts; up to 3.
- **No `@mantine/notifications`**: the menu item's own label confirms the copy.
- **localStorage via Mantine `useLocalStorage`**. When storage throws, likes
  are in-memory and the heading says so (a told degradation, not a silent one).
- **The image card shares no code with `unsquatted-card.ts`**: runtime canvas
  against build-time Playwright HTML.

## 5. Errors and dead ends

- The first round placed card icons on the name line; with heart and share
  together it wrapped (6C mock), which is why they moved to the price line.
- `pkill -f "next dev"` from Bash exits 144 because it matches its own shell.
  The dev server stopped anyway.

## 6. State

- Branch `claude/unsquatted-favourites-share-sy1prs`, head `e976f46`, pushed,
  tree clean.
- Draft PR https://github.com/vzakharov/vovazakharov.com/pull/241, titled
  `feat(unsquatted): clean address, focus, clear, shortlist and sharing`; body
  and squash proposal comment current with the revised plan.
- Plan: `docs/plans/unsquatted-favourites-share.draft.do-not-implement.md`
  (draft, no go-ahead given). Mockups in `docs/plans/unsquatted-favourites-share/`.
- No CI, subscription or scheduled check-in. Keepalive watcher ended.
- Estimate: this session's 2 h senior developer ("planning the shortlist,
  grouping rule, share-card rows and address change against the checker's code
  took a senior's reading of the slice") + 4 h middle designer ("two rounds of
  placements and cards, mocked over the live page at desktop and phone width,
  for the operator to pick from"). Remainder handed on: 12 h senior developer —
  a storage-backed likes context with grouping and a text editor, browser-only
  share (canvas card, clipboard, share sheet) and an address rewrite need
  judgement about fallbacks, hover/touch rules and FSD placement.

## 7. Pointers

- The plan, as above: the whole spec, including files, DRY notes and tests.
- `src/unsquatted/pages/home/page/ui/checker-state.tsx`: hash read/write today
  (the pushState effect goes).
- `src/unsquatted/pages/home/page/ui/name-checker.tsx`: field, zone cards,
  `CLOSED_ROWS` and the deferred-lookup pattern the shortlist copies.
- `src/unsquatted/pages/home/page/ui/pick-row.tsx`, `lib/rows.ts` (`host()`,
  `domainHacks`, `rowsFor`).
- `src/unsquatted/scripts/lib/share-card.mock.svg`: the card layout to build on;
  deleted once the real card exists.
- Mock scripts lived in `tmp/mock/` (gitignored, lost with this container);
  the PNGs on the branch are what survives.
- Predecessor transcript: https://claude.ai/code/session_01DaohkDNtu3D8NrPoBoTABY

## 8. Next step

Wait for the operator. Open with the agent's last reply: three questions
(1: word for the group, recommended "siblings"; 2: chip heart and share on
hover only, recommended yes; 3: a pasted taken domain kept struck through,
recommended yes). An answer collapses the plan per `/plan` Part 3. A go-ahead
("поехали", "go ahead", or `/go claude/unsquatted-favourites-share-sy1prs`)
flips the draft via `/go` Step 1.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

````text
Беру 5B с твоими поправками. Это правка плана, а не сигнал начинать, так что сначала переснимаю макеты под новую механику, потом переписываю план.

Новые макеты в порядке, на телефоне иконки тоже помещаются. Осталась карточка для шаринга.

Пересобираю план под выбранный вариант: отвергнутые варианты убираю, оставляю новые макеты.

Коммичу правку плана и обновляю PR: заголовок, описание, предложение сквоша.

Я пересобрал план под вариант со шортлистом и твоими правками, макеты второго раунда отправил выше. План, описание PR и предложение сквоша обновлены, кода пока нет.

https://github.com/vzakharov/vovazakharov.com/pull/241

**Что изменилось:**
- **Хеш оставляю как есть** (`#foxedpage`, `#foxedpage.net`), раз отдельной страницы лайков не будет.
- **Пустые сердечки и иконка шаринга** на устройствах с hover появляются только при наведении на карточку. На тач-экранах они видны всегда, иначе их не нажать. Иконки стоят в правом нижнем углу карточки, на строке с ценой: в первой строке им места нет, первый макет это показал.
- **У занятого имени** нет ни сердечка, ни шаринга. Пока имя проверяется, их тоже нет.
- **Редактирование:** по кнопке «✎ edit» чипы превращаются в textarea, по одному домену на строку, внизу кнопки Copy, Cancel и Save. Save заменяет весь список. Если какая-то строка не похожа на домен, сохранение не проходит, и под полем написано, какая именно, так что ничего не пропадает молча.
- **Шаринг** только одного доступного домена: иконка на карточке или чипе открывает меню «Copy link» / «Share as image». На картинке твой первый мок: в поле имя, первой строкой этот домен жирным. Дальше твои лайкнутые доступные варианты этого имени с сердечком, потом остальные свободные в порядке чекера. Ни «checking…», ни занятых. Картинка уходит в системное меню «Поделиться», а где его нет, скачивается файлом.

**Если имён больше четырёх.** Чипы переносятся на новые строки. Чипов, а не доменов, видно не больше восьми, на телефоне не больше пяти. Остальные прячутся за «+N more ↓» / «fewer ↑», ровно как «more tlds ↓» под результатами. Проверяются только видимые чипы. Остальные начинают проверяться, когда на «more» навели курсор, поставили фокус или нажали. Длинный шортлист не дёргает регистраторов, пока его не открыли.

**Группировка.** Варианты одного имени сворачиваются в один чип: `foxedpage.com +2 siblings`. В группу попадают другие зоны того же имени и его разбивки (`foxed.page`, `tips.design`). Группировка считается из одного списка доменов, поэтому переживает копирование и вставку через редактор. Если нажать на чип, имя открывается в чекере, а там видны все его зоны, лайкнутые с заполненными сердечками. Так и раскрывается «+2». При наведении на чип все варианты перечислены во всплывающей подсказке.

**Вопросы.** План написан под рекомендованные ответы:
1. **Слово вместо similar:**
   - a) **siblings (рекомендую)**: это не похожие имена, а одно имя в разных зонах;
   - b) similar;
   - c) alike;
   - d) kin.
2. **«Аналогично в шортлисте»** я понял так: сердечко (чтобы снять лайк) и шаринг на чипе показываются при наведении. Все чипы и так лайкнутые, и сердечко на каждом только повторяло бы заголовок.
   - a) **да, так (рекомендую)**;
   - b) заполненные сердечки на чипах всегда.
3. **Если вставил через редактор занятый домен:**
   - a) **оставлять, он покажется зачёркнутым (рекомендую)**;
   - b) выкидывать при сохранении с пометкой.

По прошлым пунктам 4 и 5 рекомендации стоят, если не возразишь: хеш стирается из адреса, как только ссылку прочитали, и при наборе адрес не меняется. На тач-экранах фокус в поле при заходе не ставится.

Чтобы начать реализацию, открой новую сессию командой ниже или просто скажи здесь «поехали»:

```
/go claude/unsquatted-favourites-share-sy1prs
```
````
