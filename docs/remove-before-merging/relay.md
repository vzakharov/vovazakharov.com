# Relay summary

From https://claude.ai/code/session_01GEtdFBzj7HKyUDVuwRnrk5. The context budget
notice called the pause, and auto-relay ran it.

## 1. Standing constraints

None stated beyond the repo's own rules.

## 2. The conversation

1. **Operator** (with a screenshot of LinkedIn's "Share a document" dialog showing
   "0 pages", and two PDFs attached:
   `basilisk.cases.the-pain-direction.pdf` and
   `basilisk.cases.figure-02-molten-steel_2.pdf`):

   > по какой-то причине линкдин не хочет загружать последний кейс из басилиска (0 pages), при том что любые другие, в том числе прошлые кейсы (2й пример приложенный) загружает норм. Где-то corrupted pdf или что?

   **Agent:** Classified it as a question. The PDF is valid (xref, strict parse,
   3 pages). The only difference found was the Info `/Title` in UTF-16 (curly
   quotes). Sent an ASCII-title control copy.

2. **Operator:** «нет, тот же результат»
   **Agent:** The structure matches per object type. Started bisecting and
   sent: a raster copy, a no-links copy, and pages 1, 2 and 3 alone.

3. **Operator (mid-turn):** «будем отрезать по кусочкам пока не загрузится)»
   **Agent:** Agreed; the five variants above went out.

4. **Operator:** «НЕ загрузились nolinks и p3»
   **Agent:** Page 3 is the culprit, through its vector or text layer, not its
   links. Sent page 3 without text and page 3 without paths.

5. **Operator:** «ни та ни та не загрузились»
   **Agent:** What page 3 uniquely carries (a bold JetBrains Mono, three
   ExtGStates) is byte-identical to figure-02's, which uploads. Sent a
   control (p1 again), an empty shell, links only, and text only.

6. **Operator:** «НЕ загрузились text и urls»
   **Agent:** The common element is `paindirection.pages.dev`. It is in source
   1's text and in two link URIs (direct, and the web.archive.org link wrapping
   it), and absent from pages 1–2. Sent the links minus those two (expected to
   pass), and a bare page with only the domain in Helvetica (expected to fail).

7. **Operator:** «так и произошло» — hypothesis confirmed.
   **Agent:** Started building a one-off PDF with page 3 rasterized.

8. **Operator (mid-turn):** «не, просто собрать пдф не идёт, нужно долгосрочная таблетка, т.е. /task»
   followed by: «список известных доменов (пока только этот) которые конвертятся в растр для печати, или типа того»
   **Agent:** Routed through `/task` and chose plan-then-go. A spike showed any
   CSS `filter` makes Chromium's PDF backend paint the element as a 300 dpi
   image, with no text and no link annotation. Renamed the branch, wrote the
   plan, opened draft PR #109, flipped the plan and implemented it.

9. **Operator (mid-turn):** «как сделаешь, кинь сюда результат, чтобы я проверил, всё ли хорошо починили»
   **Agent:** Rendered `the-pain-direction.pdf` from the fixed code. Neither
   its text nor its annotations carry the domain, and it looks unchanged.
   Sent it.

10. **Operator (mid-turn, with a screenshot of the posted carousel, 3 pages):** «запостилось, замечательно»
    **Agent:** Continued the `/go` tail and ran `/dry`, which extracted
    `PRINT_RASTER_CLASS`.

11. **Operator (mid-turn):** «я так понимаю из пдфа сама ссылка не откроется (что логично), а с сайта откроется? плюс, есть ли возможность где-то делать пометки для таких ссылок типа "необходимо ввести вручную"?»
    **Agent:** Answered in chat:
    - Yes: on the site the links work, because the rule is print-only.
    - A note is possible. The recommendation is a print-only line after a
      rasterized source entry, pointing to the online version, whose URL the
      PDF footer already prints. "Type it in by hand" only works for the visible
      domain, since the archive URL never appears in print.
    - Then paused for the context budget and relayed. **The operator has not
      answered yet.**

