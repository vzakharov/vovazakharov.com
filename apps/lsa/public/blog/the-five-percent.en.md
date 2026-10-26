---
description: >-
  For seven weeks an agent wrote down every time my review changed something it
  had already settled. 214 entries, fourteen mistakes, and one of them is 42% of
  the lot.
translatedFrom: a21b96e24af1
---

# The Five Percent

<!-- DRAFT: three openings to choose from. Keep one; we’ll delete the other two along with this comment. -->

**Opening A -- the number.**

Over seven weeks my agent decided something 214 times, and I changed that
decision. Every time, it wrote it down and filed it under a kind of mistake.
The kinds came to fourteen, and one of them accounts for 90 cases out of 214.

**Opening B -- a confession.**

In almost everything the agent does, it knows more than I do. I’ve been saying
for a long time that a human is still needed for the remaining five percent
-- and until recently I couldn’t say what exactly is in them. Now I can, with
numbers.

**Opening C -- a case.**

The agent was picking a prefix for a commit: `feat`, `fix`, `docs` and so on
down the list. The change didn’t fit any of them. It honestly weighed three
options and picked the least unfitting one. All it took from me was one
phrase: let’s add `content:`. Over seven weeks there were 214 phrases like
that, and almost half of them -- about the same thing.

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

## What came out

Top to bottom:

- **Whatever it’s given, it takes as a given** -- 90
- **Explaining how the code works stands in for running the code** -- 28
- **Fixes the copy in front of it, not the fact behind it** -- 19
- **Ask for a source -- get its version of the source** -- 14
- **Give it a form -- it’ll fill in the form** -- 14
- **Writes its reasoning straight into the result** -- 13
- **The text answers its question, not the reader’s** -- 10
- and seven more, from eight cases down to two.

The first line is 42% of all cases. The first three, 64%. The first seven,
88%. And the bottom five kinds together come to twelve cases, 5.6% -- which,
you’ll agree, is the universe already mocking me a bit. 🙈

## The main mistake

Ninety times out of two hundred and fourteen the agent got handed some frame
-- a list, a dictionary, a rule, the way it’s already done in the code -- and
reasoned _inside_ it, not _about_ it. In a neighbouring project, [the Bible of
agentic development](https://agentic.bible/precedent-fallacy), this is called
the precedent fallacy: a given, read as a rule.

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

## Two families

If you step back from the counters, the mistakes fall into two heaps.

The first is not noticing that the frame is ours. A list of prefixes we put
together ourselves and can add to. A check we wrote ourselves, and which
passed even though the thing it checks is done wrong. Our own linter config.

The second is more interesting, because it looks like the opposite of a
mistake. The result is neat, well-reasoned and efficient, and those very
qualities are what make it wrong. The agent was allowed to mark who sings which
verse in a song -- it built a registry of performers and four build-time
checks. What I needed was “just for reference.” Three times it wrote -- in a
comment, in a script’s header and in the change description -- that GitHub
marks a build ready “in a few minutes.” One API request showed three seconds.

“Be more careful” doesn’t help here: there’s plenty of care in there. What’s
needed is a human, and not necessarily one who knows more.

## Why you shouldn’t trust these numbers too much

One reviewer. One agent (Claude Code, if you’re curious). Seven weeks. One
project, and a rather strange one at that -- a personal site that four more
sites live on, plus songs and a character who writes reflections.

The counting and classifying was all done by the agent itself. It was the one
deciding that this is the same case as last week, and this is a new kind.
The wording of the headings is its too. So this file is at once a measurement
and its self-portrait, and here you can’t pull one apart from the other.

The count grew with how much I was looking, and says nothing about how often
the agent gets things wrong: 9 cases by September 7, 69 by the 21st, 169 by
October 13, 214 by the 26th. What I didn’t notice didn’t make it into the
file.

And I missed too. The file has a “not misses” section, and in it sit my
comments that the code already answered -- for instance, the question of
whether the validation library ends up in the browser bundle.

## What came of it

The file is closed. The most frequent kinds of mistakes (some merged together,
some handed off to other checks) became six questions that another agent now
asks of every change before it gets to me: what did the change take as a
given? what in it did nobody run? where else does the fact it corrected live?
It doesn’t fix anything itself: it leaves its answers on the review as
alternatives, and I’m the one who picks.

It’s an agent reading an agent, so they share their blind spots. A frame that
none of the six questions names, it’ll miss. That’s exactly the five percent
I’m still here for.
