# Surface the case study, and end the learning-app assignment

Two changes to `/[locale]/cv`, independent of each other:

1. The **Playgram case study** sits sixth of eight sections, below the whole
   experience list — the strongest artifact on the page is the one a reader is
   least likely to reach. Lift it to directly above Experience, and cross-link
   it from the Playgram experience card so it is also findable in context.
2. The **English-for-kids** entry reads `October 2025 – Present`; the assignment
   ended in February 2026.

## Revision: the section is cut, not moved

Operator, after seeing the moved section rendered: "I don't think we need the
case study card at all — a 'Read the case study' link under the relevant
experience is just right for a CV (but make it right under the experience
heading, not under the body)."

So the CV drops the Case studies section outright and keeps only the cross-link
from § 2, moved from the card's trailer to directly under the entry's period.
That supersedes § 1 (nothing is reordered, since nothing is left to reorder) and
relocates § 3 (paper still gets the address, now inline after the link label
rather than under a section that no longer exists). § 2 and § 4 stand.

The section's own copy — `caseStudies.title` and the Playgram entry's `title`
and `description` — has no remaining call site and leaves both catalogs with it.
The Russian description carried a caveat the link label now carries instead:
the article is English-only.

## Current shape

`src/pages/cv/ui/cv-page.tsx` renders eight `CvSection`s in source order:
header, Profile, What I offer, Experience, **Case studies**, Tech stack,
Education, Contact. Every string comes from `cv.*` in
`src/shared/i18n/messages/{en,ru}.json`; `Record<Locale, Messages>` in
`load-messages.ts` types `ru` against `en`, so `pnpm typecheck` fails on a key
added to one catalog and not the other.

The case-study URL is not known to the component: `app/[locale]/cv/page.tsx`
resolves it from the build-time content registry (`documentRoute('case-studies',
FEATURED_CASE_STUDY)`) and passes it as `CvPageProps.caseStudyHref`, because
`@/shared/content` is `server-only` and `CvPage` is `'use client'`.

## 1. Move the case-study section above Experience

Reorder `cv-page.tsx` so the sections read: header, Profile, What I offer,
**Case studies**, Experience, Tech stack, Education, Contact. The pitch keeps
the lead, and the case study lands adjacent to the entry it documents. The JSX
block moves verbatim — no markup change, no new component.

The copy has one positional reference that the move breaks.
`cv.caseStudies.playgram.description` currently opens "the long-form write-up of
**the rebuild above**", and the rebuild now sits below. Reword both catalogs to
name the subject instead of its position, so the sentence survives this move and
any future one:

| Locale | From                                            | To                                                 |
| ------ | ----------------------------------------------- | -------------------------------------------------- |
| `en`   | `…the long-form write-up of the rebuild above:` | `…the long-form write-up of the Playgram rebuild:` |
| `ru`   | `…подробный разбор переезда, описанного выше:`  | `…подробный разбор переезда Playgram:`             |

Section heading stays `Case studies` / `Разборы проектов` — the collection is
built to grow, and one entry under a plural heading reads as a selection rather
than as the whole of it.

## 2. Link the case study from the Playgram experience card

`ExperienceCard` already renders optional trailers off catalog shape (`'tech' in
entry`, `'demo' in entry`). The case-study link cannot follow that pattern for
the reason `EXPERIENCE_KEYS` gives for living in code: which entry the case
study belongs to is a presentation decision, and a catalog-shaped signal lets
`en` and `ru` disagree about it. So:

- Export `CASE_STUDY_EXPERIENCE_KEY = 'playgram'` from `experience-card.tsx`,
  beside `EXPERIENCE_KEYS`.
- `ExperienceCard` takes an optional `caseStudyHref`, and renders the link only
  when it is given.
- `CvPage` passes its own `caseStudyHref` down for that one key:

  ```tsx
  <ExperienceCard
    key={entryKey}
    {...{ entryKey }}
    caseStudyHref={
      entryKey === CASE_STUDY_EXPERIENCE_KEY ? caseStudyHref : undefined
    }
  />
  ```