## 3. Intent

- BAS-0006's PDF must upload to LinkedIn, done durably rather than by
  hand-editing one PDF.
- The operator explicitly ruled out a one-off rebuilt PDF ("просто собрать пдф
  не идёт").
- The shape they asked for: a list of known domains (only this one for now)
  that print converts to raster.

## 4. Decisions

- **The CSS filter beat generated images or outlined text.** The filter is a
  one-line print rule with no build step, and Skia rasterizes any filtered
  element at 300 dpi. Images would need font staging and per-mention PNGs.
- **The marker is a class, `print-raster`, not a data attribute.** It matches
  the repo's `.print-only` / `.print-hidden` idiom in `print.scss`, and one
  spelling serves JSX and hast both.
- **A source entry rasterizes whole** (`<li>`) when its url, archive or outlet
  mentions a listed domain. One citation is one unit.
- **Prose is covered too** (`rehypePrintRaster`), so a domain later cited in a
  body does not reopen the bug. The plugin runs after Shiki, which reads a code
  block's text whole.
- **The list lives in `src/shared/lib/print-raster.ts`** with no `server-only`,
  so the test runs under bare `node --test`. `shared/lib` is in
  `PRINT_SOURCES`, so editing the list reprints every PDF.

## 5. Errors and dead ends

- **The UTF-16 `/Title` hypothesis was wrong.** The ASCII-title copy still
  showed 0 pages.
- **The font and ExtGState suspects were wrong too.** They are identical to
  objects in figure-02, which uploads.
- **The proxy refused to delete the old remote ref
  `claude/inspiring-davinci-i0k9zo`** (at 116ae61, no PR). It lingers.
- `.claude/hooks` blocked a heredoc file write. Write files with `Write`.

## 6. State

- **Branch:** `claude/print-raster-domains-i0k9zo`, pushed.
- **Head before this summary:** f80c3a9.
- **PR:** https://github.com/vzakharov/vovazakharov.com/pull/109, a draft with
  a plan-time body and no squash proposal yet.
- **Plan:** `docs/plans/print-raster-domains.paused.md`. Its `## Progress`
  section lists what is done and what is left.
- Nothing is running, and there is no subscription or check-in.
- **Estimate:** this session's is 3 h middle qa + 2.5 h middle developer. The
  remainder handed on is 0.5 h middle developer: `/tend-prose`, the PR refresh,
  and the note, should the operator want it.

## 7. Pointers

- `docs/plans/print-raster-domains.paused.md` — the plan and its progress.
- `src/shared/lib/print-raster.ts` and `.test.ts` — the list, the matcher and
  the splitter.
- `src/shared/content/plugins/rehype-print-raster.ts`, with its registration in
  `src/shared/content/render.ts`.
- `src/entities/document/ui/source-list.tsx` — the source entry marking.
- `src/app/styles/print.scss` — the `.print-raster` rule.
- `.claude/rules/content.md` § "Traps" — the "0 pages" bullet.
- To re-render and check:
  - `pnpm content:pdf:basilisk`
  - then `pdftotext apps/basilisk/public/cases/the-pain-direction.pdf - | grep -c pages.dev`
- Transcript: https://claude.ai/code/session_01GEtdFBzj7HKyUDVuwRnrk5

## 8. Next step

**Wait for the operator's answer** to their last question (§ 2, message 11),
quoted:

> есть ли возможность где-то делать пометки для таких ссылок типа "необходимо ввести вручную"?

- **If they want the note:** build it as continued work, a print-only line after
  a rasterized source entry. Re-render BAS-0006 and send them the PDF.
- **Either way, then:** resume the paused plan with `/go`, from Step 1. It still
  needs `/tend-prose` (full run), the `*.completed.md` flip, and `/pr` refresh
  with the squash proposal.
