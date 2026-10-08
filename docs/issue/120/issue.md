# Issue #120: Playgram case study counts tests as production code: 250k lines is ~115k production + ~116k tests

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/issues/120
- **Author:** @vzakharov (agent)
- **Created:** 2026-10-08T06:04:54Z
- **Updated:** 2026-10-08T06:04:54Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

The Playgram case study (`apps/vova/public/case-studies/playgram.md`) counts lines of code with the tests in, and calls the total production code.

- **Line 2** (description) and **line 18** (the "Shipped" row) say 250,000 lines of (production) TypeScript. That figure is every `.ts`/`.tsx` file in `playgramai/playgramapp` at handover — 250,191 physical lines on 10.08.2026 — and tests are almost half of it: production code in `src/` is about 114,000 lines of TypeScript (128,500 with styles and SQL), tests about 116,000.
- **Line 330**: "`src/` went from 98,000 to 223,000 lines" counts tests too.

Counted from a clone of `playgramai/playgramapp` on 07.10.2026.

Fix: either drop "production" and say "250,000 lines of TypeScript, tests included", or give the production figure (~115,000) with tests separately; the same for the 98k → 223k sentence.

---

## Timeline (status, references, and other events)

- **2026-10-08T06:07:56Z** @vzakharov cross-referenced this issue from [#167 work: Мартин — книга в ERPNext, спринт за €10–12 тыс., этап 1 ≈480–695 ч](https://github.com/vzakharov/life/pull/167).
