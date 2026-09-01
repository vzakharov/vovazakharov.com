# Issue #10: feat: deliver the playgram case study onto the website

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/issues/10
- **Author:** @vzakharov
- **Created:** 2026-09-01T09:06:16Z
- **Updated:** 2026-09-01T09:06:16Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

e0ccd2b delivered the case study as an in-repo md; now we have to actually have it available via the website.

The zero-approximation question we need to answer is: how do we deliver content at all? Do we just take the md and re-narrate it as a react component? Or do we have something that "takes" the md and parses it dynamically on the client?

This is a "load-bearing" concern, as it will serve as the basis for all further content to be delivered via the website (hence cold-loaded bundle size could also become an issue).

Ideally we also want to have the original mds downloadable too (store in `public/`?)

All in all, I want both a durable and elegant solution for content delivery on a static website, and the specific playgram case study delivered.

Riding along, a new section in the CV including the Playgram experience.

---
