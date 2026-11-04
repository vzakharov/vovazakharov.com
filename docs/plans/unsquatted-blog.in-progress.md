# A blog on unsquatted.com, run by the Unnamed

unsquatted.com gets a blog: holiday posts, half explainer and half joke, each
built around domain names for its occasion, with **widgets** in the post that
check those names live. The site gets a resident persona, **the Unnamed**, who
writes the posts and his reflections on them, as the Clerk does on basilisk.fyi
and Майя on mayawonders.com.

Four posts, one PR, written one after another:

- **11.11 — Singles’ Day.** The one that sets the tone, look and widgets.
- **19.11 — International Men’s Day.** Fills the gap between 11.11 and the end
  of the month. The jokes land on the names and the Unnamed, never on anyone the
  day is for or against. (19.11 is also World Toilet Day, which he may not be
  able to resist.)
- **27.11 — Black Friday.**
- **30.11 — Cyber Monday.**

**The PR merges by 10.11**, so that the first post is live before its day.
Merging is deploying, so every post is in the tree by then, and each one is
**embargoed until its own date**: a build leaves out any document dated after
the day it runs, and a daily scheduled deploy of unsquatted publishes each post
on its day (§ "Release by date").

**Shape: an elephant, two bites.** Bite 1 builds everything the first post needs
and the post itself, then pauses for the operator to tune its tone and look on
preview. Bite 2 writes the other three posts, which only make sense once that
tuning is done. Pizza doesn't fit: no slice is worth landing without the post
that is the reason for it.

## Mockups

Static markup laid into the live dev page, so the faces, tokens and both themes
are the site's own (`mockups/pages.cjs`, `mockups/shoot.cjs`). The names and
verdicts in them are placeholders, and so is the text; nothing was checked.

**A post**, with both widgets: a curated list (`domains`) and one word across
zones (`name`). On a wide screen a widget is narrower than the text column
(about 580px against 720) and centred in it, so it reads as a block set into the
text rather than as a second column:

![post, light](../remove-before-merging/unsquatted-blog-oabq4m/mockups/post-light.png)

![post, dark](../remove-before-merging/unsquatted-blog-oabq4m/mockups/post-dark.png)

**On a phone**, the price drops under the verdict, as it does in the catalogue's
rows:

![post, phone](../remove-before-merging/unsquatted-blog-oabq4m/mockups/post-phone-light.png)

**The index**, each post stamped with its occasion's date:

![index, light](../remove-before-merging/unsquatted-blog-oabq4m/mockups/index-light.png)

![index, dark](../remove-before-merging/unsquatted-blog-oabq4m/mockups/index-dark.png)

**A catalogue name picked for a post** carries the occasion's date stamp before
the name, the same stamp as on the index, linking to the post (second row):

![catalogue link](../remove-before-merging/unsquatted-blog-oabq4m/mockups/variant-d-light.png)

Three other ways were considered and dropped: the category as the link, a line
under the blurb, and a book icon beside the heart. The stamp is the one that
ties a catalogue name visually to the blog.

## Rest of the elephant

**Bite 2 — the other three posts.** International Men’s Day, Black Friday and
Cyber Monday, each with its names run through the naming runbook into the
catalogue, its widgets, its card and the Unnamed's reflection, written to the
tone bite 1 settled. Each post's `date` is a day or two before its occasion, so
the embargo releases it while the occasion is still ahead. Then `/finalize`, and
a merge by 10.11.

## Eaten so far

Nothing is built yet. The plan was approved and claimed, then released before
any source edit, because the planning session's context could not hold bite 1.

## Rest of the bite

### 1. unsquatted becomes a blog

- **`src/masd.json`**: `unsquatted: ["blog"]`. blog extends shell, so nothing
  unsquatted inherits today is lost.
- **A collection `unsquatted-blog`** in `collections.ts`: base `blog`, site
  `unsquatted`, `localized: false` (English, as the whole site is),
  `printable: false`, `homeIndexed: false`, `feed: true`, `bylined: true`,
  `generatedCards: true`. Posts at `sites/unsquatted/public/blog/<slug>.md`.
