# PR #115 review round — Vova's replies of 2026-10-07 (paused)

Task as asked (`/handle claude/music-catalogue-hidden-ldz252`): «ответил на комменты (те что не заресолвил), плюс пушнул текст в две песни, добавь пжст обёртку и переводы». The 41 threads are in `docs/pr/115/pr.md` (export committed at 585972d).

## Done

- English-sung songs' fixes — 772ce09 (T05 T08 T13 T19 T20 T22 T24 T28 T31 T35 T11).
- Lebed and Ya Govoryu wrapped and translated, plus T03 T32 T34 T37 T38 T47 — b5db553.
- T18 T21 T25 T39 T43 T45, rak credits MCR, deer cribNote — bb870f1.
- T02 artist/album pages, T04 per-locale transliteration (agios-o-skopos ru title «Предназначение», per Vova in chat), T46 notes over several lines, T23, languages de/it/es (T01 T06 T14), T09 T15 T26 T27 T29 T30 T31-album T33 T44 — cbd8bbd.
- Rule: Suno vocalisms and pause ellipses do not travel — a411554. Five-percent entry — 95f545b.
- Artist/album links underline on hover only (Vova in chat) — 4ea1ff8; DRY'd into `NameLink` (Vova: «я бы DRY-нул») — 1019f8f.
- Ellipsis sweep — e9510e5 (first six files), bac6ea4, a7a61ba (the rest, pes chorus in two lines); `pnpm build:vova` green.
- Replies posted on 40 of the 41 awaiting threads; T47's reply hit GitHub's secondary rate limit (422 `abuse`) — body in `tmp/replies/T47_4206638270.md`, retry it.

## Left

