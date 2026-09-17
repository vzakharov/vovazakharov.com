# PR #52: feat(lsa): the Bible, latestageagentic.com's article collection

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/52
- **Author:** @vzakharov (human)
- **Base ← Head:** main ← claude/lsa-bible-obbcfw
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-09-16T22:06:34Z
- **Updated:** 2026-09-17T00:20:21Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## Summary

- **«Библия» is real**: `latestageagentic.com` serves an article collection at [/bible](https://latestageagentic.com/bible), seeded with three articles written off the recordings that landed in 3b1e8e8 — the web-not-the-console argument, the four TEND lenses, and what it means that an agent takes what it finds for what must be. Each was recorded as a script for the Russian channel and is rewritten here in the register the site is for: the position first, then what earns it.
- **The index opens on prose of its own.** Added at the go-ahead: `/bible` says what the collection is, why the name is a joke doing real work, and what "as of writing" means, before the reader meets the first categorical article. The copy lives in `src/pages/documents/ui/collection-intros.tsx`, keyed by collection — the case studies keep just their one-line description.
- **An article is built through the case study's own pipeline**, which assumed one site in four places. A collection now names the site that serves it, and the sitemap, the document walk and the render scripts iterate `collectionsForSite()` instead of every collection there is. `SITE_IDS` moved to a side-effect-free module so `collections.ts` can name a site without reaching `site-config`'s throw. `src/pages/case-studies` is `src/pages/documents`, and its index and article are factories a router binds to one collection.
- **The print lane serves both sites**: it resolves its site from `NEXT_PUBLIC_SITE`, prints the CV only for the site that has one, and ships as `content:pdf:vova` and `content:pdf:lsa`, which `vet.sh` runs as two fan-out entries (one combined script would take `--check` on the second command only). Both render runs are in the branch — the Bible's three PDFs, and vova's, which re-render because every printed page hashes `src/shared/config` and the document components.
- **One defect the Bible exposed**: a document with no shorter cuts rendered a one-chip switcher reading "Full", offering the page the reader was already on. It appears only where there is something to switch to.

## QA Checklist

- [ ] `index-copy` — open `/bible` in both themes: the lede, the three paragraphs under it, then the cards. This is the part written "от себя" and the one most likely to want rewording
- [ ] `articles` — read the three end to end against the recordings in `writing/late-stage-agentic/dictations/`: each states its position before arguing it, and no "about this later" links at a file the site does not serve
- [ ] `pdf` — open one of `apps/lsa/public/bible/*.pdf`: the printed footer carries `latestageagentic.com`, a path that has never been exercised
- [ ] `vova-untouched` — `/case-studies` and its article still render as before; the slice rename and the router change are behaviour-free there
- [ ] `render-checks` — `pnpm content:pdf:vova --check` and `pnpm content:pdf:lsa --check` both report nothing to render

| Item             | Automatable | Covered? | Notes                                                          |
| ---------------- | ----------- | -------- | -------------------------------------------------------------- |
| `index-copy`     | No          | No       | A judgement about copy; `/preview` captures are in the session |
| `articles`       | No          | No       | Prose against its source recording                             |
| `pdf`            | Partly      | No       | The hash check proves freshness, not that the page prints well |
| `vova-untouched` | Partly      | Yes      | `pnpm build` renders every route; the eye check is the layout  |
| `render-checks`  | Yes         | Yes      | Both run clean; `vet.sh` runs them as separate entries         |

https://claude.ai/code/session_01S4mmZqcrrkTkFp51PuYJ3s

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
default -- now exists at /bible, seeded with three articles: why to
drive agents through the web client rather than the console, the four
lenses /tend-prose runs, and what it means that an agent takes what
it finds for what must be. Each was recorded first as a script for
the Russian channel and is rewritten here in the register the site is
for: the position first, then what earns it. The index opens on prose
of its own, because the name is a joke that has to land before the
first categorical article does.

An article is built through the case study's own pipeline rather than
beside it, and that pipeline assumed one site in four places. A
collection now names the site that serves it, and the sitemap, the
document walk and the render scripts read that rather than every
collection there is. The page slice was written generically and then
pinned to case studies by two constants; it is src/pages/documents
now, bound to a collection by the router that mounts it. The print
lane learns which site it is rendering, so a Bible article carries
its committed PDF on the same machinery, and vet checks both sites'
renders where it checked one.

Two things the Bible was the first to ask for: a document with no
shorter cuts no longer offers a one-chip switcher reading "Full", and
what the recordings promise but do not yet redeem stays plain text,
since the ideas/ files they link are a repo convention rather than
published pages. Two of the project plan's open questions close with
this -- what the wiki is called, and that a piece is recorded as a
column script and rewritten as an article.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `apps/vova/public/case-studies/playgram.mini.pdf`:1 — unresolved — last: @vzakharov (human) 2026-09-16T23:15:44Z — "можешь напомнить, почему у нас пдф-ы перегенерируются каждый…" → [threads/01-apps-vova-public-case-studies-playgram-mini-pdf.md](threads/01-apps-vova-public-case-studies-playgram-mini-pdf.md#t01)
- **T02** `src/pages/documents/ui/collection-intros.tsx`:32 — unresolved — last: @vzakharov (human) 2026-09-16T23:20:19Z — "remove the last one" → [threads/02-src-pages-documents-ui-collection-intros-tsx.md](threads/02-src-pages-documents-ui-collection-intros-tsx.md#t02)
- **T03** `src/pages/documents/ui/collection-intros.tsx`:46 — unresolved — last: @vzakharov (human) 2026-09-16T23:20:58Z — "not load-bearing and kinda obvious, let's ditch" → [threads/02-src-pages-documents-ui-collection-intros-tsx.md](threads/02-src-pages-documents-ui-collection-intros-tsx.md#t03)
- **T04** `src/shared/config/site-ids.ts`:34 — unresolved — last: @vzakharov (human) 2026-09-16T23:22:35Z — "z.enum & parse?" → [threads/03-src-shared-config-site-ids-ts.md](threads/03-src-shared-config-site-ids-ts.md#t04)
- **T05** `package.json`:23 — unresolved — last: @vzakharov (human) 2026-09-16T23:24:24Z — "let's create a helper script for "use this website" that doe…" → [threads/04-package-json.md](threads/04-package-json.md#t05)
- **T06** `apps/lsa/public/bible/given-for-inevitable.md`:1 — unresolved — last: @vzakharov (human) 2026-09-16T23:28:23Z — "прежде всего, great job on all the three articles -- I got t…" → [threads/05-apps-lsa-public-bible-given-for-inevitable-md.md](threads/05-apps-lsa-public-bible-given-for-inevitable-md.md#t06)
- **T07** `apps/lsa/public/bible/tend-prose.md`:38 — unresolved — last: @vzakharov (human) 2026-09-16T23:32:13Z — "и картинку после этого: <img width="1024" height="1024" alt=…" → [threads/06-apps-lsa-public-bible-tend-prose-md.md](threads/06-apps-lsa-public-bible-tend-prose-md.md#t07)
- **T08** `apps/lsa/public/bible/tend-prose.md`:48 — unresolved — last: @vzakharov (human) 2026-09-16T23:34:17Z — "<img width="1024" height="1024" alt="Image" src="https://git…" → [threads/06-apps-lsa-public-bible-tend-prose-md.md](threads/06-apps-lsa-public-bible-tend-prose-md.md#t08)
- **T09** `apps/lsa/public/bible/tend-prose.md`:72 — unresolved — last: @vzakharov (human) 2026-09-16T23:37:34Z — "<img width="1024" height="1024" alt="Image" src="https://git…" → [threads/06-apps-lsa-public-bible-tend-prose-md.md](threads/06-apps-lsa-public-bible-tend-prose-md.md#t09)
- **T10** `apps/lsa/public/bible/tend-prose.md`:2 — unresolved — last: @vzakharov (human) 2026-09-16T23:38:08Z — "> , and there are four of them for a reason worth knowing na…" → [threads/06-apps-lsa-public-bible-tend-prose-md.md](threads/06-apps-lsa-public-bible-tend-prose-md.md#t10)
- **T11** `apps/lsa/public/bible/tend-prose.md`:16 — unresolved — last: @vzakharov (human) 2026-09-16T23:38:54Z — "`obliges -- something we call [the inevitability fallacy](./…" → [threads/06-apps-lsa-public-bible-tend-prose-md.md](threads/06-apps-lsa-public-bible-tend-prose-md.md#t11)
- **T12** `apps/lsa/public/bible/tend-prose.md`:32 — unresolved — last: @vzakharov (human) 2026-09-16T23:39:24Z — "- (hereafter "-" just means "remove")" → [threads/06-apps-lsa-public-bible-tend-prose-md.md](threads/06-apps-lsa-public-bible-tend-prose-md.md#t12)
- **T13** `apps/lsa/public/bible/tend-prose.md`:44 — unresolved — last: @vzakharov (human) 2026-09-16T23:39:46Z — "...hypothetical arrangements about CDNs and transparencies..…" → [threads/06-apps-lsa-public-bible-tend-prose-md.md](threads/06-apps-lsa-public-bible-tend-prose-md.md#t13)
- **T14** `apps/lsa/public/bible/tend-prose.md`:48 — unresolved — last: @vzakharov (human) 2026-09-16T23:40:12Z — "> , and it is worth saying out loud, ditch, and add to the l…" → [threads/06-apps-lsa-public-bible-tend-prose-md.md](threads/06-apps-lsa-public-bible-tend-prose-md.md#t14)
- **T15** `apps/lsa/public/bible/tend-prose.md`:52 — unresolved — last: @vzakharov (human) 2026-09-16T23:40:30Z — ""My philosophy is that all prose..."" → [threads/06-apps-lsa-public-bible-tend-prose-md.md](threads/06-apps-lsa-public-bible-tend-prose-md.md#t15)
- **T16** `apps/lsa/public/bible/tend-prose.md`:54 — unresolved — last: @vzakharov (human) 2026-09-16T23:41:09Z — "let's find some more concrete example for "we do it this way…" → [threads/06-apps-lsa-public-bible-tend-prose-md.md](threads/06-apps-lsa-public-bible-tend-prose-md.md#t16)
- **T17** `apps/lsa/public/bible/tend-prose.md`:64 — unresolved — last: @vzakharov (human) 2026-09-16T23:42:49Z — "-, I understand the interest but I don't think its value des…" → [threads/06-apps-lsa-public-bible-tend-prose-md.md](threads/06-apps-lsa-public-bible-tend-prose-md.md#t17)
- **T18** `apps/lsa/public/bible/given-for-inevitable.md`:3 — unresolved — last: @vzakharov (human) 2026-09-16T23:43:58Z — "нужно что-то ещё для сортировки, чтобы эта статья шла первой…" → [threads/05-apps-lsa-public-bible-given-for-inevitable-md.md](threads/05-apps-lsa-public-bible-given-for-inevitable-md.md#t18)
- **T19** `apps/lsa/public/bible/given-for-inevitable.md`:2 — unresolved — last: @vzakharov (human) 2026-09-16T23:44:49Z — "and they fail with consequences that will make humans useful…" → [threads/05-apps-lsa-public-bible-given-for-inevitable-md.md](threads/05-apps-lsa-public-bible-given-for-inevitable-md.md#t19)
- **T20** `apps/lsa/public/bible/given-for-inevitable.md`:20 — unresolved — last: @vzakharov (human) 2026-09-16T23:52:48Z — "picture: <img width="1024" height="1024" alt="Image" src="ht…" → [threads/05-apps-lsa-public-bible-given-for-inevitable-md.md](threads/05-apps-lsa-public-bible-given-for-inevitable-md.md#t20)
- **T21** `apps/lsa/public/bible/tend-prose.md`:48 — unresolved — last: @vzakharov (human) 2026-09-16T23:57:35Z — "not "beside it" but "instead"" → [threads/06-apps-lsa-public-bible-tend-prose-md.md](threads/06-apps-lsa-public-bible-tend-prose-md.md#t21)
- **T22** `apps/lsa/public/bible/tend-prose.md`:48 — unresolved — last: @vzakharov (human) 2026-09-16T23:57:49Z — "> What is being kept is a wet-floor sign on a floor that dri…" → [threads/06-apps-lsa-public-bible-tend-prose-md.md](threads/06-apps-lsa-public-bible-tend-prose-md.md#t22)
- **T23** `apps/lsa/public/bible/tend-prose.md`:14 — unresolved — last: @vzakharov (human) 2026-09-16T23:59:10Z — "pull quote: An agent that finds a great deal of prose conclu…" → [threads/06-apps-lsa-public-bible-tend-prose-md.md](threads/06-apps-lsa-public-bible-tend-prose-md.md#t23)
- **T24** `apps/lsa/public/bible/given-for-inevitable.md`:30 — unresolved — last: @vzakharov (human) 2026-09-16T23:59:39Z — "pull quote: What you have bought is not a habit of scepticis…" → [threads/05-apps-lsa-public-bible-given-for-inevitable-md.md](threads/05-apps-lsa-public-bible-given-for-inevitable-md.md#t24)
- **T25** `apps/lsa/public/bible/given-for-inevitable.md`:40 — unresolved — last: @vzakharov (human) 2026-09-17T00:01:10Z — ""The show plays it for comedy," is not what I meant; what I…" → [threads/05-apps-lsa-public-bible-given-for-inevitable-md.md](threads/05-apps-lsa-public-bible-given-for-inevitable-md.md#t25)
- **T26** `apps/lsa/public/bible/given-for-inevitable.md`:42 — unresolved — last: @vzakharov (human) 2026-09-17T00:04:20Z — "<img width="1024" height="1024" alt="Image" src="https://git…" → [threads/05-apps-lsa-public-bible-given-for-inevitable-md.md](threads/05-apps-lsa-public-bible-given-for-inevitable-md.md#t26)
- **T27** `apps/lsa/public/bible/given-for-inevitable.md`:48 — unresolved — last: @vzakharov (human) 2026-09-17T00:04:34Z — ""neural network", not just "network"" → [threads/05-apps-lsa-public-bible-given-for-inevitable-md.md](threads/05-apps-lsa-public-bible-given-for-inevitable-md.md#t27)
- **T28** `apps/lsa/public/bible/given-for-inevitable.md`:50 — unresolved — last: @vzakharov (human) 2026-09-17T00:04:50Z — "ditch, a detour for no apparent return" → [threads/05-apps-lsa-public-bible-given-for-inevitable-md.md](threads/05-apps-lsa-public-bible-given-for-inevitable-md.md#t28)
- **T29** `apps/lsa/public/bible/web-not-console.md`:1 — unresolved — last: @vzakharov (human) 2026-09-17T00:05:08Z — "web-not-cli for the slug" → [threads/07-apps-lsa-public-bible-web-not-console-md.md](threads/07-apps-lsa-public-bible-web-not-console-md.md#t29)
- **T30** `apps/lsa/public/bible/web-not-console.md`:2 — unresolved — last: @vzakharov (human) 2026-09-17T00:05:27Z — "это весьма спорное утверждение (что every argument -- это пр…" → [threads/07-apps-lsa-public-bible-web-not-console-md.md](threads/07-apps-lsa-public-bible-web-not-console-md.md#t30)
- **T31** `apps/lsa/public/bible/web-not-console.md`:18 — unresolved — last: @vzakharov (human) 2026-09-17T00:09:34Z — "<img width="1024" height="1024" alt="Image" src="https://git…" → [threads/07-apps-lsa-public-bible-web-not-console-md.md](threads/07-apps-lsa-public-bible-web-not-console-md.md#t31)
- **T32** `apps/lsa/public/bible/web-not-console.md`:20 — unresolved — last: @vzakharov (human) 2026-09-17T00:09:44Z — "parenthesize the entire paragraph" → [threads/07-apps-lsa-public-bible-web-not-console-md.md](threads/07-apps-lsa-public-bible-web-not-console-md.md#t32)
- **T33** `apps/lsa/public/bible/web-not-console.md`:20 — unresolved — last: @vzakharov (human) 2026-09-17T00:10:30Z — "> each write a perfectly correct migration and the pair of t…" → [threads/07-apps-lsa-public-bible-web-not-console-md.md](threads/07-apps-lsa-public-bible-web-not-console-md.md#t33)
- **T34** `apps/lsa/public/bible/web-not-console.md`:38 — unresolved — last: @vzakharov (human) 2026-09-17T00:11:43Z — "> watching a progress indicator with feelings. слишком клишо…" → [threads/07-apps-lsa-public-bible-web-not-console-md.md](threads/07-apps-lsa-public-bible-web-not-console-md.md#t34)
- **T35** `apps/lsa/public/bible/web-not-console.md`:40 — unresolved — last: @vzakharov (human) 2026-09-17T00:13:08Z — "что-то вроде "And, let's be honest, in the local alternative…" → [threads/07-apps-lsa-public-bible-web-not-console-md.md](threads/07-apps-lsa-public-bible-web-not-console-md.md#t35)
- **T36** `apps/lsa/public/bible/web-not-console.md`:44 — unresolved — last: @vzakharov (human) 2026-09-17T00:13:36Z — "not like that, pull this out into a function, move this нужн…" → [threads/07-apps-lsa-public-bible-web-not-console-md.md](threads/07-apps-lsa-public-bible-web-not-console-md.md#t36)
- **T37** `apps/lsa/public/bible/web-not-console.md`:44 — unresolved — last: @vzakharov (human) 2026-09-17T00:14:10Z — "", go" => ", go handle them", with handle linking to https:/…" → [threads/07-apps-lsa-public-bible-web-not-console-md.md](threads/07-apps-lsa-public-bible-web-not-console-md.md#t37)
- **T38** `apps/lsa/public/bible/web-not-console.md`:56 — unresolved — last: @vzakharov (human) 2026-09-17T00:14:48Z — "link on claude.ai/code" → [threads/07-apps-lsa-public-bible-web-not-console-md.md](threads/07-apps-lsa-public-bible-web-not-console-md.md#t38)
- **T39** `apps/lsa/public/bible/web-not-console.md`:58 — unresolved — last: @vzakharov (human) 2026-09-17T00:14:56Z — "move before "## So"" → [threads/07-apps-lsa-public-bible-web-not-console-md.md](threads/07-apps-lsa-public-bible-web-not-console-md.md#t39)
- **T40** `apps/lsa/public/bible/web-not-console.md`:26 — unresolved — last: @vzakharov (human) 2026-09-17T00:19:15Z — "<img width="1227" height="864" alt="Image" src="https://gith…" → [threads/07-apps-lsa-public-bible-web-not-console-md.md](threads/07-apps-lsa-public-bible-web-not-console-md.md#t40)

## Timeline (status, references, and other events)

- **2026-09-16T22:43:54Z** @vzakharov renamed from «docs: plan the Bible — the lsa article collection» to «feat(lsa): the Bible, latestageagentic.com's article collection».
- **2026-09-17T00:20:20Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/52#pullrequestreview-5229288605.
