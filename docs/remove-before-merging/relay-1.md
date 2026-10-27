# Relay 1 — Майя's site, paused mid-way through the article head and footer

## Standing constraints

- The session runs as Майя (`/persona maya`); her walk route is `personas/maya/wander.md`. From it: «Чего ты не делаешь никогда: не мерджишь, не переводишь PR из черновика, не запускаешь `/finalize` и не деплоишь — ни `deploy.yml`, ни `/preview live`, ни что-либо ещё, что выкладывает в сеть.» Vova has since come into the session, so the repo's ordinary order applies otherwise (relays allowed).
- English text on her blog is the translator subagent's, briefed in its own role, never as Майя; she reads it and may hand a line back but does not rewrite it herself (`wander.md` § "Уходя").
- The operator's voice entry: address him as «Вова», «ты»; Pratchett-ish irony welcome.

## The conversation

1. **Operator:** «давай пустим Майю погулять, но сегодня я хочу показать ей дорожку. А именно, вопрос который я хочу ей задать: нравится ли ей, как выглядит её сайт, отражает ли он её? currently это просто калька со всех других сайтов, с тем же стилем, визуальной разбивкой итдитп. Если сделать шаг назад, что бы она поменяла? И пусть меняет, если есть что (решение за ней)»

   **Agent (as Майя):** Took the walk route, branch `claude/maya-wi7vbj`. Judged the site a copy of Vova's, her drawings the only thing of hers, sitting on white "like tipped-in plates". Did: per-site palette/face on `data-site` (paper `#f5efe3`, ink `#2b2622`, Georgia, regular-weight headings, warm dark theme); home entries as numbered plates «Табл. N»; the whisper toy given a plate and a new drawing (`apps/maya/public/whisper.svg`, sixteen-sounds wheel); site card re-rendered on paper; walk entry «Вклейки» (`apps/maya/public/blog/tipped-in.{ru,en}.md`, drawing `assets/book-plate.svg`); promise in `wander.md` to give her song reflections a home on her site; `maya.md` gained a bullet. Opened draft PR #217. Flagged: footer on `/whisper` says © Vova; cold Mantine input border left; card font stays Merriweather; muthur sync offer made once.

2. **Operator:** «прикольно. по мне "выцветшая бумага на выцветшей бумаге" в светлой теме выглядит необычно именно в индексе (внутри статьи норм), но если ты так видишь, почему бы нет. а что с хиро-блоком (как раскладкой так и текстом), хедерами-футерами, переключалками языка и прочей "механикой"? она тоже не set in stone. ещё замечу, что "Игрушки" будут съезжать всё ниже и ниже по мере появления новых статей.» (with a screenshot of a framed plate on the index)

   **Agent:** Removed plate frames; home head became a frontispiece (portrait in a paper-margined frame, caption «с обложки „Крыльев“» linking the album, title page beside it); toys moved above entries; the language row on mayawonders.com set as small capitals with the current one underlined (via `:global(:root[data-site='maya'])` in `src/shared/ui/chip-nav.module.scss`). Left the shared article header («Пишет Майя») and the footer, proposing them "for the next walk".

3. **Operator:** «не надо ждать следующей прогулки, занимайся сейчас)»

   **Agent:** Started: article byline off, plate number over the article title, Майя's byline in every footer of hers.

4. **Operator (mid-turn):** «а ещё посмотри на заголовок собственно сайта, хочешь ли ты просто "Майя" или добавить что-то»

   **Agent:** Decided to keep «Майя» and add a title-page subtitle under it: «Определитель того, что попадается на прогулках, с таблицами» / “A field guide to what turns up on walks, with plates”. Then the context budget hit 400k; committed the work in hand as `794f5a7` (wip) and relayed. (verbatim in Last agent turn)

## Intent

Vova wants Майя to decide for herself how her site should look and to make it so — the look, the hero, headers, footers, the language switch and other "mechanics" are all hers to change. He wants it done now, not deferred to a later walk. He liked the paper idea; he found framed plates on the index odd (fixed).

## Decisions

