# Relay 4 — unsquatted blog, post 1 written and built, polish and the pre-9.11 build question left

## 1. Standing constraints

None stated beyond the repo's own conventions.

## 2. The conversation

This session had no operator messages of its own. It opened on
`/relay take claude/unsquatted-blog-oabq4m — Код первого захода в ветке: роутеры, индекс, виджеты, штамп в каталоге и сверка; осталось написать первый пост, его карточку и отклик и собрать превью`
and ran relay 3's Next step: `/go` on the paused plan, as the Unnamed
(`/persona unnamed`). It stopped when the context budget warning came at ~217k.

**Agent** (the only turn): it checked the facts, wrote post 1, drew the post
card, fixed the build, looked at the page, had the reflection written,
published the preview, then paused the plan and relayed
`(verbatim in Last agent turn)`.

## 3. Intent

Unchanged from relay 1 (`relay-1.md` § 3): a blog on unsquatted.com run by the
Unnamed, four holiday posts with live domain widgets, post 1 (Singles’ Day)
first for the operator to tune on preview, all in PR #249, merged by 10.11.

## 4. Decisions

Relays 1–3's § 4 stand. This session added:

- **Post 1** is `sites/unsquatted/public/blog/singles-day.md`, "Four Bare
  Sticks", `date: 2026-11-09`. Facts and their sources: the Nanjing University
  dorm story of ~1993 is hedged as lore (Wikipedia, LARB China blog); 光棍 means
  bare stick, i.e. bachelor; Taobao Mall's 2009 sale had 27 brands and about
  52M yuan (BoF, SCMP); 268.4bn yuan in 2019 (China Daily); about $85bn in 2021
  over 11 days (Statista citing Alizila); Alibaba stopped publishing the figure
  in 2022, saying only "in line with last year" (Reuters via Yahoo/The Star). The
  "numerology that makes 1111 worth money" from the plan was left out as
  unverified. These sources still have to go to the operator with the draft
  (plan § 5).
- **Post cards**: `render-og.ts` draws a card per written post, embargoed ones
  included, with `postCard` in `scripts/lib/unsquatted-card.ts` (the site card's
  template split into `card()` plus two callers). The card's words are the
  post's title, description and eyebrow; its panel is the first `domains` list;
  its field holds the first `name` widget's word.
- **`compileBody`** is new in blog's `render.ts`: a script cannot use
  `ContentDocument`/`renderDocument`, because reading the document resolves the
  `og.png` the script is about to draw. So `postWidgets(source: ProseSource)`
  compiles the body, `postDomains(document)` keeps `renderDocument`, and both
  read through one `widgetsIn(tree)`. The script gets the body from `loadProse`
  and the title and frontmatter from `readCollection`.
- **The widget parsers** (`widget-attributes.ts` and its test) moved from
  `pages/post/lib` to `unsquatted/shared/content`, exported from its `index.ts`,
  so the page and the card script share them.
- **One `name` note was rewritten** after the live verdicts contradicted it
  (single.com was taken in 1998, solo.com in 1994): "The first word anyone thinks
  of, which is exactly the problem."

## 5. Errors and dead ends

- `verdict-label.module.scss`'s `@use` was one `../` too deep after the FSD move
  (bd2bba66). Only a build reaching the widgets showed it.
- `listWrittenDocuments` in the card script throws on the missing card (see
  `compileBody` above).
- `pkill -f "next dev"` inside a chained command killed the shell (exit 144);
  run it on its own.
- **Open: a build dated before 9.11 fails.** See § 8.

## 6. State

- **Branch** `claude/unsquatted-blog-oabq4m`, pushed; head 79ca76b4 before this
  file's commit.
- **PR** https://github.com/vzakharov/vovazakharov.com/pull/249 (draft),
  `CONFLICTING` against `main`, which `/finalize` handles. Its body and squash
  proposal are still relay 1's.
- **Plan** `docs/plans/unsquatted-blog.paused.md`. `## Eaten so far` lists what
  is built; `## Rest of the bite` lists what is left, the open question first.
- **Checks**: typecheck passes. `CONTENT_AS_OF=2026-11-11 pnpm build unsquatted`
  passes (index, post, feed, sitemap). Without the variable it fails (§ 8).
  `pnpm content:og unsquatted` rendered the card, and the site card is
  unchanged. No lint, test or vet run this session.