- **Routers** in `sites/unsquatted/app/`: `blog/page.tsx` (the index),
  `blog/[...slug]/page.tsx` (a post), the feed route, as lsa's and bible's
  routers do; `layout.tsx` takes blog's root metadata, which advertises the
  feed. The sitemap goes through blog's `sitemap()`.
- **The index's copy is the Unnamed's**: the title "The Unnamed of Unsquatted"
  with ", on unsquatted (and some squatted) names" under it as a subtitle that
  carries on the same sentence, then an intro line in his voice, then cards
  stamped with the occasion's date (index mockup). Wherever the title travels as
  one string (`<title>`, the feed, the card), it is the whole sentence.
- **The home page sends the dice-roller to the blog**: after the third roll in a
  visit, a line appears under the checker's field: "Tired of dicing?
  [Read some](/blog)". The count belongs to the page view and isn't stored, so
  every visit starts at zero.
- **An occasion in frontmatter**: `occasion: { name, date }`, in a schema that
  unsquatted owns, as basilisk owns the case frontmatter. The index's date stamp
  and the post's eyebrow (`11.11 · Singles’ Day`) both read from it.
- **Post cards** are drawn by the template that draws the site card: the post's
  word in the field, its first `domains` list in the rows.

### 2. Widgets

**A widget is a markdown directive the content pipeline compiles into a
placeholder, which a component that the collection's owner supplies renders
instead.** blog knows widgets in general; unsquatted knows which ones exist.

- **The seam.** A `Collection` handle (the object `articleRoute` already takes,
  which carries an owner's schema) gains `widgets`: a map from a directive name
  to its attribute schema and its component. `remarkContentDirectives` converts
  a known widget directive into an element carrying its parsed attributes, and
  still throws on any name neither it nor the collection knows. A widget whose
  attributes fail their schema throws with the file's name, as an unknown
  directive does. `ProseContent` merges the collection's components into
  `CONTENT_COMPONENTS`. blog never names unsquatted.
- **`:::domains{label="…"}`, a list of domains in its body**: a curated list in
  the share card's rows. Each row has a heart (the same shortlist the home page
  keeps), the domain, a live verdict and its price. Each domain links to the
  checker on the home page with that domain (`/#<domain>`), and the foot links
  to the checker ("Check your own in the full checker →"). The checker's full
  interface is where a visitor goes to do more.
- **`::name{word=…}`**: one word across the checker's zones, under a field
  holding the word, exactly as the share card draws it. Its foot links to
  `/#<word>`.
- **Both carry the share menu**: copy a link to the widget's anchor in the post,
  or copy it as an image, drawn by `shareCard`.
- **Names are in the HTML, verdicts are live.** The page renders the domains at
  build time, so a crawler or a reader with no JavaScript sees them along with
  the links. The browser looks each one up on every visit, as the catalogue's
  rows do, so a name grabbed after the post went up says "taken" rather than
  sending a visitor to a registrar to find out.
- **Every domain a `domains` widget lists is a catalogue pick with
  `post: <slug>`**, and every pick with a `post` is listed in that post. The
  build checks both ways, so a post and the catalogue can't disagree about which
  names it picked. A `name` widget is free to show taken names (that's half the
  joke) and is not checked against the catalogue.

### 3. The catalogue links its picks to their post

`picks.yaml` gains an optional `post`, which must name a post that exists. A
pick with one shows the post's occasion date as a stamp before the name, linking
to the post and titled with the occasion's name. Picks keep their usual `form`,
`uses` and `score`; the runbook's gates hold for them as for any other pick.

### 4. The Unnamed

- **His home is `personas/unnamed/`**, with `unnamed.md` as his rule file, in
  Russian like Майя's: who he is (he runs unsquatted.com, and it's his to change
  except for the plumbing, which is the line `site-config.ts` already draws for
  Майя's site), how he sounds (slightly mischievous, slightly sarcastic,
  self-aware; the site's current copy is his starting point: the asterisk on
  "grabbed", "seriously?", "for the lulz", "okay, maybe not these ones"), and
  the list of what he has learned about himself, which grows with his
  reflections. `/persona unnamed` finds him with no other edit.
