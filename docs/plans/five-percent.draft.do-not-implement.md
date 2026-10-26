> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

# The five percent: a polish pass and an article

`writing/notes/the-five-percent.md` has done its job as a collection: 214 bumps
over fourteen learnings, 6 September to 26 October, the top one
(`What it was handed, it treats as fixed`, ×90) carrying 42% of them on its own.
Two things come out of it, in one PR:

1. **A skill**, `/five-percent`, that puts those learnings to a branch's diff as
   a third `/polish` pass and **edits nothing**: it posts its alternatives as a
   review on the PR, anchored to the lines they are about, for the operator to
   answer in-thread.
2. **An article**, on a blog on latestageagentic.com, Russian original and
   English translation. It is not a Bible piece: the Bible states a position on
   how to work, and this is a measurement of one agent under one reviewer, with
   its deflating half.

**Order: the skill first, then the blog and the article.** The skill is the
smaller half and settles the notes' status (closed to entries) before the
article is written from them. The PR merges once the article's text is approved;
the skill rides with it.

## Part 1 — `/five-percent`

### What the pass does

Reads the branch's diff and its plan, puts each lens in the catalogue to it, and
posts **one review** on the PR (`COMMENT`, never approve or request changes):

- **A proposal is an alternative approach**, concrete enough to pick: what the
  change took as given, the other way to do it, and what that way costs.
  "Consider whether…" is not one.
- **Every proposal is an inline comment, so every one has a thread to answer
  in.** One that points at lines anchors to them; one about the change whole
  anchors to the file it most concerns (`subjectType: "FILE"`), the anchor being
  where it is answered rather than a claim about its scope. The review body
  carries only the run's one-line summary and the floor marker: nothing in it
  asks for a reply, since a review body has no thread to reply in.
- **Each proposal opens on its lens's name** (§ "The lenses"), so the operator's
  reply also tells the catalogue which lenses earn their keep, and "`precedent`
  — да" is a whole answer.
- **Each proposal is graded `critical` or `optional`.** Critical: taking it
  would change what the merge ships — a page says the wrong thing, a behaviour
  is wrong — not merely how it is built. Everything else is optional, and most
  proposals are.
- **The bar against noise is that the operator could plausibly pick it.** At
  most three per run, ranked; a run that finds none posts no review and says so
  in the report. An empty-handed run is the ordinary result, not a failure to
  try harder.
- **Never on the operator's own calls** — the notes' "Not bumps" carried over as
  the pass's exclusions: taste, a hook, a verdict on his own material, a
  decision the plan records as his.
- **In the operator's language** (a review is conversation, `CLAUDE.md` §
  "Language").

It writes **nothing** to the tree — no commit, not even `/polish`'s empty mark.
An answered proposal becomes work the ordinary way: `/handle` reads the review's
threads as feedback.

**The review is the first home, on trial.** If the reviews read as noise, the
fallback is the in-session report: the proposals relayed in chat by the session
that ran `/polish`, nothing posted. Switching is an edit to `procedure.md`'s
posting section; nothing else depends on where they land.

### The lenses

One per learning in the notes, under a one-word name to answer by. Each is a
question put to the diff, and what it is put to — a lens whose ground the diff
does not cover is skipped, which is most of them on most runs.

