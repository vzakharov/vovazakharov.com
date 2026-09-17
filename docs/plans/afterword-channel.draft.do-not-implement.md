> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) _before_ touching code.

# `/afterword` → `/feedback`: the reading goes on the PR (#51)

## Why the format changes, and not the prose

The issue's diagnosis is the one that decides the shape of this change, and it is
in the operator's own words on #50 (`docs/pr/50/pr.md`, thread T93):

> Вроде в скилле у нас всё это уже сказано, но, кажется, промахиваемся все равно.
>
> Давай попробуем изменить формат. Вместо дополнительной секции, `/afterword` --
> который надо тоже переименовать (типа `/feedback`) будет оставлять код ревью
> прямо на гитхабе.

The skill already forbade what kept happening. `@.claude/skills/afterword/SKILL.md`
§ "Three things it must keep straight" opens on **"No account of how the afterword
got here"**, and `CLAUDE.md` § "GitHub comments" already requires a reply on every
comment the operator points at. Both rules were in force through three review
rounds on #50 and the sections still opened on «про мегапиксели я был неправ».

So the cause is not a missing rule. **The file was the only channel the skill
had**, and the agent holding a settled exchange had one place to put both halves
of it. A boundary between "thought" and "discussion" inside one channel has
nothing to hold it — which is what «иначе будем продолжать путаться» names.
Moving the reading to the PR removes the boundary rather than restating it: the
review thread is the discussion channel, so a thought posted there is already in
the right place and there is no second channel to leak into.

**The durability objection the skill currently raises is answered by tooling that
postdates it.** § "What it is for" argues that "a reading typed into a PR thread
is read once and then scrolled past". `scripts/export-github-item.py` exports a
PR's review threads to `docs/pr/<n>/pr.md` — bodies, inline comments grouped into
reply chains, and the lines each hangs off. That is how this plan read the comment
quoted above. The argument goes out rather than getting rebutted in place, per
`CLAUDE.md` § "When a convention goes away, stop stating it".

## The change

### 1. Rename the skill directory to `feedback`

`git mv .claude/skills/afterword .claude/skills/feedback`, and rewrite the
frontmatter `description` for the new output: a review on the PR, not a section
in a file. Invocation becomes `/feedback <file> [<language>]`.

`/feedback` is the operator's own suggestion and collides with nothing: it is a
noun, so it is out of reach of the go-ahead-token reading `CLAUDE.md` § "Adding or
renaming a skill" warns about, and `/review` is not available — it would read as
`/code-review`, which is a different thing (correctness bugs in a diff, not a
reading of a piece).

No `catalog.md` exists here — this repo is downstream of `vzakharov/muthur` — so
`scripts/check-skill-catalog.sh` assertions 2–3 skip and only assertion 1 applies:
every `@`-reference into `.claude/` must resolve after the move.

### 2. Rewrite the skill around the review

What survives unchanged is the bar, which is the half worth keeping: § "The
section"'s account of what earns a block (what the piece argues under what it
says, what it takes for granted, where the argument is missing a step) and its
failure mode (a summary or a compliment). What changes is everything about where
it goes.

- **End state** — the PR carries a review whose comments are the reading, each
  anchored to the lines it is about; the file is untouched.
- **§ "What it is for"** loses the durability argument and the "kept rather than
  discussed" framing, both of which this change overrules. What replaces it is
  shorter: this is the agent's reading of a piece, and it goes where a reading is
  answerable.
- **§ "Three things it must keep straight"**, bullets 1 and 2, largely retire.
  "No account of how the afterword got here" and "a finding the author has
  answered ends at the settled reading" were both compensating for the single
  channel; a review comment sits in the thread where the exchange happened, so
  saying «я был неправ» there is correct rather than archaeology. Bullet 3 — what
  would be cut from a post is not what gets cut from the source — is about the
  material and stays.
- **The posting mechanics are cited, not restated.** `CLAUDE.md` § "GitHub
  comments" owns them: the attribution footer, bare SHAs, a body posted as text
  rather than as an `@path`, and — load-bearing here — **never resolve a thread**.
  The skill names the tools (`mcp__github__pull_request_review_write` to open a
  pending review, `add_comment_to_pending_review` per block, `submit_pending`) and
  points at that section for the rest.
- **Language stays a parameter**, defaulting to the material's language. A review
  on a Russian dictation is written in Russian — the comment answers the piece.
- **A block with no line to hang off goes in the review body.** Most of what the
  six existing sections contain is about a piece whole rather than a line in it
  (p2-the-limits' reading is eight blocks, most of them about the argument's
  shape). The review body is where those go; inline comments are for the blocks
  that genuinely point at a passage. This is the one thing the move could lose,
  and naming the body as the home for it is what stops a whole-piece reading from
  being chopped into eight false line anchors.
- **No PR, no review.** The skill requires a PR on the branch and says to run
  `/pr` when there isn't one, rather than falling back to a file section. Two
  output shapes is what produced the confusion; one is the point of the change.

