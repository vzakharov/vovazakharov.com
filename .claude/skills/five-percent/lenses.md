# The lenses

Six questions to put to a diff, each under the name a proposal opens on. They
are ordered by how often the reviews that wrote them found each one, so the
first is the one to suspect first. Each is a frame the agent that wrote the
change could not see from inside it, which is why none of them is answered by
re-reading the change's own reasoning: that reasoning is sound inside its frame.

This file is edited deliberately. A lens joins when reviews keep finding a frame
none of these names, and leaves when its proposals keep coming back declined.

## `precedent`

**The question:** what did the change take as given — a list, a pattern in the
tree, a checker's green, a rule's letter, its own tool's output, or its own
earlier call, written up and pinned by a test?

**Put to:** anything. A choice the diff makes among options it found rather than
options it could have made: a type picked from a list, a prop copied from the
callers around it, a rule applied past the case it was written for.

**The alternative:** the frame changed rather than reasoned inside — a value the
list lacks, the callers that are the exception read as the rule, the purpose of
the rule put to the case instead of its letter.
`apps/bible/public/precedent-fallacy.md` is the long account; the name is its.

**Specimen:** nine callers spelled `target="_blank"`, so the change added a
`newTab` prop; the three without it lacked it by omission, and the prop encoded
an accident.

## `unrun`

**The question:** which claim rests on something nobody ran or looked at, or
looked at only for what it was meant to show?

**Put to:** "nothing calls this yet", "this fails the build on a typo", a test
whose fixtures lack the case that breaks it, a link chosen by the title of what
it links to, a visual change checked against what it set out to do rather than
against the page.

**The alternative:** the run, grep, read or `/preview` that settles it, named
concretely enough to do.

**Specimen:** artist names became generated unions to fail the build on a typo.
No function took an artist's name as a literal, so the union guarded nothing.

## `echo`

**The question:** does a fact the change edited live somewhere the diff did not
touch?

**Put to:** an edited fact, figure, name or rule: its other locale, its other
renderings, the rows beside the ones edited, the file that states the same
constraint.

**The alternative:** the other copies, found by grep and listed. The one lens a
grep answers, so a proposal under it names what the grep found, never that one
should be run.

**Specimen:** told to add two services to a tech line, the change edited one of
the line's three renderings; each read correctly alone.

## `source`

**The question:** where the change quotes, cites or draws from something, is it
the source's words and data, or the agent's own version of them?

**Put to:** quoted text, lyrics, a cited heading, a figure, a word list, a set
of examples meant to stand for something outside the agent.

**The alternative:** the source itself — its exact words, its file, the library
that holds the list.

**Specimen:** lyrics stripped of a generator's tricks came back with «вот и
новый год» "fixed" to the published poem's «там».

## `form`

**The question:** what did the change build because the format had room for it?

**Put to:** a new structure: a registry, a check, a cell per key, a copy per
consumer, a rule in a rules file, a brief that tells its reader what to do
first.

**The alternative:** the lighter design — a reference note where a registry
went, one value where a cell per key did, silence where a rule did. A prose rule
nobody asked for is `/tend-prose`'s existence lens; this one is about what the
code and the data were given.

**Specimen:** cleared to mark who sings each stanza, the change built a singer
registry and four build checks; the ask was a reference note.

## `reader`

**The question:** met cold, what does a reader take from this name or line?

**Put to:** names, flags, labels, a mechanism described in one line, prose that
cites the repo's own world to a reader standing outside it.

**The alternative:** the wording a cold reader takes the right way, or the link
that lets them check.

**Specimen:** a footer's root-page flag went `home`, then `isHomePage`; met
cold, each read as the opposite of what it meant.

## The two families

The lenses fall into two. **The frame was ours**: `precedent`, `echo`, `source`
— something in the tree or the task read as fixed. **The output was good**:
`unrun`, `form`, `reader` — well-formed, justified and efficient, each of those
properties being what made it wrong. Neither yields to "be more careful", which
is why a proposal is an alternative to pick and never an admonition.