- **`precedent`** (×90) — what did the change take as given: a list, a pattern
  in the tree, a checker's green, a rule's letter, its own tool's output? Fires
  on anything; a new prop copied from nine callers, a commit type picked from
  the list, a case passed because the skill's checks passed. The name is the
  Bible's
  ([the precedent fallacy](../../apps/bible/public/precedent-fallacy.md), "a
  given, read as a rule"), and the lens links it rather than restating it.
- **`unrun`** (×28) — which claim in the change rests on reasoning nobody ran: a
  comment's "nothing calls this yet", a test on fixtures without the hard case,
  a link chosen by its title? The alternative is the one run, grep or read that
  settles it.
- **`echo`** (×19) — does a fact the change edited live somewhere the diff did
  not touch: the other locale, the other two renderings, the watermark rows
  beside the ones edited? The most mechanical lens, and the one a grep answers.
- **`source`** (×14) — where the change quotes, cites or draws from something,
  is it the source's words and data or the agent's: lyrics "fixed" to the
  dictionary's, a word list hand-picked where a library exists?
- **`form`** (×14) — what did the change write because the format had a slot for
  it: a rule nobody asked for, a cell per key, a copy per persona, four checks
  where a note would do? The alternative is less, or nothing.
- **`reader`** (×10) — met cold, what does a reader take from this name or line:
  `isHomePage` read as its opposite, a mechanism compressed past checking, the
  repo's world named to someone outside it?
- **`pinned`** (×8) — which choice is justified by its own docstring, test or
  caveat, and is the choice itself right? The alternative is dropping it.
- **`render`** (×6) — on a visual change only: what the change was for is not
  what the page looks like. A diff-reading pass cannot see the page, so the
  proposal names what to look at in `/preview` and why.
- **`shape`** (×3) — does a comment warn against a move a structure could make
  fail to build: a `server-only` module, a type, a lint rule?
- **`exit`** (×3) — on prose taking a position: does a sentence hedge it in the
  same breath, so the disclaimer becomes the steer?
- **`seat`** (×2) — on Basilisk cases and the Clerk's reflections: is the
  machine in the case read as the one wronged because it is the agent's kind?
- **`cadence`** (×2) — on prose: is a reflex shape («не X, а Y», the consoling
  last line) standing where the argument should be?
- **`gap`** (×2) — on a question the change puts to the operator, in a plan or a
  PR body: is the hole in the author's material, or in the agent's reading of
  it?

"It writes its reasoning into the artifact" (×13) gets no lens: the alternative
it proposes is always the artifact without the defence, which is a cut, and
`/tend-prose`'s existence and narration lenses make that cut one pass earlier.
Here the pass proposes approaches, never cuts.

### Its own floor

`/polish`'s floor is the last `polish:` commit, which moves even on a run where
this pass could not post (no PR yet). So the pass keeps its own: the review body
ends with `<!-- five-percent: <head sha> -->`, and the next run reads the newest
such marker among the PR's reviews and scopes itself to `<sha>..HEAD`. No marker
→ `origin/<base>...HEAD`. A floor read off the PR needs no convention in the git
log and cannot be outrun by another pass's commit.

### Where it runs

- **`/polish`, third pass, after `/tend-prose`** — over what survives the other
  two, which edit. Only when the branch has a PR; otherwise the report says it
  was deferred, and nothing moves its floor.
- **`/go` Step 4, after `/pr`** — on a branch that had no PR at Step 3 (the
  planless route), the pass runs once the PR exists, so planless work does not
  reach review unread.
- **`/finalize`** gets it through `/polish` unchanged. `/finalize and merge`
  stops on a **critical** proposal its own run posted, and merges past optional
  ones: by finalize the critical ones should already have been caught at `/go`,
  so a stop there is the exception it should be.
- **On demand**, `/five-percent [<branch|#PR>]`.

**It runs in a fresh subagent, never in the authoring session**, for `/polish`'s
reason: the author reads the diff with the frame that produced it, and the frame
is what the pass is looking for. Inside `/polish` that subagent is `/polish`'s
own — the one that just ran `/dry` and `/tend-prose`, which is already fresh to
the change and loads `procedure.md` as its third step; no second one is
launched. Its own two passes' edits are the one thing it reads as an author, and
they are mechanical — the frames the lenses look for are the change's. The
skill's own `SKILL.md` launches a subagent only where no `/polish` is running:
`/go` Step 4 and the on-demand call.

### Files

- `.claude/skills/five-percent/SKILL.md` — description, the subagent launch,
  where it runs. A new skill's description enters the always-loaded listing, so
  it goes through `scripts/staged.sh` (`.claude/rules/staging.md`).
- `.claude/skills/five-percent/procedure.md` — scope and floor, the bar and the
  grades, posting (the calls by reference to `/feedback` § "Posting it", the
  every-proposal-inline placement its own), the exclusions, the report line.
- `.claude/skills/five-percent/lenses.md` — the catalogue § "The lenses"
  sketches: one section per lens, under its name, in the notes' count order,
  each holding **the question to put to a diff**, **what it is put to**, **what
  an alternative looks like**, and **one compressed specimen** to recognise it
  by. No counts and no dates: they served the article, and a lens is ordered by
  how often it fires, which the order already says. The two families close it.
  Edited deliberately from here on; nothing appends to it after a review.
- `.claude/skills/polish/passes.md` — the third pass, and "two passes" becoming
  three in its prose and its Do NOT.
- `.claude/skills/polish/SKILL.md` — its description names the passes, so it is
  staged too.
- `.claude/skills/go/SKILL.md` — Step 4's one line.
- `.claude/skills/finalize/SKILL.md` — the `and merge` stop on a critical
  proposal.
- `CLAUDE.md` (staged) — § "GitHub comments" loses its last two paragraphs: the
  mandatory notes entry and the subagent that writes it.
- `writing/notes/the-five-percent.md` — closed to entries; retires in Part 2.

### Accepted cost

The pass is an agent reading an agent, so it shares the blind spots it is
looking for; the catalogue is what it has that the author did not — a list of
frames to question, written by the reviews that broke them. It will miss the
frame no lens names, and that is the five percent the operator is still for.

## Part 2 — the blog and the article

### The blog

**On latestageagentic.com.** The article's subject is agentic coding and its
question — what the human is still for — is the one
`writing/late-stage-agentic/plan.md` says the project opens on; the site has a
home page and nothing behind it yet. vovazakharov.com's `/writing` gets a card
pointing at it, as it points at Glitchporn.

- **Collection `lsa-blog`** on site `lsa`, base `blog`: a `COLLECTIONS` entry,
  `localized: 'translated'`, `label: { en: 'Blog', ru: 'Блог' }`, a feed per
  language, its schema in `COLLECTION_SCHEMAS`.
- **Bilingual the way `maya-blog` is** (#208, now on the branch): English at the
  bare address, Russian under `/ru`, a language switch on each page. The LSA
  home page becomes `[[...locale]]` and lists the blog, `homeIndexed` as Майя's
  does; its own copy gets a Russian version.
- **The article router** binds `articleRoute('lsa-blog')`; sitemap and feeds
  follow from the registry.
- **[#187](https://github.com/vzakharov/vovazakharov.com/issues/187)** stays its
  own issue: the six music posts are Vova's, not the agency's, and belong on
  vovazakharov.com. This PR's body links it with that call, so whoever takes it
  knows the LSA blog was not built for them.

### The article

- `apps/lsa/public/blog/the-five-percent.ru.md`, the original;
  `the-five-percent.en.md`, its translation by a subagent after the original is
  approved, stamped with `pnpm translation:stamp`.
- **A measurement** in `writing/CLAUDE.md`'s sense: 214 bumps, the counts, the
  two families, and its deflating half kept in — one reviewer, seven weeks,
  counted and judged by the agent being counted, and the reviewer's own misses
  ("Not bumps"). Every figure re-derived from the file and its `git log -p`, not
  copied off the headings.
- **The hook is Вова's**: the draft offers two or three openings rather than
  picking one.
- **The draft is the page on the branch.** The PR does not merge until the text
  is approved — merge is deploy — and `/preview live lsa` is where it is read.
- **The notes retire with it**: `writing/notes/the-five-percent.retired.md` as
  the tombstone (the tree cites the file from
  `writing/late-stage-agentic/plan.md` and the megabeast notes),
  `scripts/check-notes-length.sh` with it if nothing else uses it, and row 18 of
  `writing/linkedin/plan.md` pointing at the article.

### Rejected

Two PRs (the skill shipping ahead of the article) was turned down for one.
Proposals as comments committed into the code would edit the tree the pass
promises not to touch, and need sweeping before merge. Continuing to collect
after reviews would keep a log nobody reads now the article is written; the
catalogue changes by deliberate edit. A blog on vovazakharov.com under
`/writing` stays the alternative if LSA is the wrong home — the same collection
with `site: 'vova'` and `/writing` as its index.

## DRY notes

- **Posting is `/feedback`'s**, referenced from `procedure.md` rather than
  copied: the three MCP calls, `COMMENT`, the `FILE` anchor. What differs — the
  bar, the grades, the lenses, the floor, and every proposal going inline where
  `/feedback` keeps the whole-piece reading in the body — is this skill's own: a
  reading is read, a proposal is answered.
- **The subagent split mirrors `/polish`** (`SKILL.md` launches, `passes.md` is
  followed) rather than sharing a file with it: the two launch different
  procedures, and a shared launcher would be one paragraph parameterised by a
  path.
- **The scope command is `passes.md`'s** (`gh pr view` → fetch →
  `origin/<base>...HEAD`), referenced; only the floor differs, and it differs
  because this pass commits nothing for a git-log floor to find.
- **The lenses are written fresh, not copied from the notes.** The notes are
  evidence for a reader deciding whether a claim is true; a lens is a question
  for an agent reading a diff. Same headings, different job, and the notes
  retire in Part 2, leaving the lens file the only home.
- **The blog adds no code path to the content pipeline** — one registry entry on
  machinery `maya-blog` already exercises, translated collection included. The
  LSA home's locale routing copies `apps/maya/app/[[...locale]]/page.tsx`'s
  shape; if that route file and its page slice turn out to repeat Майя's beyond
  the binding, the shared part drops to `pages/documents` or `shared/` per
  `.claude/rules/fsd.md`, decided against the code.
