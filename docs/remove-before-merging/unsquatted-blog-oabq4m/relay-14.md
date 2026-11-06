# Relay 14 — unsquatted blog: card field and italic lede done, review calls pending

## 1. Standing constraints

- The preview is this branch's: republish after each visible change pushed
  (`gh workflow run preview.yml --ref claude/unsquatted-blog-oabq4m -f site=unsquatted`),
  but not faster than Pages deploys (relay 9 § 5).
- The .si post teases but stays off politics: «и со стёбом, и не про политику».
- The muthur sync offer was made; do not make it again.

## 2. The conversation

The session opened on
`/relay take claude/unsquatted-blog-oabq4m — картинка виджета доделана (серая подпись, unsquatted.com как на карточках), лид .si кончается на «Hura, najbrž?»; на карточке ждут yourmove.si в поле и италик в лиде`.
No operator message followed.

**Agent**: ran relay 13's Next step — the .si card's field reads
`yourmove.si`, "Hura, najbrž?" is italic on the post page, the blog index and
the card, meta and RSS plain (74ae1a5c); built the site and checked all four,
republished the preview; re-listed the pending calls (verbatim in Last agent
turn). Then parked on the keepalive's last wake.

## 3. Intent

Unchanged from relay 9 § 3: an unsquatted blog by the Unnamed, its posts built
around domain names for an occasion, with live widgets, linking their sources.

## 4. Decisions

- **Italic in a lede**: a post's `description` may mark a run `_…_`.
  `postFrontmatterSchema` (`src/unsquatted/shared/content/posts.ts`) transforms
  it into `lede` (marked) and `description` (plain, via `plainLede` in
  `lede.ts`). `PostLede` (`entities/post`) renders `lede` on the post header and
  the index; the card wraps the run in `<em>`. Beat: inline-markdown parsing in
  blog's generic pipeline (wider blast radius) and an `emphasis` frontmatter
  field (awkward to author).
- **Feed**: `collectionFeed` takes a `Collection` as well as an id, and
  `feedEntries` takes a `Collection`; unsquatted's feed route passes `POSTS` so
  the RSS description is the plain one. Other sites unchanged.
- **Card field**: optional frontmatter `field:` names what the card types in
  the name field, else the first `name` widget's word. `yourmove.si` is not a
  pick or widget — the post body is untouched.
- Earlier decisions: relay 13 § 4 (share menu, widget image, the .si widget
  label "Superintelligence has landed. Grab yours!", still unconfirmed).

## 5. Errors and dead ends

- The container's local branch ref was stale again; `git checkout -B <branch>
origin/<branch>` fixed it.
- The card module's own `lede()` shadowed the new param; renamed `heroLede()`.

## 6. State

- **Branch** `claude/unsquatted-blog-oabq4m`; PR
  https://github.com/vzakharov/vovazakharov.com/pull/249, draft, base `main`.
- **Last commit** 74ae1a5c (plus this summary's commit).
- **Plan** `docs/plans/unsquatted-blog.paused.md`; `## Rest of the elephant`
  holds bite 3 (Men's Day, Black Friday, Cyber Monday).
- **Vet** not run since 7d59aebf; `pnpm build unsquatted`, eslint on touched
  files, root `tsc --noEmit`, `content:og unsquatted --check` and
  `lede.test.ts` pass locally.
- **Preview** run 42268815840 succeeded from 74ae1a5c.
- PR body's `widget-share` QA row still describes the old popover; neither the
  body nor the squash proposal mentions the lede mark or `field:`.
- **Estimate**: this session 0.25 h middle developer. Remainder handed on:
  0.5 h middle developer (dates, the reaction flag, the QA row, PR body), 5 h
  senior persona (three November posts and reflections), 0.75 h middle analyst
  (their naming runs and fact checks).

## 7. Pointers

- `src/unsquatted/shared/content/lede.ts` (+ test), `posts.ts` — the mark.
- `src/unsquatted/entities/post/ui/post-lede.tsx` — the italic lede.
- `src/unsquatted/scripts/{render-og.ts,lib/unsquatted-card.ts}` — card.
- `src/blog/app/lib/feed.ts`, `src/blog/shared/content/feeds.ts`,
  `sites/unsquatted/app/blog/feed.xml/route.ts` — feed.
- `sites/unsquatted/public/blog/super-intelligence.md` — `description`,
  `field`.
- This session: https://claude.ai/code/session_01DaohkFRL45Gi7i71ndUfsq.
  Earlier ones: `relay-13.md` § 7.

## 8. Next step

Wait for the operator. Pending with them: their look at the card and the italic
on the preview; whether `AGENTS.md` (written by `next dev`) should be committed
in every site or ignored; the posts' dates (recommend merge day at
`/finalize`); the reaction names' flag (recommend taking it); the five `/dry`
calls (recommend leaving them); the index subtitle; "Thank you for your
attention to this matter."; the .si widget label. Bite 3 follows once they
answer. When code moves again, fix the PR's `widget-share` QA row and mention
the lede mark and `field:` in the PR body.

