> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

# The five percent: a polish pass and an article

`writing/notes/the-five-percent.md` has done its job as a collection: 212 bumps
over fourteen learnings, 6 September to 26 October, the top one
(`What it was handed, it treats as fixed`, ×88) carrying 41% of them on its own.
Two things come out of it:

1. **A skill**, `/five-percent`, that puts those learnings to a branch's diff as
   a third `/polish` pass and **edits nothing**: it posts its alternatives as a
   review on the PR, anchored to the lines they are about, for the operator to
   answer in-thread.
2. **An article**, on a blog that vovazakharov.com does not have yet. It is not
   a Bible piece: the Bible states a position on how to work, and this is a
   measurement of one agent under one reviewer, with its deflating half.

## Shape: a pizza, two slices

The slices share no code and ship on different clocks: the skill can merge as
soon as it works, the article only once Вова has approved its text, which takes
as many rounds as it takes. Holding the skill hostage to the prose is the cost a
single PR would carry, so each ships as its own PR.

**Issues, filed by `/go` on the go-ahead**, in dependency order (neither depends
on the other; slice 1 is the one this plan specs):

- **Parent** — _The five percent: a review pass and an article from the notes._
  Grouping only; closes when both children are done.
- **Child 1 (this plan)** — _`/five-percent`: the review notes as a read-only
  polish pass._ The skill, its wiring into `/polish`, `/go` and `/finalize`, and
  the end of the mandatory notes entry.
- **Child 2** — _A blog on vovazakharov.com, opening with the five-percent
  article._ The collection, the article, and the notes file's retirement.

Already tracked: nothing covers either slice.
[#187](https://github.com/vzakharov/vovazakharov.com/issues/187) (move the six
`vovas-music/blog` posts onto a blog here) waits on child 2's blog and stays its
own issue — it says outright it is not a request to start one; child 2's body
links it.

## Slice 1 — `/five-percent`

### What the pass does

Reads the branch's diff and its plan, puts each lens in the catalogue to it, and
posts **one review** on the PR (`COMMENT`, never approve or request changes):

- **A proposal is an alternative approach**, concrete enough to pick: what the
  change took as given, the other way to do it, and what that way costs.
  "Consider whether…" is not one.
- **Inline where it points at lines**, in the review body where it is about the
  change whole — `/feedback`'s placement rule, for `/feedback`'s reasons.
- **Each proposal names its lens**, so the operator's reply also tells the
  catalogue which lenses earn their keep.
- **The bar is that the operator could plausibly pick it.** At most five per
  run; a run that finds none posts no review and says so in the report. An
  empty-handed run is the ordinary result, not a failure to try harder.
- **Never on the operator's own calls** — the notes' "Not bumps" carried over as
  the pass's exclusions: taste, a hook, a verdict on his own material, a
  decision the plan records as his.
- **In the operator's language** (a review is conversation, `CLAUDE.md` §
  "Language").

It writes **nothing** to the tree — no commit, not even `/polish`'s empty mark.
An answered proposal becomes work the ordinary way: `/handle` reads the review's
threads as feedback.

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
  treats a review **this run posted** as something to decide, and stops: it is a
  question addressed to the operator. Proposals from an earlier run are already
  in front of them and do not block.
- **On demand**, `/five-percent [<branch|#PR>]`.

**It runs in a fresh subagent, never in the authoring session**, for `/polish`'s
reason: the author reads the diff with the frame that produced it, and the frame
is what the pass is looking for. So the skill splits as `/polish` does —
`SKILL.md` launches a subagent with `procedure.md`; `/polish`'s own subagent
loads `procedure.md` directly, already being fresh.

### Files

- `.claude/skills/five-percent/SKILL.md` — description, the subagent launch,
  where it runs. A new skill's description enters the always-loaded listing, so
  it goes through `scripts/staged.sh` (`.claude/rules/staging.md`).
- `.claude/skills/five-percent/procedure.md` — scope and floor, the bar, posting
  (by reference to `/feedback` § "Posting it"), the exclusions, the report line.
- `.claude/skills/five-percent/lenses.md` — the catalogue: one section per
  learning, in the notes' count order, each holding **the question to put to a
  diff**, **what an alternative looks like**, and **one compressed specimen** to
  recognise it by. No counts and no dates: they served the post, and a lens is
  ordered by how often it fires, which the order already says. The two families
  close it.
- `.claude/skills/polish/passes.md` — the third pass, and "two passes" becoming
  three in its prose and its Do NOT.
- `.claude/skills/polish/SKILL.md` — its description names the passes (`/dry`,
  then `/tend-prose`), so it is staged too.
- `.claude/skills/go/SKILL.md` — Step 4's one line.
- `.claude/skills/finalize/SKILL.md` — the `and merge` stop.
- `CLAUDE.md` (staged) — § "GitHub comments" loses its last two paragraphs: the
  mandatory notes entry and the subagent that writes it. The notes are closed.
- `writing/notes/the-five-percent.md` — its header says it is closed to entries
  and retires with the article (child 2), per `writing/CLAUDE.md` § "Layout and
  frontmatter". Its "How this file is kept" stays until then; nothing appends.
- `writing/linkedin/plan.md` row 18 — the collection is closed, and the post now
  points at the article rather than being written from the notes.

### Accepted cost

The pass is an agent reading an agent, so it shares the blind spots it is
looking for; the catalogue is what it has that the author did not — a list of
frames to question, written by the reviews that broke them. It will miss the
frame no lens names, and that is the five percent the operator is still for.

## Slice 2 — the blog and the article (coarse)

- **The blog**: a `blog` collection on `vova` at `/blog`, through the existing
  registry — a `COLLECTIONS` entry, its schema in `COLLECTION_SCHEMAS`, an intro
  in `COLLECTION_INTROS`, an index and an article router binding
  `collectionIndexRoute`/`articleRoute`, an RSS feed. English, unlocalized.
  Linked from the home page's `SEE_ALSO` and from `/writing`, whose Glitchporn
  section stays as it is. Printable or not is decided when the slice is planned.
- **The article**: `apps/vova/public/blog/the-five-percent.md`, English, a
  **measurement** in `writing/CLAUDE.md`'s sense — 212 bumps, the counts, the
  two families, and its deflating half kept in: one reviewer, seven weeks,
  counted and judged by the agent being counted, and the reviewer's own misses
  ("Not bumps"). Every figure re-derived from the file and its `git log -p`, not
  copied off the headings. The hook is Вова's: the draft offers options rather
  than picking one.
- **The draft is the page on the branch.** The PR does not merge until the text
  is approved — merge is deploy — and `/preview live vova` is where it is read.
- **The notes retire with it**: `writing/notes/the-five-percent.retired.md` as
  the tombstone (the tree cites the file from
  `writing/late-stage-agentic/plan.md` and the megabeast notes), and
  `scripts/check-notes-length.sh` with it if nothing else uses it. Row 18 points
  at the article.
- **Then [#187](https://github.com/vzakharov/vovazakharov.com/issues/187)** has
  its blog.

## DRY notes

- **Posting is `/feedback`'s**, referenced from `procedure.md` rather than
  copied: the three MCP calls, `COMMENT`, inline-versus-body. What differs — the
  bar, the lenses, the floor — is this skill's own.
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
  retire in slice 2, leaving the lens file the only home.
- **The blog adds no code path** — one more entry in registries that already
  serve six collections; `maya-blog` is the precedent.
