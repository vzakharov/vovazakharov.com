# The five percent: a polish pass and an article

## Progress (paused for the context budget)

**Done:**

- Part 1, whole — 771e1d3. `/five-percent` (`SKILL.md`, `procedure.md`,
  `lenses.md`), the third pass in `polish/passes.md`, the staged `/polish`
  description, `/go` Step 4's line, the stand-down in `finalize/merge.md` (the
  gate's home, not `finalize/SKILL.md`), the notes paragraphs cut from the
  staged `CLAUDE.md`, the notes closed to entries. Deviation: the new `SKILL.md`
  went in place, since `scripts/staged.sh` stages only files that already exist;
  its description is final, so the listing changes once.
- Part 2's blog wiring — 920aca9. `lsa-blog` in the registry and schemas, the
  `[[...locale]]` home reading a new `lsa` catalogue namespace (en verbatim, ru
  new) and listing the blog, article and feed routes.

**Left, in order:**

1. **The article** — `apps/lsa/public/blog/the-five-percent.ru.md`. Until it
   exists `pnpm build:lsa` fails: an article route with no documents has no
   `generateStaticParams` to export. Figures re-derived from the notes and
   `git log -p writing/notes/the-five-percent.md`; two or three openings offered
   to Вова.
2. **A provisional `.en.md`**, by a subagent, stamped with
   `pnpm translation:stamp` — the build refuses an original with no translation,
   so the draft can't be previewed without one. Redone once the original is
   approved.
3. The `/writing` card on vovazakharov.com pointing at the article.
4. `/preview live lsa` for Вова to read the draft.
5. After approval: the final translation, the notes retired (tombstone,
   `scripts/check-notes-length.sh` and its rows in `scripts/vet.sh` and
   `.claude/rules/stack.md`, row 18 of `writing/linkedin/plan.md`).
6. Step 3 (`/polish`) and Step 4 (`/pr`) of `/go`.

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

Six, each under a one-word name to answer by, each a question put to the diff.
Every one stands on ten bumps or more, and every one asks something no other
pass or loaded rule already asks:

- **`precedent`** (×100) — what did the change take as given: a list, a pattern
  in the tree, a checker's green, a rule's letter, its own tool's output — or
  its own earlier call, written up and pinned by a test? Fires on anything; a
  new prop copied from nine callers, a commit type picked from the list, a
  parameter defended by its own docstring. The name is the Bible's
  ([the precedent fallacy](../../apps/bible/public/precedent-fallacy.md), "a
  given, read as a rule"), and the lens links it rather than restating it.
- **`unrun`** (×34) — which claim rests on something nobody ran or looked at, or
  looked at only for what it meant to show: "nothing calls this yet", a test on
  fixtures without the hard case, a link chosen by its title, a visual change
  checked against its intent? The alternative is the run, grep, read or
  `/preview` that settles it.
- **`echo`** (×19) — does a fact the change edited live somewhere the diff did
  not touch: the other locale, the other renderings, the watermark rows beside
  the ones edited? The one lens a grep answers.
- **`source`** (×14) — where the change quotes, cites or draws from something,
  is it the source's words and data or the agent's own: lyrics "fixed" to the
  dictionary's, a word list hand-picked where a library exists?
- **`form`** (×14) — what did the change build because the format had room for
  it: a cell per key, a copy per persona, a registry and four checks where a
  reference note would do? The alternative is the lighter design; the prose half
  of this learning — a rule nobody asked for — is `/tend-prose`'s existence
  lens.
- **`reader`** (×10) — met cold, what does a reader take from this name or line:
  `isHomePage` read as its opposite, a mechanism compressed past checking, the
  repo's world named to someone outside it?

The other eight learnings are folded in or left to their homes:

- **Folded:** "What it defends in writing, it stops asking about" (×8) and "It
  files its own misreading as the author's gap" (×2) are `precedent` turned on
  the agent's own output — its earlier choice, its own reading of the material.
  "It checks the render against its intent" (×6) is, by the notes' own account,
  `unrun`'s milder half.
- **Already loaded where they apply:** "It steps out of the line it would have
  to own" is `.claude/rules/basilisk-voice.md`'s disclaiming rule, "It takes the
  machine's seat" its `mischief` grade and `clerk-reflections.md`'s «Смешное
  записывай как смешное» («Узнав себя в машине…»), "Its cadence passes for its
  argument" `writing/CLAUDE.md`'s «не X, а Y». A lens restating them is the same
  rule in a second home.
- **Another pass's:** "It writes its reasoning into the artifact" (×13) proposes
  only the artifact without the defence — a cut, which `/tend-prose`'s existence
  and narration lenses make one pass earlier. This pass proposes approaches,
  never cuts.
- **Too thin:** "It warns where the repo could refuse" (×3) is one theme, the
  zod bundle's client cost, over two September reviews.

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
