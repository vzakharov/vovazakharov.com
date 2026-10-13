# Relay 7: Latin-first spelling — the switch moves to the locale chip

## 1. Standing constraints

Same as relays 1–6: none beyond the repo's own rules. Mithqal's behaviour comes from a flag, «а не "в mithqal вот так"».

## 2. The conversation

This session started from `/relay take`, finished `/go` (head script as a plain `<script>` child 23b3988, `/dry` 8cfbb72, `/tend-prose` 699b6e8, PR body refreshed), and parked at its last keepalive wake (`relay-6.md`). Then Vova came back:

> я тут. много классно, но что-то не нравится
>
> 1- не нравится пунктирное подчёркивание под названиями. Названия всегда видны, и это постоянный шум на экране
> 2- не нравится что переключиться можно только на странице песни -- на всех остальных страницах (артисты, альбомы) этой механики нет
> 3- сама механика тоже смущают. В первую очередь -- типы, которые вылазят непонятно когда и как (я понимаю, что у нас есть internal logic, но вот как "юзера со стороны", если бы я был таким, она меня смущает)
>
> давай побрейнстормим какие ещё варианты есть для механики переключения?

Reply: the three complaints share one cause, the switch living in the title. Five options: a corner toggle by the theme moon, a toggle in the music header, hover-only reveal, both spellings always, plus a browser-language default. Recommended corner + default. Asked whether «типы» meant tips and where to show it.

> 1 - да
> 2 - можешь предначертать как это может выглядеть, пока не очень понимаю

Reply: mockups on the built export (CDP injection): corner pill, a twin of EN | RU beside it, a toggle under the heading. Recommended the twin.

> [screenshot of the corner pill on a phone] так, красивенько, но в этом варианте куда девается переключатель языка?

Reply: measured: the mock pill sat exactly over EN | RU and hid it, a mockup bug and the corner variant's real problem on a phone.

> а что если попробовать прямо в кнопки EN / RU встроить, типа
>
> [ EN / *Abc* ] которая переходит в [ EN / Абв ] при нажатии и обратно
>
> при этом она должна так выглядеть только если на странице действительно есть русский (а на старницах где например нужен арабский или греческий соответственно по-другому)

Reply: mockups of exactly that (`docs/remove-before-merging/switch-mockups/`): fits one line on a phone, and the active chip is inert today, so it gains a job. Two questions: label shows current or target; which sample on a mixed page.

> 1 текущее, будем считать что это по сути чекбокс а не кнопка
> 2 "которой больше" ок, а кто, кстати, считать будет, как сказал бы товарищ Сталин?

Reply: the build counts: the server page tallies the letters of its names/lyrics that need Latin, by script, and bakes the sample into HTML. Listed the four decisions and proposed a relay on «давай».

> только уточнить, мы НЕ должны будем для каждой _песни_ писать "вот здесь нужна латиница", это именно на языках/скриптах основывается?
>
> если да, то давай

Reply: confirmed: decided by script and locale alone, no per-song flag. Wrote the follow-up into the plan and relayed.

## 3. Intent

The original intent (`relay-1.md` § 3) holds; what changes is the control. Vova wants no visual noise on titles, the switch on every music page, and a mechanism a stranger understands without tips. Ruled out: the dotted title switch and its popover tips; a corner pill (collides with EN | RU on a phone); a toggle under the heading (noise).

## 4. Decisions

All in the plan's § "Follow-up: the switch rides on the locale chip". The key terms: **the chip** is the active `LocaleChips` entry (`pages/music/ui/locale-chips.tsx`); **the sample** is `Abc` / `Абв` / `أبج` / `Αβγ`, the page's dominant needs-Latin script counted at build time; the label shows the **current** spelling, a checkbox not a button.

## 5. Errors and dead ends

- The corner-pill mockup overlapped EN | RU; Vova caught it from the phone screenshot.
- `tmp/preview/mock.mjs` (gitignored, gone with this container) served `apps/vova/out` with a tiny Node static server and injected DOM over CDP; the next session can rewrite it from `/preview`'s § "Driving the page" if it wants a before/after.

## 6. State

- **Branch:** `claude/latin-first-transliteration-ymni59`, pushed; head be5148e before this summary's commit.
- **Draft PR:** #148, base `main`, MERGEABLE/CLEAN at last check. Its body describes the title switch and will need `/pr`'s refresh after the follow-up.
- **Plan:** `docs/plans/latin-first-transliteration.paused.md`, with the follow-up section and 7 steps.
- **Nothing is running**; the keepalive is stopped.
- **Estimate:** this session, 1 h senior developer + 0.5 h middle QA + 1.5 h senior designer. Remainder handed on: about 3 h senior developer (the chip toggle, the build-time count, the browser-language default in the pre-paint script, removals) + 0.5 h middle QA (both locales, both modes, phone width).
- **Still unanswered** from Vova, low priority: the two `/dry` calls in `relay-6.md` § 8 (extract `spellCatalogueName` — recommended yes; a `useSpelledText` hook — recommended no).

## 7. Pointers

- `docs/plans/latin-first-transliteration.paused.md` § "Follow-up" — the work.
- `docs/remove-before-merging/switch-mockups/4-inline-*.png` — what Vova approved.
- `src/pages/music/ui/locale-chips.tsx`, `src/shared/ui` `ChipNav`, `src/pages/music/ui/script-switch.tsx` (to delete), `src/shared/lib/script-preference.ts` + `use-script-preference.ts`, `src/shared/music-catalogue/spelling.ts`.
- Transcripts: this session https://claude.ai/code/session_01831ynLgir5kRLAnKuU7W5M; earlier ones in `relay-5.md` § 7 and back.

## 8. Next step

go
