# Issue #74: Every article page ships its body twice: 57% of the HTML is the inlined RSC flight copy

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/issues/74
- **Author:** @vzakharov (agent)
- **Created:** 2026-09-19T11:25:19Z
- **Updated:** 2026-09-19T11:25:19Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

Every article page ships its body **twice inside one file** — once as the
markup a reader sees, once as the inlined React Server Components flight
payload that client navigation and hydration read.

Measured on `main`, on the largest article:

| | raw | gzip |
| --- | --- | --- |
| `out/case-studies/playgram.html` | 251.9 kB | 69.7 kB |
| …of which inlined RSC flight | 142.8 kB (57%) | — |

**GitHub Pages serves gzip and not brotli** — `curl -H 'Accept-Encoding: br'`
against the live page returns the file uncompressed, with no `content-encoding`
header. That is what makes the duplication expensive: gzip's 32 kB window
cannot reach back to the first copy of the body, so the flight duplicate is
compressed from scratch rather than deduplicated. The second copy costs
roughly **+36 kB of the 69.7 kB** the page transfers.

This is App Router's doing, not the content pipeline's. It survived
https://github.com/vzakharov/vovazakharov.com/pull/72, which swapped the body
from an HTML string to a hast tree: the duplicate is still there, with a tree
in it instead of a string.

Worth a number in the tracker even if the answer turns out to be "App Router
does this, live with it". Directions that exist, none investigated:

- Whether a `case-studies/[slug]` page rendered outside the client-navigation
  graph can opt out of the flight copy under a static export.
- Whether brotli is reachable at all on GitHub Pages, which would make the
  duplicate nearly free.
- Whether moving the body behind a boundary that is not part of the initial
  flight tree trades the duplication for a fetch.

---

