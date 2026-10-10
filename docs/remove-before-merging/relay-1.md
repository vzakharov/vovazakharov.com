# Relay 1 — music OG cards

## Standing constraints

None stated by the operator.

## The conversation

1. **Operator:** «сделать адекватные og для музыкальных страниц. для основной -- нарезку из последних обложек, как бы раскиданных в разных положениях и размерах по картинке (некоторые могут вылезать), с подписью "Vova's music"»
   **Agent:** routed through `/task`, decided to plan, renamed the branch, and started a plan with a per-page card for every music page.
2. **Operator (mid-turn):** «на og-шках должна быть не только картинка, но и основные метаданные»
   **Agent:** folded that in: one card per page per locale (~420), rendered at deploy like the PDFs, as JPEG. Published draft PR #134 and asked three questions (where the cards live, the ru index caption, what a page with no picture shows).
3. **Operator:** «знаешь, наверное, передумал, действительно. Давай оставим картинки песен/альбомов где есть, перерисуем только (а) для главной, где её, так я понимаю, нет; (б) для артистов (так же, но нарезка по их "альбомам"); (в) там где картинок нет -- использовать какую-то единую картинку-заглушку (создание картинок поручим потом новой таске). Текстов на картинках не надо, но надо подпись изменить: "Listen to ... on Vova's music"»
   **Agent:** rewrote the plan to that scope (collages for the index and artists, committed in the `content:og` lane; one `MUSIC_PLACEHOLDER`; an `ogTitle` field) and asked: 1) the Russian title wording, 2) the index's title, recommending `Listen to Vova's music`, 3) the placeholder until it is drawn, recommending the index collage.
4. **Operator:** «1 Слушать {name} у Вовы, и на английском давай тоже {name} by Vova / 2 ага / 3 окей / и поехали сразу»
   **Agent:** ran `/go`, flipped the plan with that go-ahead quoted, folded the answers in, then paused before step 1 at the 200k context warning (auto-relay is on for this operator) and relayed.

## Intent

Social cards for the music section that say "music" and look decent. Ruled out: per-page cards carrying metadata text (the operator first asked for them, then dropped them), and any text on the pictures. Songs and albums with a cover keep it unchanged. The drawn placeholder image is a separate later task.

## Decisions

- **Collages are committed JPEGs in `render-og.ts`'s lane**, not a deploy-time lane. At ~13 cards (index plus up to 12 artists) the weight is fine, and `vet.sh`'s `content:og --check` keeps them current. The deploy-time lane was only needed at ~420 cards.
- **JPEG, not PNG.** A spike at 2400×1260 measured 1.49 MB PNG against 0.20 MB JPEG for three covers. Chromium headless picks the format from the `--screenshot` extension (verified with `/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`).
- **One card per artist, not per locale.** It is built from releases credited in either locale (`vagabond` is GENERATED in en, Полуживые in ru).
- **Fixed hand-tuned slot table**, not a seeded random layout.
- **The title wording:** `og:title`/`twitter:title` only, via a new `ogTitle` param; `<title>` stays. en `Listen to {name} by Vova`, ru `Слушать {name} у Вовы`, index `Listen to Vova's music` / `Слушать музыку Вовы`. The ru index wording is the agent's translation of the approved en one; the operator has not seen it.
- **The placeholder** is the index collage until a drawn one exists. The plan's step 6 files an issue for drawing it.

## Errors and dead ends

- The first plan, with per-page metadata cards rendered at deploy, was superseded by message 3. Nothing was built from it.

## State

- Branch `claude/music-og-cards-lmcxs2`, pushed; draft PR https://github.com/vzakharov/vovazakharov.com/pull/134, titled `feat(vova): music index and artists unfurl as cover collages`. Its body and squash-proposal comment (id 6097919737, source `docs/remove-before-merging/squash-message.md`) are current with the plan.
- Plan: `docs/plans/music-og-cards.paused.md`. Approved, with nothing built.
- Estimate: this session 1 h senior architect, "the plan weighed three storage lanes against committed weight and the operator's changing scope; that call takes someone who knows the render pipeline". Remainder for the successor: 3.5 h middle developer, "a second card kind in an existing render lane, a constant and a metadata field; the import seam from scripts into the page slice is the one unknown", plus 1.5 h middle designer, "the collage's slot table has to compose at any prefix from two to ten covers".
- Nothing running: no CI watch, no subscription.

## Pointers

- `docs/plans/music-og-cards.paused.md`: the plan; read it first.
- `scripts/render-og.ts`, `scripts/lib/og-render.ts`, `scripts/lib/cv-card.ts`: the committed card lane and a generated-card template to model on.
- `src/pages/music/lib/{pictures,catalogue,albums,music-metadata}.ts`, `src/pages/music/ui/song-page.tsx` (`generateSongMetadata`): the pickers and metadata builders.
- `src/shared/seo/{construct-metadata,og-card}.ts`: `ogTitle` and the `.og.jpg` suffix go here.
- `.claude/rules/content.md` § "Traps worth knowing": the OG-card bullets get the collage lane.
- Predecessor transcript: https://claude.ai/code/session_01RdguyMu24bgVwpHMVR3xWH

## Next step

Resume the paused plan from its step 1 (`/go` from Step 1, `*.paused.md` case). The go-ahead is already recorded in commit 476ffe8: «1 Слушать {name} у Вовы, и на английском давай тоже {name} by Vova 2 ага 3 окей и поехали сразу». Then `/polish` and the `/pr` refresh, as `/go` runs them.

The muthur sync offer was made; do not make it again.