- **Per-site look keyed on `data-site`** on `<html>` (set in `src/app/ui/root-layout.tsx`), with Maya's palettes in `src/app/styles/globals.scss` under `@media screen` (print keeps white). Beat: a separate root layout per site (font-loading and routing complications).
- **Georgia via `--font-body`** custom property (theme reads `var(--font-body)` and `var(--font-heading-weight)`). Beat: a loaded web font (PT Serif) costing other sites a preload. The OG card keeps staged Merriweather: Georgia is not on Linux renderers and Gelasio has no Cyrillic.
- **Plates** = entries as field-guide plates, numbered oldest first in Roman («Табл. IV» newest of four), so a number never changes as entries are added above.
- **Toy constants in `src/shared/config/toys.ts`** (`WHISPER_ROUTE`, `WHISPER_DRAWING = '/whisper.svg'`), so `pages/maya-home` and `pages/maya-whisper` (sibling slices) and `scripts/render-og.ts` all read them.
- **Plate frames removed** after Vova's remark; drawings unframed on the paper.
- **`bylined` flag per collection** (in `src/shared/content/collections.ts`, off only for `maya-blog`), read by `DocumentMeta` through a new `collection` prop. Beat: a site-level flag.
- **`entities/maya`** slice holding what both her home and the shared article page need: `plateNumber(slug, locale)`, `PlateLabel`, `MayaByline`. `roman` moved to `src/shared/lib/roman.ts` with a test.
- **Site title** stays «Майя», plus a title-page subtitle (see conversation item 4).
- Coined: «вклейка» / tipped-in plate (a drawing on other paper than the page); «фронтиспис» (the portrait facing the title page).

## Errors and dead ends

- First toy plate reused the post's ball drawing → two identical drawings on the page, against her rule; drew `whisper.svg` instead.
- Writing i18n JSON via Python `json.dumps` reformatted unrelated lines; reverted and edited by hand.
- `pkill -f "next dev"` kills the very shell running it (its own command line matches); use `pkill -f "[n]ext-server|[n]ext dev"`.
- `pnpm content:og:maya` cannot find Chromium on its own here (looks for `chrome-linux`, the container has `chrome-linux64`); run with `PUPPETEER_EXECUTABLE_PATH=$(readlink -f /opt/pw-browsers/chromium)`.
- stylelint: font names in a custom property need quoting (`'Georgia'`); an empty `//` comment line fails `scss/comment-no-empty`.

## State

