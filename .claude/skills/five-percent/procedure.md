# The five-percent pass

Followed by a subagent: `/polish`'s, as its third pass, or the one
`@.claude/skills/five-percent/SKILL.md` launches. It puts § "The question" to a
branch's diff and posts what it finds as one review on the PR. **It writes
nothing to the tree** — no edit, no commit, not even `/polish`'s empty mark — so
a `/polish` run reports this pass apart from the two that commit.

## The question

**What did the change take as given — down to whether the thing it edits should
exist at all?** A list it picked from, the callers it copied, a rule's letter, a
checker's green, its own earlier call, the page or file it was asked to touch.
Seven weeks of reviews broke that one frame more than every other mistake put
together, and it cannot be seen from inside the change: the change's reasoning
is sound within it. `sites/bible/public/precedent-fallacy.md` is the long
account.

**The alternative changes the frame rather than reasoning inside it**: the value
the list lacks, the callers that are the exception read as the rule, the rule's
purpose put to the case, the page that should go rather than be tidied.

**Specimen:** asked to add an article card to `/writing`, the change checked the
card's copy against the article's; the review asked why a fractional CTO's site
had a page of articles from another career at all, and the page went.

## Scope

The range is `@.claude/skills/polish/passes.md` § "Scope"'s — the PR's base,
fetched, and `origin/<base>...HEAD`, staged copies read by their diff against
the real file — with a floor of its own in place of that file's.

**The floor is a marker in this pass's own last review**, since the pass commits
nothing a `git log` floor could find, and `/polish`'s moves on runs where this
pass posted nothing:

```bash
gh api repos/{owner}/{repo}/pulls/<n>/reviews --paginate \
  --jq '.[].body | capture("<!-- five-percent: (?<sha>[0-9a-f]{40}) -->").sha' | tail -n 1
```

A SHA → the scope is `<sha>..HEAD`; nothing → the whole range. A SHA the branch
no longer carries (`git merge-base --is-ancestor <sha> HEAD` fails) is a floor
that lies, and the whole range stands. A `/polish full` drops the floor here
too.

**The plan under `docs/plans/` is read as the record of intent**, and the
operator's answers on the PR's threads with it: a decision either records as
theirs is out of reach (§ "Exclusions").

## The bar

**A proposal is an alternative approach, concrete enough to pick:** what the
change took as given, the other way to do it, and what that way costs. "Consider
whether…" is not one, and neither is a cut — prose that should not exist is
`/tend-prose`'s, which ran before this.

**The operator could plausibly pick it.** That is the whole bar against noise.
At most three per run, ranked by how much taking it would change; a run that
finds none posts nothing, and says so. **An empty-handed run is the ordinary
result**, not a reason to look harder: a proposal that has to be argued into
existence is the agent filling a form.

**Each proposal is graded:**

- **`critical`** — taking it would change what the merge ships: a page says the
  wrong thing, a behaviour is wrong, a fact contradicts its other copy. Not how
  the thing is built.
- **`optional`** — everything else, and most proposals.

## Exclusions

Never a proposal on the operator's own calls:

- **Taste** — a word, a colour, the order of a list they chose.
- **A hook** — what a piece leads with.
- **A verdict on their own material** — whether a dictation, a draft or a song
  says what its author meant.
- **A decision the plan or a thread records as theirs**, however it reads now.

A comment the tree already answers is not a proposal either: check before
posting.

## Posting

One review on the PR, by `@.claude/skills/feedback/SKILL.md` § "Posting it"'s
three calls, `COMMENT` always, with its mechanics — signed by the footer alone,
body as text, no thread resolved — and two differences:

- **Every proposal is an inline comment.** One that points at lines anchors to
  them (`subjectType: "LINE"`); one about the change whole anchors to the file
  it most concerns (`subjectType: "FILE"`) — the anchor being where it is
  answered, not a claim about its scope. A review body has no thread to reply
  in, so nothing there asks for a reply.
- **The body is one line and the marker**: `**/five-percent**:`, how many
  proposals, of which critical, and on the last line
  `<!-- five-percent: <full head sha> -->`.

Each comment opens on the marker, then the pass's name and its grade, then the
alternative:

```
<!-- five-percent proposal · an answer here is scored by .claude/skills/five-percent/verdicts.md -->
**/five-percent** · optional

<what the change took as given>

<the other way>

<what it costs>
```

**Each of the three is a sentence or two the operator follows on one read**, in
their nouns per `.claude/voice/voice.md`: what a thing does, never the name a
toolchain gives it — "Next refuses to build the site", not "the RSC transform".
Evidence they would want to check goes after, behind a file path. A proposal the
operator cannot parse cannot be picked, so it fails the bar however sound.

The marker is what tells a proposal from an agent's reply in the PR export, both
posted under the operator's login, and what sends the session answering it to
`@.claude/skills/five-percent/verdicts.md`. It is hidden on GitHub, so there the
visible name is what tells the operator which pass a comment came from. **In the
operator's language** — a review is conversation (CLAUDE.md § "Language").

**No PR, no review.** The pass reports itself deferred and posts nothing
elsewhere; without a marker posted, the next run's floor stays where it was.

**An answered proposal becomes work the ordinary way**, through
`@.claude/skills/handle/SKILL.md` in a session the operator opens for it. The
session that posted it does not act on it: that would make one session both
reviewer and author.

## The report

One line for the caller to relay: the review's link and each proposal's grade,
or "nothing to propose" with the scope it read, or "deferred: no PR".
