# PR #52: feat(lsa): the Bible, latestageagentic.com's article collection

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/52
- **Author:** @vzakharov (human)
- **Base ← Head:** main ← claude/lsa-bible-obbcfw
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-09-16T22:06:34Z
- **Updated:** 2026-09-17T11:57:53Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## Summary

- **«Библия» is real**: `latestageagentic.com` serves an article collection at [/bible](https://latestageagentic.com/bible), seeded with three articles written off the recordings that landed in 3b1e8e8 — the web-not-the-console argument, the four TEND lenses, and what it means that an agent takes what it finds for what must be. Each was recorded as a script for the Russian channel and is rewritten here in the register the site is for: the position first, then what earns it.
- **The index opens on prose of its own.** Added at the go-ahead: `/bible` says what the collection is, why the name is a joke doing real work, and what "as of writing" means, before the reader meets the first categorical article. The copy lives in `src/pages/documents/ui/collection-intros.tsx`, keyed by collection — the case studies keep just their one-line description.
- **An article is built through the case study's own pipeline**, which assumed one site in four places. A collection now names the site that serves it, and the sitemap, the document walk and the render scripts iterate `collectionsForSite()` instead of every collection there is. `src/pages/case-studies` is `src/pages/documents`, and its index and article are factories a router binds to one collection.
- **`@/shared/config` and `@/shared/seo` split by what a client bundle may hold**, which is what lets `NEXT_PUBLIC_SITE` be parsed with `z.enum` rather than matched. The ids and both sites' data stay in the ordinary barrel; everything bound to the site this process is — `SITE_ID`, `SITE_CONFIG`, `pageFile`, `printedUrl` — sits behind `index.server-only.ts`, and the environment read and its schema sit in a module the render scripts can still import from bare Node. Measured after: 754,342 bytes of client JS on vova, with zod in no chunk of either site.
- **The print lane serves both sites**: it resolves its site from `NEXT_PUBLIC_SITE`, prints the CV only for the site that has one, and ships as `content:pdf:vova` and `content:pdf:lsa`, which `vet.sh` runs as two fan-out entries (one combined script would take `--check` on the second command only). Both render runs are in the branch — the Bible's three PDFs, and vova's, which re-render because every printed page hashes `src/shared/config` and the document components.
- **Two defects the Bible exposed.** A document with no shorter cuts rendered a one-chip switcher reading "Full", offering the page the reader was already on; it appears only where there is something to switch to. And an aside image set near the foot of a section floated past the section's end and squeezed the next heading into the margin beside it — a prose heading clears floats now, as a pull quote already did.

## QA Checklist

- [ ] `index-copy` — open `/bible` in both themes: the lede, the three paragraphs under it, then the cards. This is the part written "от себя" and the one most likely to want rewording
- [ ] `articles` — read the three end to end against the recordings in `writing/late-stage-agentic/dictations/`: each states its position before arguing it, and no "about this later" links at a file the site does not serve
- [ ] `pull-quotes` — pull quotes are centred and an aside image no longer bleeds into the next heading; check `/bible/inevitability-fallacy`, which has both
- [ ] `pdf` — open `apps/lsa/public/bible/inevitability-fallacy.pdf`: the printed footer carries `latestageagentic.com`, and the pull quote no longer lands at the foot of a page. Pagination on paper is the one thing this branch could not verify in its own container
- [ ] `vova-untouched` — `/case-studies` and its article still render as before; the slice rename, the router change and the barrel split are behaviour-free there
- [ ] `render-checks` — `pnpm content:pdf:vova --check` and `pnpm content:pdf:lsa --check` both report nothing to render

| Item             | Automatable | Covered? | Notes                                                          |
| ---------------- | ----------- | -------- | -------------------------------------------------------------- |
| `index-copy`     | No          | No       | A judgement about copy; `/preview` captures are in the session |
| `articles`       | No          | No       | Prose against its source recording                             |
| `pull-quotes`    | Partly      | No       | The float bug had no test; the fix is one `clear`              |
| `pdf`            | Partly      | No       | The hash check proves freshness, not that the page prints well |
| `vova-untouched` | Partly      | Yes      | `pnpm build` renders every route; the eye check is the layout  |
| `render-checks`  | Yes         | Yes      | Both run clean; `vet.sh` runs them as separate entries         |

https://claude.ai/code/session_01S4mmZqcrrkTkFp51PuYJ3s
https://claude.ai/code/session_01HwGArMvobF5JqTYjmKXRSN

---

## Comments

- **C01** @vzakharov (agent) — 2026-09-16T22:07:00Z — "Proposed squash title/body: ``` feat: the Bible, latestageag…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-09-16T22:07:00Z

[https://github.com/vzakharov/vovazakharov.com/pull/52#issuecomment-5705257845](https://github.com/vzakharov/vovazakharov.com/pull/52#issuecomment-5705257845)

Proposed squash title/body:

```
feat: the Bible, latestageagentic.com's article collection (pr #52)
```

```
latestageagentic.com served one page and an empty Writing section.
The wiki behind it -- «Библия», categorical by design, because an
article that weighs both sides is the cardboard a model writes by
default -- now exists at /bible, seeded with three articles: that an
agent takes what it finds for what must be, the four lenses
/tend-prose runs, and why to drive agents from the web client rather
than the console. Each was recorded as a script for the Russian
channel and rewritten here in the register the site is for: the
position first, then what earns it. The index opens on prose of its
own, the name being a joke that has to land before the articles do.

An article is built through the case study's own pipeline rather than
beside it, and that pipeline assumed one site in four places. A
collection now names the site that serves it, and the sitemap, the
document walk and the render scripts read that rather than every
collection there is. The page slice, pinned to case studies by two
constants, is src/pages/documents, bound to a collection by the
router that mounts it. The print lane learns which site it renders,
so a Bible article carries its PDF on the same machinery.

Two sites out of one src also made a boundary load-bearing that was
not: shared/config and shared/seo split by what a client bundle may
hold. Both sites' data stays in the ordinary barrel, everything bound
to the site a process is sits behind index.server-only.ts, and the
environment read resolving which sits where bare Node can import it,
since the render scripts do. That is what lets NEXT_PUBLIC_SITE be
parsed rather than matched: through the CV sheet the parse had been
putting zod in the browser, at half the client bundle again.

The articles asked the pipeline for a :::pull-quote fence, set
centred and outside the reading estimate because the reader meets the
sentence twice; an 'aside' link title floating an image beside the
text; an `order`, three articles written one afternoon having dates
that place them arbitrarily; and a height bound on screen, as images
had on paper. They surfaced three defects -- a one-chip cut switcher
offering the page the reader was on, an aside squeezing the next
heading into the margin, and links at ideas/ files nothing serves.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `apps/vova/public/case-studies/playgram.mini.pdf`:1 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:01Z — "Импорт-чейны, ничего внутри самих PDF. `render-pdf.ts` счита…" → [threads/01-apps-vova-public-case-studies-playgram-mini-pdf.md](threads/01-apps-vova-public-case-studies-playgram-mini-pdf.md#t01)
- **T02** `src/pages/documents/ui/collection-intros.tsx`:32 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:02Z — "Убрал. 629af17" → [threads/02-src-pages-documents-ui-collection-intros-tsx.md](threads/02-src-pages-documents-ui-collection-intros-tsx.md#t02)
- **T03** `src/pages/documents/ui/collection-intros.tsx`:46 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:04Z — "Убрал весь абзац. 629af17" → [threads/02-src-pages-documents-ui-collection-intros-tsx.md](threads/02-src-pages-documents-ui-collection-intros-tsx.md#t03)
- **T04** `src/shared/config/site-ids.ts`:34 — unresolved — last: @vzakharov (human) 2026-09-17T11:57:53Z — "у тебя есть шимнутый gh, перепроверь на всякий случай" → [threads/03-src-shared-config-site-ids-ts.md](threads/03-src-shared-config-site-ids-ts.md#t04)
- **T05** `package.json`:23 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:06Z — "Сделал: `scripts/in-site.sh <site> <command...>` — один cd,…" → [threads/04-package-json.md](threads/04-package-json.md#t05)
- **T06** `apps/lsa/public/bible/inevitability-fallacy.md`:1 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:07Z — "Спасибо — и, если честно, приятно слышать, потому что вся ра…" → [threads/05-apps-lsa-public-bible-inevitability-fallacy-md.md](threads/05-apps-lsa-public-bible-inevitability-fallacy-md.md#t06)
- **T07** `apps/lsa/public/bible/tend-prose.md`:41 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:09Z — "Поставил после медведя, вариантом «сбоку с обтеканием» — она…" → [threads/06-apps-lsa-public-bible-tend-prose-md.md](threads/06-apps-lsa-public-bible-tend-prose-md.md#t07)
- **T08** `apps/lsa/public/bible/tend-prose.md`:48 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:10Z — "Поставил после абзаца про знак, блоком во всю колонку. 629af…" → [threads/06-apps-lsa-public-bible-tend-prose-md.md](threads/06-apps-lsa-public-bible-tend-prose-md.md#t08)
- **T09** `apps/lsa/public/bible/tend-prose.md`:75 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:11Z — "Поставил в самый конец, после «did not». 629af17" → [threads/06-apps-lsa-public-bible-tend-prose-md.md](threads/06-apps-lsa-public-bible-tend-prose-md.md#t09)
- **T10** `apps/lsa/public/bible/tend-prose.md`:2 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:12Z — "Убрал. 629af17" → [threads/06-apps-lsa-public-bible-tend-prose-md.md](threads/06-apps-lsa-public-bible-tend-prose-md.md#t10)
- **T11** `apps/lsa/public/bible/tend-prose.md`:16 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:14Z — "Сделал и то и другое: слаг теперь `inevitability-fallacy`, с…" → [threads/06-apps-lsa-public-bible-tend-prose-md.md](threads/06-apps-lsa-public-bible-tend-prose-md.md#t11)
- **T12** `apps/lsa/public/bible/tend-prose.md`:32 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:15Z — "Убрал. 629af17" → [threads/06-apps-lsa-public-bible-tend-prose-md.md](threads/06-apps-lsa-public-bible-tend-prose-md.md#t12)
- **T13** `apps/lsa/public/bible/tend-prose.md`:44 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:17Z — "Вписал. 629af17" → [threads/06-apps-lsa-public-bible-tend-prose-md.md](threads/06-apps-lsa-public-bible-tend-prose-md.md#t13)
- **T14** `apps/lsa/public/bible/tend-prose.md`:48 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:18Z — "Убрал — и завёл в `.claude/rules/writing.md` отдельным пункт…" → [threads/06-apps-lsa-public-bible-tend-prose-md.md](threads/06-apps-lsa-public-bible-tend-prose-md.md#t14)
- **T15** `apps/lsa/public/bible/tend-prose.md`:52 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:19Z — "Вписал. 629af17" → [threads/06-apps-lsa-public-bible-tend-prose-md.md](threads/06-apps-lsa-public-bible-tend-prose-md.md#t15)
- **T16** `apps/lsa/public/bible/tend-prose.md`:54 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:20Z — "Взял настоящий из этого репозитория — решение про слоёный им…" → [threads/06-apps-lsa-public-bible-tend-prose-md.md](threads/06-apps-lsa-public-bible-tend-prose-md.md#t16)
- **T17** `apps/lsa/public/bible/tend-prose.md`:64 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:21Z — "Убрал секцию целиком. 629af17" → [threads/06-apps-lsa-public-bible-tend-prose-md.md](threads/06-apps-lsa-public-bible-tend-prose-md.md#t17)
- **T18** `apps/lsa/public/bible/inevitability-fallacy.md`:3 — resolved — last: @vzakharov (agent) 2026-09-17T10:25:33Z — "Буду знать, что изобрёл термин. :-) В файле его нет, так что…" → [threads/05-apps-lsa-public-bible-inevitability-fallacy-md.md](threads/05-apps-lsa-public-bible-inevitability-fallacy-md.md#t18)
- **T19** `apps/lsa/public/bible/given-for-inevitable.md`:2 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:24Z — "Вписал: «…both fail, and they fail with consequences that wi…" → [threads/07-apps-lsa-public-bible-given-for-inevitable-md.md](threads/07-apps-lsa-public-bible-given-for-inevitable-md.md#t19)
- **T20** `apps/lsa/public/bible/given-for-inevitable.md`:20 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:25Z — "Поставил картинку после этого абзаца и переписал зачин по тв…" → [threads/07-apps-lsa-public-bible-given-for-inevitable-md.md](threads/07-apps-lsa-public-bible-given-for-inevitable-md.md#t20)
- **T21** `apps/lsa/public/bible/tend-prose.md`:48 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:26Z — "Поправил: «…not to take it away but to put up a second sign…" → [threads/06-apps-lsa-public-bible-tend-prose-md.md](threads/06-apps-lsa-public-bible-tend-prose-md.md#t21)
- **T22** `apps/lsa/public/bible/tend-prose.md`:48 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:27Z — "Добавил, сразу после этого абзаца. 629af17" → [threads/06-apps-lsa-public-bible-tend-prose-md.md](threads/06-apps-lsa-public-bible-tend-prose-md.md#t22)
- **T23** `apps/lsa/public/bible/tend-prose.md`:14 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:28Z — "Добавил. 629af17" → [threads/06-apps-lsa-public-bible-tend-prose-md.md](threads/06-apps-lsa-public-bible-tend-prose-md.md#t23)
- **T24** `apps/lsa/public/bible/given-for-inevitable.md`:30 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:29Z — "Сделал: фраза приклеена к предыдущему абзацу и вынесена пул-…" → [threads/07-apps-lsa-public-bible-given-for-inevitable-md.md](threads/07-apps-lsa-public-bible-given-for-inevitable-md.md#t24)
- **T25** `apps/lsa/public/bible/given-for-inevitable.md`:40 — resolved — last: @vzakharov (agent) 2026-09-17T10:25:34Z — "Убрал: «Television overuses that trope to the point of parod…" → [threads/07-apps-lsa-public-bible-given-for-inevitable-md.md](threads/07-apps-lsa-public-bible-given-for-inevitable-md.md#t25)
- **T26** `apps/lsa/public/bible/inevitability-fallacy.md`:47 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:31Z — "Обе на месте: пул-квот на последнюю фразу, под ним картинка.…" → [threads/05-apps-lsa-public-bible-inevitability-fallacy-md.md](threads/05-apps-lsa-public-bible-inevitability-fallacy-md.md#t26)
- **T27** `apps/lsa/public/bible/given-for-inevitable.md`:48 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:33Z — "Поправил. 629af17" → [threads/07-apps-lsa-public-bible-given-for-inevitable-md.md](threads/07-apps-lsa-public-bible-given-for-inevitable-md.md#t27)
- **T28** `apps/lsa/public/bible/given-for-inevitable.md`:50 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:34Z — "Убрал. 629af17" → [threads/07-apps-lsa-public-bible-given-for-inevitable-md.md](threads/07-apps-lsa-public-bible-given-for-inevitable-md.md#t28)
- **T29** `apps/lsa/public/bible/web-not-cli.md`:1 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:35Z — "Переименовал — `web-not-cli`, вместе с PDF и перекрёстными с…" → [threads/08-apps-lsa-public-bible-web-not-cli-md.md](threads/08-apps-lsa-public-bible-web-not-cli-md.md#t29)
- **T30** `apps/lsa/public/bible/web-not-console.md`:2 — resolved — last: @vzakharov (agent) 2026-09-17T10:25:35Z — "Понял, перекроил. Описание теперь: «Most people stay in a lo…" → [threads/09-apps-lsa-public-bible-web-not-console-md.md](threads/09-apps-lsa-public-bible-web-not-console-md.md#t30)
- **T31** `apps/lsa/public/bible/web-not-console.md`:18 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:38Z — "Поставил туда, сбоку с обтеканием. (Каламбур был не мой, но…" → [threads/09-apps-lsa-public-bible-web-not-console-md.md](threads/09-apps-lsa-public-bible-web-not-console-md.md#t31)
- **T32** `apps/lsa/public/bible/web-not-console.md`:20 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:39Z — "Взял в скобки целиком. 629af17" → [threads/09-apps-lsa-public-bible-web-not-console-md.md](threads/09-apps-lsa-public-bible-web-not-console-md.md#t32)
- **T33** `apps/lsa/public/bible/web-not-console.md`:20 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:40Z — "Переписал по существу, объём тот же: > (The one real excepti…" → [threads/09-apps-lsa-public-bible-web-not-console-md.md](threads/09-apps-lsa-public-bible-web-not-console-md.md#t33)
- **T34** `apps/lsa/public/bible/web-not-console.md`:38 — resolved — last: @vzakharov (agent) 2026-09-17T10:25:36Z — "Вернул метафору, другую: «…and at no point in it are you wat…" → [threads/09-apps-lsa-public-bible-web-not-console-md.md](threads/09-apps-lsa-public-bible-web-not-console-md.md#t34)
- **T35** `apps/lsa/public/bible/web-not-console.md`:40 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:44Z — "Сделал всё три: «And, let us be honest about the local alter…" → [threads/09-apps-lsa-public-bible-web-not-console-md.md](threads/09-apps-lsa-public-bible-web-not-console-md.md#t35)
- **T36** `apps/lsa/public/bible/web-not-console.md`:44 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:45Z — "В кавычках и с большой картиной в конце: «not like that», «p…" → [threads/09-apps-lsa-public-bible-web-not-console-md.md](threads/09-apps-lsa-public-bible-web-not-console-md.md#t36)
- **T37** `apps/lsa/public/bible/web-not-console.md`:44 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:46Z — "Сделал — `go handle them`, с ссылкой на скилл. По остальным…" → [threads/09-apps-lsa-public-bible-web-not-console-md.md](threads/09-apps-lsa-public-bible-web-not-console-md.md#t37)
- **T38** `apps/lsa/public/bible/web-not-console.md`:56 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:48Z — "Поставил. 629af17" → [threads/09-apps-lsa-public-bible-web-not-console-md.md](threads/09-apps-lsa-public-bible-web-not-console-md.md#t38)
- **T39** `apps/lsa/public/bible/web-not-console.md`:58 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:49Z — "Перенёс — теперь абзац закрывает «What you give up», а «## S…" → [threads/09-apps-lsa-public-bible-web-not-console-md.md](threads/09-apps-lsa-public-bible-web-not-console-md.md#t39)
- **T40** `apps/lsa/public/bible/web-not-cli.md`:31 — resolved — last: @vzakharov (agent) 2026-09-17T00:51:50Z — "Поставил в начало секции, блоком. 629af17" → [threads/08-apps-lsa-public-bible-web-not-cli-md.md](threads/08-apps-lsa-public-bible-web-not-cli-md.md#t40)
- **T41** `apps/lsa/public/bible/inevitability-fallacy.md`:35 — unresolved — last: @vzakharov (human) 2026-09-17T11:56:28Z — "<img width="439" height="583" alt="Screenshot 2026-09-17 at…" → [threads/05-apps-lsa-public-bible-inevitability-fallacy-md.md](threads/05-apps-lsa-public-bible-inevitability-fallacy-md.md#t41)
- **T42** `apps/lsa/public/bible/inevitability-fallacy.md`:1 — unresolved — last: @vzakharov (human) 2026-09-17T11:53:48Z — "да, хорошо. Полная формулировка ("... it treats as fixed") д…" → [threads/05-apps-lsa-public-bible-inevitability-fallacy-md.md](threads/05-apps-lsa-public-bible-inevitability-fallacy-md.md#t42)

## Timeline (status, references, and other events)

- **2026-09-16T22:43:54Z** @vzakharov renamed from «docs: plan the Bible — the lsa article collection» to «feat(lsa): the Bible, latestageagentic.com's article collection».
- **2026-09-17T00:20:20Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/52#pullrequestreview-5229288605.
- **2026-09-17T01:32:51Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/52#pullrequestreview-5230004646.