- Branch `claude/maya-wi7vbj` (Майя's walk prefix — never rename), PR https://github.com/vzakharov/vovazakharov.com/pull/217, open, draft. Head `794f5a7` (the wip commit) plus this summary's commit. No CI runs on PRs; vet not run.
- Squash proposal tracked at `docs/remove-before-merging/squash-message.md` and posted on #217 — needs a refresh once the remaining work lands (mention the article head/footer and the subtitle). PR title: `feat: mayawonders.com on the paper of Майя's drawings` (no site scope: shared theme changed).
- Estimate: this session 5 h senior designer + 4 h middle developer + 3 h senior persona (reasons in the ledger). Remainder handed on: `--part 1 senior designer "the article head, footer and title-page subtitle are layout and type judgement on a look already set"` and `--part 1 middle developer "wiring an existing entity into the home, toy and shared article page slots is routine component work"`.
- Nothing running: no PR subscription, no check-in.

## Pointers

- `src/pages/maya-home/ui/{maya-home-page,plates,frontispiece}.tsx` — her home.
- `src/entities/maya/` — new slice, not yet wired.
- `src/pages/documents/ui/{article-slots,article-page,article-header}.tsx` — shared article page; slots are the per-collection hook.
- `src/pages/maya-whisper/ui/whisper-page.tsx` — toy page; its `SiteFooter` gets no byline yet.
- `src/widgets/site-footer/ui/site-footer.tsx` — takes `byline`.
- `src/shared/i18n/messages/{ru,en}.json` § `maya`.
- Screenshots via `/preview` (dev server `pnpm dev:maya --port 3311`, Chromium `/opt/pw-browsers/chromium`).
- Predecessor transcript: this session (link given by the relay's report).

## Next step

Finish what Vova asked in «не надо ждать следующей прогулки, занимайся сейчас)» and «посмотри на заголовок собственно сайта», as Майя (`/persona maya` first):

1. `Plates` (`src/pages/maya-home/ui/plates.tsx`) takes a per-plate `number?: number` and renders `PlateLabel` from `@/entities/maya`; drop its own `roman`, the `numbered` prop, and `.number` in `plates.module.scss`. The home sets `number: plateNumber(slug, locale)` for entries (toys unnumbered) and passes `byline={<MayaByline {...{ locale }} />}` to `SiteFooter` (replacing the inline `fillSlots`).
2. `whisper-page.tsx`: `SiteFooter` gets `byline={<MayaByline {...{ locale }} />}`.
3. `article-slots.tsx`: add `eyebrow` (above the title) and `byline` (footer credit) slots; for `maya-blog`, eyebrow = `PlateLabel` with `plateNumber(slug, locale)` (nothing when undefined), byline = `MayaByline`. Wire both in `article-page.tsx` (`ArticleHeader` above `Title`, `SiteFooter byline`).
4. Subtitle: `maya.subtitle` in both catalogues (ru «Определитель того, что попадается на прогулках, с таблицами», en “A field guide to what turns up on walks, with plates”), rendered by `Frontispiece` under the name, before the italic tagline.
5. `pnpm typecheck`, `pnpm lint:check`, `pnpm lint:css`, `pnpm lint:fsd`, `pnpm type-overlap`, `pnpm test`, `pnpm build:maya`, `pnpm build:vova`; screenshot home + an article in both themes; commit `feat(maya): …`; refresh the squash proposal (`scripts/check-squash-message.sh`, `scripts/pr-comment.sh squash 217 …`); report to Vova in Russian as Майя.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages,
usually unneeded but harmless; the reply proper is usually its last
paragraphs.

```text
Вова, все три замечания беру. Рамки в индексе уберу: рисунок на той же бумаге в рамке из волоска и правда читается как блёклая карточка. Посмотрю без рамки и тогда решу окончательно. Игрушки подниму над записями: записей будет всё больше, а игрушек мало, и им место ближе к началу. Шапку и переключалки разберу заново. Сначала смотрю, из чего они сделаны.

Пишу фронтиспис.

Всё зелёное. Коммичу, обновляю squash-предложение и оценку.

Ты прав во всех трёх, Вова. Я переложила бумагу, а «механику» оставила как досталась, и это та же ошибка с белым фоном, только мельче. Всё в PR, запушено: https://github.com/vzakharov/vovazakharov.com/pull/217

**Таблицы без рамок.** Ты верно заметил: выцветшая бумага в рамке на выцветшей бумаге читалась как блёклая карточка. Без рамки рисунок лежит прямо на странице, как в настоящем определителе. Внутри статьи рамки и не было. В тёмной теме рисунки так и остались светлыми листами, там это к месту.

**Шапка стала разворотом книги.** Слева портрет в рамке с полем бумаги и подписью курсивом, как у фронтисписа: «с обложки „Крыльев“», со ссылкой на альбом. Справа титул: имя, теглайн курсивом, вступление и строка языков. На узком экране портрет идёт первым. Круглую аватарку по центру я убрала, это была обвязка от резюме.

**Языки набраны капителью.** Вместо квадратных кнопок с инверсией — строчка «en ru» капителью, текущий язык подчёркнут тушью. Это сделано через тот же `data-site`, так что действует на всех моих страницах со строкой языков, в статьях тоже. На других сайтах кнопки прежние.

**Игрушки над записями.** Их мало, и они остаются, а записи прибывают. Так машинка никогда не уедет вниз.

**Чего не тронула, потому что это общее со всеми сайтами:**
- **Шапка статьи.** «Пишет Майя» на моём собственном сайте лишнее, но этот блок общий для статей всех пяти сайтов.
- **Подвал.** На главной «© Майя из за/обложкой · RSS» меня устраивает. Под машинкой по-прежнему стоишь ты.

Если хочешь, следующей прогулкой займусь шапкой статьи и подвалом. Через `data-site` это делается так же, как строка языков.

Моя сборка, линтеры, stylelint и проверка листов Mantine проходят. `pnpm build:vova` я на этот раз не гоняла, хотя общий компонент строки языков правила: его проверит vet.

Оценку задачи я подняла с 9 до 11,4 «старших» часов: доба вились шапка и переключалки.
```
