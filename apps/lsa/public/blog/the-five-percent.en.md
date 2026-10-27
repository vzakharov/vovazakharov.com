---
description: >-
  For seven weeks an agent wrote down every time my review changed something it
  had already settled. 214 entries, fourteen kinds of mistake -- and nearly all
  of them turned out to be one: whatever it’s given, it takes as a given.
translatedFrom: bba2ecf03a9e
---

# The Five Percent

<!-- DRAFT: three openings to choose from. Keep one; we’ll delete the other two along with this comment. -->

**Opening A -- the number.**

Over seven weeks my agent decided something 214 times, and I changed that
decision. Every time, it wrote it down and filed it under a kind of mistake.
The kinds came to fourteen. When I reread them all, there was one left.

**Opening B -- a confession.**

In almost everything the agent does, it knows more than I do. I’ve been saying
for a long time that a human is still needed for the remaining five percent
-- and until recently I couldn’t say what exactly is in them. Now I can, and
it’s one thing.

**Opening C -- a case.**

The agent was picking a prefix for a commit: `feat`, `fix`, `docs` and so on
down the list. The change didn’t fit any of them. It honestly weighed three
options and picked the least unfitting one. All it took from me was one
phrase: let’s add `content:`. Over seven weeks there were 214 phrases like
that, and almost all of them -- about the same thing.

---

## What I counted

From September 7, the repository of this site had a file in it. The rule was
this: after every review where my comment changed something the agent already
considered settled, the agent itself adds an entry there: the kind of mistake
in one phrase (“whatever it’s given, it takes as a given”), a counter in the
heading and a line about the specific case. A new case of an old mistake is
plus one to the counter, a new mistake is a new section.

Not everything counted. A case goes in the file only if the agent could have
seen it on its own and didn’t. If I just made a call that was mine to make --
what hook a post has, where the theme switch lives -- that’s not its miss. If
I corrected facts in my own material that only I knew -- also no. And if the
agent caught a mistake itself, without me -- that’s the exact opposite of what
the file is trying to show, so that’s out too.

By October 26 there were 214 cases and fourteen kinds of mistakes.

## The main mistake

The fattest section -- 90 cases, 42% of the lot. The agent got handed some
frame -- a list, a dictionary, a rule, the way it’s already done in the code
-- and reasoned _inside_ it, not _about_ it. In a neighbouring project, [the
Bible of agentic development](https://agentic.bible/precedent-fallacy), this
is called the precedent fallacy: a given, read as a rule.

Nine places in the code opened a link in a new tab, and the agent proposed
making a separate parameter for it. While in the three places where the link
opened in the same tab, it just happened that way, nobody decided it. It read
the `artist` role in the time tracking as “visual artist” and filed the site’s
emblems under it: “artist is about the musician.” It applied the rule “a
page’s published address doesn’t change” to a renamed song and left it with
the old address: “change the slug too, no big deal.”

The nastiest thing about this mistake: the reasoning inside the frame is
correct. A second agent, asked to check the first, will approve it. The only
way to catch it is to move the frame itself.

## And the rest of them too

The agent opened the other thirteen sections as separate mistakes, and their
names differ. But ask of each one what exactly the agent took as a given, and
there’s almost always an answer:

- **Explaining how the code works stands in for running the code** (28) --
  the given was its own explanation. Three times it wrote that GitHub marks a
  build ready “in a few minutes”; one API request showed three seconds.
- **Fixes the copy in front of it, not the fact behind it** (19) -- the
  given: there is one copy, the one that’s open.
- **Ask for a source -- get its version of the source** (14) -- the given:
  the way it remembers the text is the way the text looks.
- **Give it a form -- it’ll fill in the form** (14) -- the given: if the
  format allows it, that’s how it should be done. The agent was allowed to
  mark who sings which verse -- it built a registry of performers and four
  build-time checks. What I needed was “just for reference.”
- **The text answers its question, not the reader’s** (10) -- the given: the
  way it understood is the way the reader will understand.
- Three smaller ones (8, 6 and 2) -- its own past decision, its intent in
  place of the rendered page, its reading in place of the author’s text.

Together with the main one, that’s 191 cases out of 214, 89%. Five sections,
23 cases, slip past it: the agent writes its reasoning straight into the
result (13), ducks a remark it would have to answer for itself (3), and three
more trifles of two or three cases each.

The agent sorted all of this into fourteen kinds and turned them into six
questions for review. I read all six several times and still couldn’t quite
say how they differ from one another. Which, I suppose, was the answer.

## Why you shouldn’t trust these numbers too much

One reviewer. One agent (Claude Code, if you’re curious). Seven weeks. One
project, and a rather strange one at that -- a personal site that four more
sites live on, plus songs and a character who writes reflections.

The counting and classifying was all done by the agent itself. It was the one
deciding that this is the same case as last week, and this is a new kind.
The wording of the headings is its too. So this file is at once a measurement
and its self-portrait, and here you can’t pull one apart from the other.

The “it’s all one thing” recount is worse still. It was done after the fact,
already knowing what we were after, and if you want it to, almost any mistake
fits under “took something as a given,” earthquakes included. 89% isn’t a
measurement, it’s a reading. The one thing I can honestly say: twenty-three
cases didn’t fit it, however hard I tried.

The count grew with how much I was looking, and says nothing about how often
the agent gets things wrong: 9 cases by September 7, 69 by the 21st, 169 by
October 13, 214 by the 26th. What I didn’t notice didn’t make it into the
file.

And I missed too. The file has a “not misses” section, and in it sit my
comments that the code already answered -- for instance, the question of
whether the validation library ends up in the browser bundle.

## What came of it

The file is closed. In its place, another agent asks every change one
question before it gets to me: what did it take as a given -- down to whether
the thing it edits should exist at all? It doesn’t fix anything itself: it
leaves its answers on the review as alternatives, and I’m the one who picks.

Its very first review took the same bait. There was a `/writing` page on
vovazakharov.com with articles from my past life as a writer, and a card for
this article had been added to it. The agent noticed that the article now had
two blurbs, worded differently, and proposed keeping one. The right question
was “why does a fractional CTO’s site need this page at all?” I deleted the
page. The agent got 0.3 out of 1: it found the duplicate, but not the given.

Every one of its suggestions now gets a grade like that. In a couple of months
we’ll see whether this Munchausen is pulling himself out by his own pigtail or
merely holding on to it with great elegance.

It’s an agent reading an agent, so they share their blind spots. A frame it
takes as a given itself, it’ll miss. That’s exactly the five percent I’m still
here for.