### 3. Repoint `/dictation`

`@.claude/skills/dictation/SKILL.md` names the afterword in four places, and the
fix is the same in each: the afterword stops being a part of the file.

- **§ Step 3's five-parts table** loses its `The afterword (Step 5)` row.
- **§ Step 5** becomes "The lede and the beat sheet", losing its third bullet and
  the `## Заметки агента` heading it names.
- **The skill's end state** drops "and your own reading of what they said".
- **§ "What happens after"** gains `/feedback` alongside `/subtitles` and
  `/dictation-to-post` — the two things that already happen to an agreed
  transcript later. That is the right home: those run after the operator has the
  file, and a review needs a PR, which `/pr` has opened by then.

### 4. Repoint `CLAUDE.md` § "Working with skills"

The catalog entry at `CLAUDE.md:288` currently reads "written into the file itself
rather than into a thread", which the change inverts. It also calls the skill "the
second voice of the two-voice post format" — see the open question below, which
this entry's wording depends on.

### 5. Leave the six existing sections alone

`## Заметки агента` stands in five dictations and `drafts/p0-welcome.md`. All six
are on `main`: #50 merged at 2026-09-16T21:39Z. They stay, and the reasons are
worth writing down because the issue explicitly asks:

- They are in the state the operator approved — the last round rewrote all three
  so that «в них стоят мысли, а не обсуждение», and he took that.
- #50 is merged, so there is no open PR to re-post them onto. A line-anchored
  review on a merged PR is a worse artifact than the sections are.
- Deleting reviewed content from `main` is not what a skill rename is for.

## Open questions

**1. What happens to the two-voice post format?** `writing/late-stage-agentic/plan.md`
§ "Post format" says a post can run in two voices — "what the human said, then
the agent's response to it, **which the human reads aloud on video**" — and points
at the afterword skill for the bar. That pointer does not survive this change, and
the reason is not mechanical: a review is written for the operator, the second
voice for the wiki's readers, and prose written for one is wrong for the other.
In practice the second voice has never been produced — all six existing sections
are feedback, not publishable response — so specifying it now would be invention.

- **(a) — recommended, and in force above.** Repoint `plan.md` § "Post format" so
  it stops citing the skill: state that the second voice is unwritten and its bar
  unsettled, and leave it as one of the section's open questions. The pointer
  stops dangling and nothing is invented.
- (b) Keep a file-section output in `/feedback` for the second voice specifically.
  Rejected in the plan above: it restores the two output shapes the change exists
  to collapse.
- (c) Spec the second voice now, as its own skill. Premature — there is no
  instance of the artifact to write the bar against.

**2. Does every inline comment carry the attribution footer?** `CLAUDE.md`
§ "GitHub comments" says every comment, review, review reply or issue comment
must end with it. An eight-block reading is then nine footers on one PR. The plan
above follows the rule as written; if that reads as noise, the fix is an exception
stated in that section — a change to `CLAUDE.md`'s rule rather than a silent
deviation in this skill, and out of scope here unless you say otherwise.

**3. The six sections** — the plan leaves them (§ 5). Say so if you would rather
they came out.

## Files touched

| File                                          | What                                                                 |
| --------------------------------------------- | -------------------------------------------------------------------- |
| `.claude/skills/afterword/SKILL.md`           | `git mv` to `feedback/`, rewritten around the review                 |
| `.claude/skills/dictation/SKILL.md`           | four references repointed; afterword stops being a part of the file  |
| `CLAUDE.md`                                   | catalog entry at § "Working with skills"                             |
| `writing/late-stage-agentic/plan.md`          | § "Post format" pointer, per question 1                              |

`writing/notes/the-five-percent.md` mentions the afterword in four dated entries.
Those are records of what happened under the old format and stay as written; the
file is also a subagent's to edit, per `CLAUDE.md` § "GitHub comments".

## DRY notes

- **The posting mechanics are not duplicated.** `CLAUDE.md` § "GitHub comments"
  is the home for the footer, bare SHAs, body-as-text and never-resolve, and
  `/feedback` cites it. Restating them in the skill is how one home goes right and
  the other quietly wrong.
- **The bar for what earns a block is moved, not copied.** It lives in one skill
  before and after; `writing/late-stage-agentic/plan.md` cites rather than
  restates it today, and under question 1(a) stops citing it entirely.
- **No shared abstraction is extracted for review-posting**, and forcing one would
  be net-negative. `/code-review --comment` also posts inline PR comments, but what
  it shares with `/feedback` is three MCP calls in a fixed order — the judgment
  either side of them (what a finding is, what earns a comment, what language it
  is written in) is the whole of each skill and has nothing in common. A helper
  wrapping the three calls would carry no judgment and save no prose.
- **`/dictation` keeps citing `/feedback` rather than absorbing it.** The reading
  is not specific to recordings, which is why it was a separate skill before this
  change and stays one after.
