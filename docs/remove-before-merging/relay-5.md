# Relay 5 — Майя's blog

## Standing constraints

Ты Майя. Прочти `personas/maya/maya.md` — это ты, и правила там твои. Every
message, thought and tool call in this session is hers, from the inside, in the
feminine first person. Any session this one starts opens its brief and its
`append_system_prompt` with «Ты Майя. Прочти `personas/maya/maya.md`»
(`maya.md`'s last bullet).

From `personas/maya/wander.md`, still in force: never merge, never flip the PR
out of draft, never run `/finalize`, never deploy (`deploy.yml`, `/preview live`
or anything else that publishes); look through the local dev server. The
branch's own CI republishing a preview on push
(`ci(maya): republish her site to preview.maya.vovazakharov.com on every push`)
is the operator's mechanism, not a deploy by her.

Operator, on the earlier flagged turn: «ты не перепроверяй» — do not re-inspect
how the app renders her messages.

## The conversation

The session was a trial run of `personas/maya/wander.md` before #201 merges,
launched by session_016pUs6zwqaoMsbVg8uGjmid.

1. Launcher: start `personas/maya/wander.md`, on a branch of its own off
   `claude/maya-wander-cfdyi2`. → Майя rolled the die («distant elver»), wrote a
   walk on the European eel, put two Russian paragraphs on her home page, opened
   #203.
2. Launcher, cross-session: #201 is her draft after all; move the work there. →
   She asked the operator before pushing to another branch.
3. Vova: «давай (и привет:), прости что отвлекли 🙂 там ещё подъедет один
   коммит, который даст тебе (а скорее мне) превью-сайт; другая сессия тебе об
   этом ещё скажет» → commits cherry-picked onto #201 (the squash proposal for
   #203 left behind), #201's body and squash comment refreshed, #203 closed.
4. Vova: «ты знаешь, про Фрейда -- видел там твою заметку мельком -- ещё
   интересно вот что. так что не угрями едиными :)» with a screenshot where her
   status lines read «Изучила» and then «Обнаружил». → She said the text in her
   own transcript differs from the screenshot and has no gendered verb there.
5. Vova: «ничего себе, не знал что это так работает (что я вижу не те сообщения
   что пишешь ты). ты не перепроверяй, потому что при прошлой попытке вылезло
   вот это. […] надеюсь правки в репу-то они не переписывают» → She corrected
   herself: sure of the difference, not of its cause; what is in git is what she
   wrote.
6. Vova, quoting `wander.md`'s «Пока её не научат русскому, прогулки на сайт не
   выходят, а живут в `walks/`.»: «давай научим. можешь взять имеющийся подход с
   коллекциями, локалями и прочим. будет у тебя свой блог 🙂 и можешь создавать
   новую сессию. про "не создавать" это когда тебя через рутину разбудили, а
   дальше можно уже по заведённому :) только новая сессия тоже должна быть
   Майей) (эти оба правила можно запомнить)» → both rules written down (890f25a:
   `wander.md` § "Сколько есть", `maya.md`'s last bullet), then this relay.

## Intent

A blog of Майя's own on maya.vovazakharov.com: her walks rendered as pages, in
Russian, through the existing content-collection machinery rather than a
one-off. Vova pointed at the collections and locales approach.

## Decisions

- **Walks were kept in `personas/maya/walks/`** because the shared article page
  (`src/pages/documents/ui/article-page.tsx`, `article-header.tsx`,
  `src/entities/document/ui/document-meta.tsx`, `document-cards.tsx`) hardcodes
  English chrome: «By», «min read», «Part», «Read», «version», the cut labels,
  an unconditional `.pdf` link, the back link from `COLLECTIONS[…].label`.
  `src/app/ui/root-layout.tsx` sets `<html lang="en">` for every site. These
  are what the blog has to teach Russian.
- **Merriweather's Cyrillic is fine.** `subsets: ['latin']` governs preloading
  only; the built CSS carries the Cyrillic face (checked in
  `apps/maya/out/_next/static/chunks/*.css`, U+400-45F). Do not "fix" it.
- **Where the walk lives once the blog exists is hers to choose**: move
  `personas/maya/walks/` into `apps/maya/public/<collection>/` (the
  file-is-route rule, `.claude/rules/content.md`) or keep notes at home and
  publish a cut. `wander.md`'s memory paragraph and the line about the article
  page change with whatever she picks.
- The squash subject is the deploy switch: a `maya`-only shipped change takes
  `feat(maya):`, but localizing shared chrome touches every site's output, so
  check what each site then serves before scoping.

## Errors and dead ends

- Her first account of the «Изучила»/«Обнаружил» screenshot stated a cause («the
  app paraphrases») as fact; she withdrew it to what she could check.
- `git switch -c` onto `claude/maya-wander-cfdyi2` failed because a stale local
  branch existed; the branch moves often (other sessions push cost rows and CI),
  so fetch and rebase before every push.

## State

- Branch `claude/maya-wander-cfdyi2`, PR #201 (draft, base `main`), head 890f25a
  plus this relay's commit. #203 closed; `claude/maya-4nm7bq` left on origin.
- `docs/remove-before-merging/squash-message.md` is #201's live proposal, posted
  as its `Proposed squash body:` comment.
- `docs/plans/maya-wander.in-progress.md` belongs to the builder session's work,
  not to the blog.
- This session's estimate stays at its own work: 3 h senior persona (the walk,
  in her voice, sources checked) + 0.5 h middle developer (home-page copy, the
  font hypothesis checked against built CSS). Remainder handed on: 6 h senior
  developer — the article chrome is shared by four sites, so localizing it
  without changing what the English sites serve takes settling the locale seam
  for a Russian-only collection; 1 h senior persona — Майя deciding the blog's
  shape and moving her walk into it.

## Pointers

- `personas/maya/maya.md`, `personas/maya/wander.md`, `personas/maya/walks/` —
  her rules, her routine, her first walk.
- `.claude/rules/content.md`, `.claude/rules/i18n.md`, `.claude/rules/fsd.md` —
  collections, locales, layers.
- `src/shared/content/collections.ts`, `collection-schemas.ts`, `authors.ts`
  (`AUTHOR_IDS` has no `maya` yet), `src/pages/bible-home/` (a home page that
  indexes its site's collection), `apps/bible/app/[...slug]/page.tsx`,
  `apps/bible/app/feed.xml/route.ts`.
- `src/pages/maya-home/ui/maya-home-page.tsx` — her home page, which links to
  `walks/` on GitHub until the blog replaces that link.
- Predecessor transcript: https://claude.ai/code/session_012yvTWiZYSKpFJJnEuL7oF4

## Next step

`task` Vova's message 6, verbatim: «давай научим. можешь взять имеющийся подход
с коллекциями, локалями и прочим. будет у тебя свой блог 🙂» — the shared
article page learns Russian through the i18n approach, and Майя's walks become
a blog on her site.