1. **Finish the ellipsis sweep** (T19's «просвипить»), mirroring every change in the crib column; line numbers are from before the sweep began:
   - fingers 86 «полдекабря… но» → comma; 104 and crib 179: drop `…`.
   - ghost 48/60/84/96, in-the-flesh 36/68, infinite-solitude 66/106, okna 77/125, peta 55/88, protintro 35/50, psch 78/129, succumb 82/140, yad 104/145, ultimate-abstraction 68/78/122/132: `…` → `.`
   - grayrage 65/102, love 41/42 and 66/67, nightmares 60/67/68 and 103/110/111: drop the ellipsis.
   - hcyl 39/81 drop; 51/52/56/57 and 93/94/98/99 drop the `…` before the parentheses.
   - la-scorpionne 46/74/102 «la vie…» → «la vie.» (both cribs).
   - one-day 46/116 «One day....» → «One day»; 57/81/86 and 127/151/156 drop; keep «kick the shit…».
   - pes: chorus as two lines in all four choruses, as pes-reprise has it («Это море — судьба моя, / Эти воды — слёзы мои»; “This sea is my fate, / These waters are my tears”).
   - prs 70–72 and 119–121 drop the `…` before “(punk rock song)”; rebels 54/85 «rebels... between» → «rebels between» (and ru).
   - s74 68 «Моя... душа с тобой...» → «Моя душа — с тобой,» (published punctuation; en column is Shakespeare, unchanged).
   - sad 69/108 «О, сад ночной…» → «О, сад ночной.» / “Oh, night garden.”
   - skolko 33/119 and 88/174 `…` → `.`; 105/191 and 113/199 → `?`.
   - Kept on purpose (report to Vova): published poems' own ellipses (Nekrasov in asa, leli, moral, moroz, mu-icok-new, ne-toropi, otvet; Tsvetaeva in mne-nravitsya, requiem; Akhmatova in ya-govoryu; deer 101 / hamlet 41 «Удобен миг…» kept on doubt); meaningful ones in Vova's text: the «…»-only stanza in chaos-always-wins and la-scorpionne (a section break in his own file), birdie «А сейчас вылетит...», one-day «kick the shit…», prs «just... gross», sashas «Где нет слов...», skolko «Ну а сейчас…». Vocalisms left as sung words: prs «na-na-na», «Whoa-oh»; wereback «oh-oh-oh-oh»; baa «Бе-е»; watch-people-die «die-o». Question for Vova: s74's dashes «Пускай — в земле», «Моя — душа» look like Suno pauses too.
   - Then `pnpm check:prose-quotes`, `pnpm format:check`, `pnpm build:vova`; commit `feat(vova): …`.
2. **Reply on GitHub to every awaiting thread** (CLAUDE.md § "GitHub comments": one sentence + bare SHA; never resolve). Drafts below; fill SHAs. T02's reply: «Сделал страницы артистов (`/music/artists/…`) и альбомов (`/music/albums/…`), `/music` теперь начинается со списка артистов, песни идут под ним, на странице песни артисты и альбом — ссылки (подчёркиваются при наведении), а скрытые песни видны только в полном каталоге под `/music/all/…`, закрытом от индексации и sitemap — cbd8bbd, 4ea1ff8. Глянь, нравится ли подпись «Артист» / «Альбом» над заголовком.» T12 (Чих-Пых, «как бы ты перевёл»): answer it — e.g. “Achoo-Puff”, with a line of why. T16: remind Vova about the slugs (his ask: «как доделаешь работу по этому ревью напомни»). T24 reply also cites the sweep commit.
3. `/polish`, then `/pr` (refresh the PR body: artist/album pages, `/music/all/…`, per-locale gloss, multi-line notes, site-hosted masters, NameLink).
4. Report to Vova: the PR is `CONFLICTING` with main (report, don't merge); `.claude/rules/i18n.md` still names `LocaleTail` though music no longer uses it (type still in `locales.ts`); open questions from the drafts.

## Reply drafts

T05 — «Nothingness» теперь одним словом (chaos-always-wins), а в la-scorpionne «dans le néant tu infuses» стало «You, my sculptor, permeate the void» / «Ты, мой скульптор, пропитываешь собой пустоту» — 772ce09.
T08 — Традиционный текст заменил твоим, шесть четверостиший с русским подстрочником, номер трека не трогал — 772ce09.
T13 — В cracks «little world», в mira «unleashing the main» в подстрочнике стало «Разрывая узы, открывая шлюзы», а Undone теперь «Пропащие» (как «I am undone» — «я пропал»); были ещё «Без остатка», «Растворённые», «Расплетённые» — скажи, если какой-то ближе — 772ce09.
T19 — Название стало «Good Girl» с переводом «Хорошая девочка», многоточия убрал, последняя строка — «Bye-bye, good girl.» — 772ce09; правило про суновские многоточия записал (a411554) и просвипил остальные песни — {SWEEP}. Если хочешь стилизованное «gg», верну.
T20 — Последнюю фразу разбил после «whispers reclaim,», чтобы «reclaim» и «game» рифмовались в концах строк, подстрочник так же — 772ce09.
T22 — Сноска про Дилана Томаса теперь и в английской колонке — 772ce09.
T24 — Растяжки (Insi-ide, hi-ide, li-ight) и паузы-многоточия убрал и в тексте, и в подстрочнике — 772ce09; в правиле это теперь сказано прямо — a411554.
T28 — Убрал (uh), (yeah), (ooh, ooh, yeah) и в тексте, и в подстрочнике — 772ce09.
T31 — Добавил рычащий припев и второй куплет с подстрочником, автором слов указана Джейн Тейлор (второй куплет — строфа из длинной версии того же стихотворения 1830 года), а песня — трек 2 в Nursery Rhymes — 772ce09, cbd8bbd. После второго куплета припев звучит ещё раз?
T35 — Вписал весь припев от «Alright, alright, wave goodbye» до «background fader», с подстрочником — 772ce09.
T11 — Первую строку last-christmas пометил сноской на всю строку: «Spoken, not sung.» / «Реплика — не поётся, а произносится»; сноску в femur оставил — 772ce09.
T01 — Добавил языки `de` и `it`: у believe-in-me теперь `[en, de]`, у in-our-image `[en, it]` — cbd8bbd. Про «In Our Image» жду твоего взгляда на текст.
T06 — Добавил испанский `es`, у tango теперь `[en, es]` — cbd8bbd.
T14 — У crossout теперь `[en, de]` — cbd8bbd.
T09 — Переименовал в «Иске Кормаш», и в реестре, и в babay — cbd8bbd.
T15 — Назвал проект Velvet Static (от «Through the static» и «Velvet voice» в тексте), diner теперь в нём; другие варианты — Glitch & Glamour и «Помехи». Какой берём? — cbd8bbd
T26 — Назвал проект «Оттепель» (эпоха Кристаллинской), klo теперь в нём; другие варианты — «Патефон» и «Хрусталь». Какой берём? — cbd8bbd
T27 — Альбом теперь «Сильней любви», адрес `polzat` пока прежний — cbd8bbd. Заодно оформил «Я куплю тебе дом», которую ты запушил: слова без суновских пометок и без вставленного блока Genius, подстрочник со сносками про «Спортлото» и «барабанщика», авторы — Танич и Коржуков — b5db553. «Управляя лотом» — ты так поёшь, или у Танича «лотком»?
T29 — Название теперь «Trust In the Machine», на русской странице с переводом «Доверься машине» — cbd8bbd.
T30 — Сделал скрытую страницу protintro, трек 1 в Prototypes: мастер из твоего Jukebox-файла лежит на самом сайте (`/music/assets/protintro.mp3`), текст — английские слова с русским подстрочником — cbd8bbd. Дату (2022-10-01) я поставил наугад — когда она сделана, и годится ли название «Protintro»?
T33 — Сделал скрытую страницу «Призрачный блюз» (`blues`), трек 7 в «Ни для кого и для всех», музыка Андрея Мокрушина, мастер лежит на сайте (`/music/assets/blues.mp3`), английский подстрочник — cbd8bbd. Дата пока сегодняшняя — когда песня сделана?
T44 — По описанию указал папу автором музыки в pobeg, pes, sultan, rank, otter, pes-reprise, 40days и salman; в ophelia — папа плюс этюд Карулли; reka-2 оставил как было — cbd8bbd. В pobeg я исхожу из того, что «Жаворонок» — папин рок-спектакль, так?
T03 — Вернул «Лишь варианты» отдельной строкой в обе колонки и убрал сноски — b5db553.
T32 — Убрал «(а-аа)», многоточия и «Война-а» (и в подстрочнике); эхо «(война)» оставил, это пропетое слово — b5db553.
T34 — Первая строфа написана один раз, под ней строка «(×4)» в обеих колонках — b5db553.
T37 — Припев теперь в две строки: «Это море — судьба моя, / Эти воды — слёзы мои» — b5db553.
T38 — Русскую историю переписал без двусмысленности: «фотографии, которую сделала моя сестра Саша» — b5db553.
T47 — My Chemical Romance в авторах музыки (и у «Рака» тоже — вольный перевод их «Cancer»), сноска про Берна теперь и в русской колонке — b5db553, bb870f1. У «Рака» указать их и в авторах слов?
T18 — Вернул «bitch» в припевы («Fly, bitch, fly!» во всех четырёх), в куплетах осталось «fucking» — bb870f1.
T21 — В cribNote теперь сказано, что английский — оригинал Шекспира, а четверостишие про оленя поётся дважды: у Пастернака и у Лозинского в переделке из «Покровских ворот», переделанной тобой ещё раз; на оба повесил сноски, в авторы слов добавил Пастернака, Лозинского и тебя — bb870f1. Остальное (Луциан, «Удушлив смрад…») — тоже Пастернак?
T25 — Песня теперь «Клокочина» в обеих локалях, по-английски Klokochina / Chinaberry, в подстрочнике везде chinaberry (Melia azedarach) — bb870f1.
T39 — Это Блок, «Покойник спать ложится…» (1909, «Арфы и скрипки»): в авторах слов Блок и ты; канонического перевода нет, но там, где ты поёшь Блока как есть, в подстрочнике опубликованный перевод Дмитрия Смирнова «The calm snowstorm», он указан в cribNote; многоточия убрал (у Блока их там нет) — bb870f1.
T43 — В авторах слов Traditional и ты, на первом припеве сноска про Аркадия Северного и более позднюю версию Круга — bb870f1. Музыку тоже записать как Traditional и ты?
T45 — Повесил на эти две строки общую сноску в обеих колонках: отсылка к «Батарейке» «Жуков», те же четыре нисходящих аккорда — bb870f1.
T04 — Транслитерация теперь своя у каждой локали (латиница в `en:`, кириллица в `ru:`) и показывается, только если название написано письмом, которое читатель не читает; по-русски песня теперь «Предназначение», так что на русской странице строки под заголовком нет, а на английской — «Agios o Skopos · gr. Holy Is the Purpose» — cbd8bbd.
T46 — Научил синтаксис: один и тот же `[^метка]` в конце нескольких строк подряд даёт одну подсказку на всю группу; у Ван Вэя она теперь на всех трёх строках (с первой), в русской — палладица; так же переделал believe-in-me, in-our-image и trisagion, где раньше было «эта строка и следующая» — cbd8bbd.
T23 — Подсказка теперь с транслитерацией: «Arabic: _Wa-akhīran ṣamt._» в английской колонке, «Араб.: _Ва-ахиран самт._» в русской (она висит на строке подстрочника — сноски самой арабской колонки страница не показывает) — cbd8bbd.
T07 — Ок, жду пометок по текстам; где кончается спетое, поправлю по ним.
T10 — Понял: explicit только на конкретные слова, monday оставил как есть; про склейку в crossroads жду.