- **`.claude/rules/unnamed.md`**, scoped to his home and his posts, as `maya.md`
  is to hers.
- **The posts are his, bylined "by the Unnamed"**, the link going to the blog
  index, whose intro is him introducing himself. `AUTHOR_IDS` gains `unnamed`.
- **His reflection on each post** sits beside it as
  `<slug>.unnamed.reflections.md`, per `persona-reflections.md`, written by a
  subagent briefed to him (`reflections.md`).
- **The site copy he inherits is not rewritten here.** It is already in his
  voice; it is his to change from now on, not this PR's.

### 5. The first post: 11.11, Singles’ Day

- **Facts, checked before writing**: Nanjing University students in the 1990s,
  11.11 as four bare sticks (光棍, _guanggun_, "bachelor"), Alibaba's first sale
  in 2009, the scale it reached, why it stopped publishing the figure, and the
  numerology that makes 1111 worth money. Sources go in the reply that presents
  the draft. (The site lists no sources under a post.)
- **Names**: a naming run per the runbook over the post's angles (a name for
  one, the single word, the 1111 numerics, the sale itself), into the catalogue
  with `post:`. Two or three `domains` lists, one or two `name` widgets for the
  single words that were all gone by 1994.
- **Remembrance Day and Veterans Day fall on the same date.** The post doesn't
  touch them, and no name plays on them.
- **On preview** (`/preview live unsquatted`) for the operator to tune its tone
  and look. That is this bite's end.

### 6. Release by date

- **A document dated after the build day is not built**: no page, no index card,
  no sitemap or feed entry. The rule is blog-wide, so it lives in one place, the
  document reader. On every other site it means only that a future-dated post
  appears at the next deploy after its date. The raw `.md` sits in `public/`
  regardless, as the repo is public anyway, so the embargo keeps a post off the
  site's surfaces, not out of reach.
- **`deploy.yml` gains a daily `schedule`** that builds and publishes unsquatted
  alone, at an off-peak minute. It also gives `shownUntil` in `picks.yaml` the
  daily resolution its name promises, where today a taken name leaves the list
  only at the next merge.

### Tests

The pure parts go in the suite:

- the embargo predicate;
- widget attribute parsing and the unknown-widget throw;
- the two-way check between posts and the catalogue;
- the `post` field's validation;
- the occasion stamp's formatting.

Everything else gets checked on the page itself, through `pnpm build` and
`/preview`.

## DRY notes

- **Reused whole:**
  - from blog: `articleRoute`, `collectionIndexRoute`, the feed and sitemap
    factories, `ProseContent` and the article chrome;
  - from unsquatted: `shareCard`, the verdict lookups, `useLikes`, `priceParts`,
    `registerUrl`, and the site card's template for the post cards.
- **Moved down rather than copied:** the widgets need the home page's verdict,
  verdict label, likes and price slices, which sit in `pages/home` today and
  can't be reached from a blog page. They move to the lowest layer both pages
  inherit: the domain's lookup and verdict label become an entity, likes become
  a feature, and the widgets themselves sit in `widgets/` (in FSD's own sense,
  since they combine both). `check:masd` decides the exact cuts.
- **One row, three users:** the checker's `ZoneRow` (in `name-checker.tsx`) is
  what both widgets draw, so it moves out with them, and the checker keeps using
  it from there.
- **Not shared:** the catalogue's `PickRow` keeps its own layout (category,
  blurb, register column) and isn't folded into the widget row. The two show
  different things about a name, and one component with a mode switch would be
  two components under one name.
- **The widget seam is new**, with no existing mechanism to extend:
  `CONTENT_COMPONENTS` maps HTML tags, and a site-specific component behind a
  tag would put unsquatted's names into blog. The seam reuses that map and adds
  only the collection's entries to it.