The link renders last in the card, after the `tech` line, as an
`InternalLink` at `size="sm"` — the same treatment the featured section gives
it — reusing the existing `cv.caseStudies.playgram.link` label ("Read the case
study" / "Читать разбор") rather than adding a message key that would say the
same thing twice per catalog.

It carries `print-hidden`: on paper the featured section carries the full URL
(§3), so a second link with no URL behind it would spend a line saying nothing.

`ExperienceCard`'s trailing-gap bookkeeping generalises from "is there a note"
to "is there anything after the tech line": the `hasNote` flag that today
decides both `CvBullets`' `last` and the tech line's `tightHeading` becomes a
`hasTrailer = hasNote || hasCaseStudyLink`. `randddb` is the only entry with a
`demo` and it has no case study, so no entry needs spacing between the two
trailers.

## 3. Print the case-study URL, on paper only

A printed CV that says "Read the case study" and nothing else is a dead end,
and the point of §1 is that this is the artifact worth reaching. On screen the
link is already clickable, so a spelled-out URL there is noise. Add a line under
the section's link carrying the URL as text, marked `print-only` — the global
class in `src/app/styles/print.scss` is `display: none` outright and
`display: block` inside `@media print`, which is exactly "on paper, not on
screen". The CV's own print footer already rides it.

```
vovazakharov.com/case-studies/playgram-bubble-to-nextjs-part-1
```

Composed as `{t('website')}{caseStudyHref}` — the host string already exists
in both catalogs as `cv.footer.website`, and the print footer already spells its
protocol at the call site (`href={`https://${t('footer.website')}`}`), so this
adds no third copy of the host. Move that key from `cv.footer.website` to
`cv.website` in both catalogs and update the footer's reference: with two
consumers it is no longer the footer's string.

Styled with the existing `small` + `dim60` classes, which `cv.module.scss`
already flattens to full opacity in print.

## 4. End the English-for-kids period

`cv.experience.englishForKids.period` in both catalogs:

| Locale | From                             | To                             |
| ------ | -------------------------------- | ------------------------------ |
| `en`   | `October 2025 – Present`         | `October 2025 – February 2026` |
| `ru`   | `Октябрь 2025 – Настоящее время` | `Октябрь 2025 – Февраль 2026`  |

No reordering follows: `EXPERIENCE_KEYS` lists it after `playgram` (March –
August 2026) and before `orcool` (June – August 2025), which is still reverse
chronological. `independent` keeps its `2020 – Present` — that one is ongoing.

## Files touched

| File                                  | Change                                                                      |
| ------------------------------------- | --------------------------------------------------------------------------- |
| `src/pages/cv/ui/cv-page.tsx`         | section order; pass `caseStudyHref` per entry; print URL line               |
| `src/pages/cv/ui/experience-card.tsx` | `CASE_STUDY_EXPERIENCE_KEY`, optional `caseStudyHref` prop, trailer spacing |
| `src/shared/i18n/messages/en.json`    | case-study description, `cv.website` move, `englishForKids.period`          |
| `src/shared/i18n/messages/ru.json`    | same four edits                                                             |

No new files, no dependency changes, no route or metadata changes.

## DRY notes

- **The link label is reused, not duplicated.** The experience-card link renders
  `cv.caseStudies.playgram.link`, the same string the featured section uses.
  A second key (`experience.playgram.caseStudyLink`) would mean two strings per
  catalog that must say the same thing, and four places to keep in step.
- **The host string gets one home.** `cv.footer.website` becomes `cv.website`
  because §3 gives it a second consumer; the print URL composes from it rather
  than from `SITE_CONFIG.url`, which would be a second spelling of the same host
  reachable from the same component. `getAbsoluteUrl` is deliberately not used:
  it yields the protocol-prefixed form, and what prints is the bare host, so
  using it would mean stripping back what it just added.
- **Which entry owns the case study is stated once**, as
  `CASE_STUDY_EXPERIENCE_KEY` in `experience-card.tsx` — beside `EXPERIENCE_KEYS`,
  which is there for the same reason (a presentation decision the catalogs must
  not be able to disagree about). The route file's `FEATURED_CASE_STUDY` stays
  the single source of the _slug_; the two answer different questions.
- **No shared abstraction is extracted for the two case-study links.** They
  differ in placement, size context, and print behaviour, and share only an
  `InternalLink` with a label — a `CaseStudyLink` component wrapping that would
  be one indirection over two call sites with no logic in common, and would have
  to take the print behaviour as a prop, i.e. carry the difference it was meant
  to hide.
- **`ExperienceCard`'s trailer flags are generalised in place, not multiplied.**
  `hasNote` already served two decisions (`CvBullets last`, tech-line
  `tightHeading`); adding a third trailer renames it to what it always meant
  rather than adding a parallel flag that both decisions would have to consult.

## Verification

`pnpm build` covers the type-level half — a catalog key moved in `en` and not in
`ru` fails `Record<Locale, Messages>`. The rest is visual and needs `/preview`:

- `/en/cv` and `/ru/cv` — Case studies sits between "What I offer" and
  Experience; the description no longer says "above" / "выше"; no URL is
  spelled out on screen.
- The Playgram experience card ends with the case-study link, and it resolves to
  `/case-studies/playgram-bubble-to-nextjs-part-1`.
- Print preview (both locales) — the featured section shows the bare URL, the
  experience card's link is absent, and no card's trailing spacing collapsed.
- The English-for-kids card reads `February 2026`, and the experience order is
  unchanged.

## Decisions

The three placement/scope forks are resolved and written above as the single
approach. Ruled out: seating the section under Profile or under the header
(above Profile) — the first two sections earn their lead, and the case study
gains from sitting next to the entry it documents; leaving the printed URL out
or showing it on screen too — the link is already clickable on screen, and
paper needs the address; and surfacing the case study in only one of the two
places — the section catches a scanner, the card catches someone already
reading about the rebuild.