- **Looked at**: post and index on the dev server, light theme. Dark is captured
  but not yet looked at.
- **Preview**: run 41862498655 published the branch at bd2bba66 (post with the
  old note) to preview.vovazakharov.com, as of 2026-11-11. Run 41865537677, at
  fbfcf240 (the head before the pause), was still queued at relay time:
  `gh run view 41865537677 --json status,conclusion`. Another branch,
  `claude/in-browser-llms-unsquatted-24jeaq`, also publishes unsquatted to the
  same slot and may have replaced it.
- **Estimate**: this session 1.5 h senior developer + 2 h senior persona + 1 h
  middle analyst. Remainder, handed on:
  - 0.5 h senior developer — the pre-9.11 build fix and the polish passes;
  - 1 h middle designer — tuning the widgets and card against the mockups;
  - 6 h senior persona — three posts and their reflections;
  - 2 h middle analyst — three naming runs and fact checks.
- Nothing else is running.

## 7. Pointers

- `docs/plans/unsquatted-blog.paused.md` — the contract for what is left.
- `relay-1.md` (the planning conversation), `relay-2.md` and `relay-3.md`
  beside this file.
- `sites/unsquatted/public/blog/singles-day.md` and
  `singles-day.unnamed.reflections.md`; `personas/unnamed/unnamed.md` now lists
  four things he has learned about himself.
- `src/unsquatted/scripts/render-og.ts`, `scripts/lib/unsquatted-card.ts`,
  `src/unsquatted/shared/content/post-domains.ts`,
  `src/blog/shared/content/render.ts` (`compileBody`).
- `src/blog/pages/article/page/ui/article-page.tsx` — `generateStaticParams`,
  where option (a) of the open question would go.
- Transcripts: this session
  https://claude.ai/code/session_01DaohkEYm1qr1UeGqXdeoHK; relay 3's
  https://claude.ai/code/session_01DaohkBhN78jPH9ka7NgKrX; relay 2's
  https://claude.ai/code/session_01DaohkFVQ8is9WA4hHjtj6A; relay 1's
  https://claude.ai/code/session_01DaohkEGHokggMHnD6egoGN.

## 8. Next step

Resume the paused plan with `/go` from its Step 1 and finish bite 1 from
`## Rest of the bite`. The go-ahead is the operator's «так го :)», recorded in
413dadb3.

**First, ask the operator, numbered, and carry on with everything the answer
does not block** (their preference: do not stop on a question the rest of the
work can go on without). Before 9.11, `blog/[...slug]` gets no params, because
post 1 is embargoed, and Next's static export refuses an empty
`generateStaticParams`. So vet, a merge or the daily deploy before 9.11 fails.
The options:

- (a) blog's `articleRoute` returns one reserved param when a collection has
  nothing out, its page a `notFound()`. Recommended: it holds for any
  collection's first post, at the cost of one stray 404 page.
- (b) Run vet and merge only on or after 9.11.
- (c) Date post 1 earlier, so it publishes on merge.

Then look at the dark theme, run Step 3's `/polish`, and run `/pr` to refresh
the PR body and squash proposal (the slots deviation, the card seam,
`compileBody`). Report to the operator with the preview link and the post's
sources. Bite 1 ends there, with a pause for the operator's review of tone and
look. The merge deadline is 10.11.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Flip the plan and read it.

Unnamed на связи, Вова. Проверяю факты для поста про 11.11 — Нанкин, «голые палки», Алибаба; дальше сам текст.

Now the post itself.

Now the basilisk precedent for the per-entry card.

Types pass. Render the cards.

Now post-domains: a pure reader over a tree, and the two entries.

Both cards render; the site card is unchanged. Commit and build.

A leftover from the FSD move: the moved stylesheets kept the old directory depth. Find all of them.

The post is embargoed until the 9th, so today's build has no post pages at all, and Next refuses an empty `generateStaticParams`. First let me see the rest of the build as of the post's date.

While the reflection is written, I'll record the pause in the plan.

Waiting on the reflection before committing the pause.

Two background jobs are running: the reflection and the preview publish. I'll pick up when they report.

Waiting on the preview run, then pause and relay.

The reflection is committed. I'll finish once the preview publish reports back.
```
