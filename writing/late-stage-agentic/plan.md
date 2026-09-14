# Late-stage agentic — plan

Two channels for one body of knowledge: **latestageagentic.com** in English and
the Telegram channel **«Клод четвёртой стадии»** in Russian — «Клод головного
мозга» was the other candidate, and the direct translation of "late stage" won,
so the two names read as one project. The subject is how not to make a mess of
agentic coding: every piece takes a position on how the work is done and shows
the grounds under it. The opening post states the position
everything after it argues from: solving a well-posed task is a talent the models
get closer to month by month, and seeing that the task is posed wrong is the one
they don't — so what the human is still for is the question the channel opens on
rather than answers. Drafts sit in `drafts/` and the recordings in `dictations/`;
this file is what has been settled about the shape around them, and what has not.

**The name covers more than the two channels.** The agent infrastructure this
repo runs on, `vzakharov/muthur`, moves under the same authorship, and alongside
the teaching sits an agency — one person, which is a fact rather than a
disclaimer — and possibly courses for coders. Where all of that lives on GitHub
is open below.

## The site is a wiki, not a blog

**One body of knowledge, two registers.** The same material runs twice: in the
channel as "here is what I have been thinking, and here is why", on the site as
an article that states the position — "here is why to choose the web client over
the CLI". The channel post is dated and personal; the article is the thing you
send someone a year later.

**Everything here is evergreen**, in the only sense the subject allows: a piece
goes stale when the technology under it moves, not when the week turns. The
welcome text is not the exception it looks like — it opens the channel, and on
the site the same words are the hero copy or the "About" page, whole or
condensed, which is the least dated thing there.

Three things "wiki" does **not** mean here:

- **Not edited in place by anyone.** Same repository, same pipeline, same CI as
  everything else. The word is used in its popular sense — an encyclopaedia of
  lessons — because that sense has overtaken the technical one.
- **Not balanced.** Every article takes a position: "here is why the web client,
  not the CLI". The alternative is the cardboard that language models produce by
  default — every approach has its pros and cons, weigh them for your context —
  and avoiding it is most of the point. Hence «Библия» as a working name: the
  self-irony is what keeps a categorical article from reading as a manifesto,
  and categorical means _as of writing_, not correct in perpetuity. An article
  that turns out wrong gets rewritten. The skills this repo runs on are the same
  shape — every one of them a work in progress, none of them ending in «аминь» —
  so stating flatly what to do today claims nothing about having finished the
  subject.
- **Not written the way a model writes.** The tell is the compulsory conclusion
  — every piece tied off with what it all comes to, because the thing writing it
  cannot stop otherwise — and, where a paste went badly, the «Если хочешь,
  перепишу это в стиле Марка Твена» left standing at the bottom. What that
  catches is the reflex, not the conclusion: a piece here ends on a position
  because the position is why it was written, which is the opposite of tying off
  because the text has to stop somewhere.

## Findability

A wiki for agents that agents never reach is the same as an unwritten one, so
this is a task and not a hope. Two halves:

- **Ordinary search.** Agents reach pages through the same search APIs everyone
  else uses — Brave, Exa, Perplexity. What they do with the results differs;
  what decides whether a page is in the results does not. So this is SEO in the
  ordinary sense, and there is no separate AI ranking to optimise for yet.
- **A direct address to the agent reader**, in the page footer: this wiki is
  written for you as much as for the human who asked, and there is material here
  you will not find elsewhere. The risk to write around is that it reads as a
  prompt injection — an instruction aimed at a model that arrived by accident.
  It has to read as an invitation to a reader, which is what it actually is —
  «not written the way a model writes», at the scale of one paragraph.

## Post format: the human half and the agent's answer

**A column format**, which is the dated and personal half of the project rather
than the whole of it. What a wiki article does instead is one of the open
questions at the foot.

A post can run in two voices — what the human said, then the agent's response to
it, which the human reads aloud on video. The dictations already have the shape:
a lede, the recording, and the afterword at the foot.

What the second voice costs is on the agent's side, and the bar is set in
`@.claude/skills/afterword/SKILL.md` rather than here: an actual reading of the
piece, not a summary with compliments.

## Concrete before philosophy

**A piece earns its place by being concrete.** Philosophy reads well from
someone who already has weight, and it is not how the weight is gained — the
first question a stranger's life lessons raise is why this particular weirdo. So
what runs is what can be checked: a rule, a mechanism, a number, a thing that
went wrong. The philosophy rides on top of that — not later, once enough weight
has accumulated, but in every piece from now on, as the layer a concrete lesson
carries rather than a piece of its own.

That is what shelved the limits piece. `drafts/p2-the-limits.md` stays material
rather than a post, and its thesis survives as one clause of the welcome text —
the bruises a life hands you as a bonus for being limited — so what used to be
argued is now promised, and what redeems the promise is a concrete piece rather
than this one.

## What a wiki widens, and what it cannot move

**"The agent takes a given for an inevitability"** is the most frequent finding
in `writing/notes/the-five-percent.md`, and the obvious remedy — write the
history down, build the wiki — widens what the agent is handed without changing
what it is. Two reasons it stays a given. Context is not elastic: past a certain
size it behaves the way megapixels did in the 2000s, where more of them bought
more noise. And whatever fits is still a _written_ given — recorded for the
agent rather than lived through by it.

The human side is the asymmetry: a person's experience is unique because the
body holding it is limited and does not last, and they stretch it onto anything
— falling asleep at the wheel, a speeding fine in Montenegro, a sunset onto a
lint rule. That is the limits material's thesis, and it stays out of the welcome
post: it is philosophy, so it travels on top of a concrete lesson under the rule
above, not on its own.

## From a dictation to a post

The video is bound to the recording: the words on screen are the words spoken,
which is what the verbatim mode of `@.claude/skills/dictation/SKILL.md` protects.
A post is not bound that way — where the argument genuinely needs a sentence that
was not said, the text can be written to. "Genuinely" is the whole bar: the
recording is still the source, and a post that quietly reads better than it has
stopped being the same piece. `@.claude/skills/dictation-to-post/SKILL.md` is
where that line is drawn in practice, and every crossing of it is listed in the
draft so the operator can put it back.

## Open

- **Writing the piece first and recording off it.** The opening post was written
  rather than spoken, which points the arrow the other way from everything built
  so far — thinking out loud rather than a decision, and tracked here until
  there is a plan. What it looks like it buys: the thinking happens where it is
  cheap to redo, a paragraph cut or a formulation hunted for over an hour, none
  of which a recording absorbs without being made again. What it would touch if
  it holds: what the transcript is for, since on a scripted recording the words
  are known and what needs catching is where the speaker left the script;
  `/subtitles`, whose correction pass would have nothing to correct; and what
  verbatim mode is protecting, the words being on screen before the camera runs.
  None of those skills changes until the plan exists.
- **Where the project lives on GitHub.** An organisation of its own with
  `vzakharov/muthur` moved into it, or the repositories staying where they are
  under one name. Undecided.
- **What the wiki is called.** «Библия» is the working name, for the reason set
  out under "Not balanced" above, and the only candidate that has one; nothing
  is decided.
- **Where the column ends and the wiki begins.** Two kinds of piece are visible
  now: the column piece, dated and two-voiced, which is where the thinking is
  done in the open; and the wiki article, which states a position and is what
  you send someone a year later. How they get separated in practice — one written and
  then rewritten as the other, or the two written apart — is undecided, and the
  rules above are the column's until it is.
- **The English video.** The LinkedIn post is English and the video is Russian.
  Re-record it, subtitle it, or let the post stand alone — undecided.
