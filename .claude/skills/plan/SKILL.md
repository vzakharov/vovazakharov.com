---
name: plan
description: Research this repo and write an implementation plan to docs/plans/ that a cold session can execute without further context. Use when the user asks to plan a change, scope work, or produce a plan file before implementing. Do NOT use to make the change itself — that is /implement.
---

# /plan

Produce a plan file. **Write no application code.** The output is one markdown file under
`docs/plans/`, written so that a session with no memory of this conversation can implement
it correctly.

Adapted from the `/plan` skill in `Playgramai/playgramapp`. See
`docs/plans/playgram-case-study.md` §7 — this version has not yet been reconciled against
that original, and the repo-specific rules below replace that repo's test-suite gates.

## Procedure

1. **Read before writing.** Read the actual files the change touches — never infer contents
   from filenames. For UI work that means the component, its translation keys, and the
   layout/route that renders it.
2. **Resolve the blocking decisions with the user** before writing the plan, not inside it.
   A plan containing "decide whether to X" has deferred the hard part. Use `AskUserQuestion`
   for choices that change the work; make routine calls yourself and say so.
3. **Write the plan** to `docs/plans/<slug>.md`.
4. **Do not implement.** Hand off. If the user wants it built now, they invoke `/implement`.

## What the plan must contain

- **Context** — what and why, in a few sentences. Enough that a cold reader understands the
  goal without asking.
- **Locked decisions** — a table of choices already made, marked not-to-re-litigate. This is
  what stops the implementing session from redesigning the work.
- **Files and symbols, with line references** — `path/to/file.tsx:120-135`, plus the exact
  translation keys, component props, or config fields involved. Vague plans get
  re-researched from scratch, wasting the planning entirely.
- **Constraints** the implementer cannot discover cheaply (see the repo rules below).
- **Verification** — the literal commands to run, plus a checklist of things to confirm by
  eye that no command covers.
- **Out of scope** — explicitly, including the tempting adjacent work.

Prefer prose and tables over deep nesting. Do not pad with restated context; every section
should change what the implementer does.

## Repo-specific constraints to carry into any plan

These are properties of this codebase that are expensive to rediscover:

- **This repo is public** (`vzakharov/vovazakharov.com`, deployed to GitHub Pages), so
  committing publishes. Working notes and internal docs are fine to commit — not rendering a
  page for something is the normal way to keep it out of the way. What is _not_ fine is
  credentials, third-party confidential material, or personal data about other people; flag
  those in the plan as needing a read-through before they land.
- **Static export.** `next.config.ts` sets `output: 'export'`. No server-side data fetching,
  no runtime env reads, no dynamic route params without `generateStaticParams`.
- **i18n key parity.** `messages/en.json` and `messages/ru.json` are rendered by the same
  components, so a key present in one and missing in the other is a build break, not a
  cosmetic gap. Array lengths must match too. Only `/cv` is localized; `app/HomePage.tsx`
  is English-only, so new standalone pages can reasonably be English-only as well.
- **Theme parity.** Three theme states (light / dark / system). Never define a colour only
  inside `.dark` or only outside it — `app/globals.css` defines the token pair, and new
  work must read correctly in both.
- **Print view.** `/cv` exists to be printed to PDF. Any interactive or navigational element
  added to it needs `print:hidden` or a print-appropriate fallback, or it becomes dead text
  in the PDF.
- **Design language.** Black and white only, Merriweather serif body, JetBrains Mono for
  metadata, bordered `Card` components with no fills or shadows, opacity as the only
  de-emphasis. Reuse `components/Card.tsx`; don't introduce a second visual system.
- **Dependencies.** Adding to `package.json` is a decision worth flagging explicitly in the
  plan, not a detail. This site carries five runtime dependencies on purpose.

## Metadata

New pages get metadata from `constructMetadata()` in `lib/metadata.ts` — pass `title`,
`description`, `path`, and `ogType`. Do not hand-roll a `Metadata` object; the helper wires
up OpenGraph and Twitter cards consistently.