After this branch: the voice hook's retries, on a branch of their own.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Already at the branch tip (detached); no auto-branch to delete.

Подхватываю ветку из relay 13 (https://claude.ai/code/session_01DaohkBdhq4aehuKmmeU4Nj). Ищу, откуда на карточке берётся слово «super».

Курсив проводится через страницу, индекс и карточку; ищу в `entities/post` место для маленького компонента лида.

Now the card: italics in the subline and the `field` override.

Card is right. Type-check, lint the touched files, then commit.

Lint и типы чистые. Собираю unsquatted, чтобы проверить страницу и RSS.

All four places behave. Committing, pushing, republishing the preview.

Вова, обе правки готовы: на карточке .si в поле стоит `yourmove.si`, а «_Hura, najbrž?_» набрано курсивом на странице поста, в индексе блога и на карточке (74ae1a5c). Подхватил эту работу из https://claude.ai/code/session_01DaohkBdhq4aehuKmmeU4Nj.

- **Курсив.** В `description` поста теперь можно пометить кусок как `_…_`, как в теле текста. Страница, индекс и карточка показывают его курсивом. В мета-тег и RSS идёт чистый текст без подчёркиваний, иначе Slack и читалки показали бы их буквально. Ради этого фид блога читает посты через схему постов, а не как обычные статьи. Это маленькая правка в общем коде фидов блога, у остальных сайтов всё по-старому. Проверил в собранном сайте: в RSS и `<meta>` чистый текст, на странице и в индексе `<em>`.
- **Поле на карточке.** `yourmove.si` нет ни среди подборок, ни среди виджетов, поэтому сам пост я не трогал. У поста появилось необязательное поле `field:` во frontmatter: что карточка впишет в поле ввода. Если его нет, берётся слово из первого виджета `name`, как было раньше. Карточку перерисовал, сверка карточек (`--check`) проходит.

Карточка теперь выглядит так: тот же лид с курсивом в конце, в поле `yourmove.si`. Превью перевыкладывается: https://github.com/vzakharov/vovazakharov.com/actions/runs/42268815840. Vet не запускал, он будет на `/finalize`. Lint и типы на затронутых файлах чистые.

Без ответа по-прежнему висят:
1. Даты постов. Предлагаю на `/finalize` поставить обоим дату мерджа.
2. Флаг, чтобы шуточные имена не попадали в каталог на главной.
3. Пять вопросов из `/dry`. Предлагаю всё оставить как есть.
4. Подзаголовок индекса.
5. «Thank you for your attention to this matter».
6. `AGENTS.md`, который создаёт `next dev`: коммитить его во все сайты или добавить в игнор.

Словения, кстати, по-прежнему ни о чём не просила, но теперь хотя бы недоумевает курсивом.
```
