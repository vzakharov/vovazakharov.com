# Relay 5 — fixed radio for /music

`relay-1.md` holds the design conversation, `relay-2.md` the station/reducer/element hook, `relay-3.md` the cover mockups, catalogue words and the bar's switch, `relay-4.md` the excerpt. This summary covers only the session that picked up relay 4; it built the launch buttons, the route and the radio page, then auto-relayed at the context-budget warning (the baseline context is heavy).

## 1. Standing constraints

Carried, still in force:

- «главная фишка тут, если из описания это было непонятно -- никакого сервера -- синхронность поддерживается исключительно детерминистическим (но высокоэнтропичным) вычислением» — no server, no clock fetch from any host.
- Song ratings / weighted shuffle: «(не в этом пиаре)».

## 2. The conversation

1. **Operator**: `/relay take claude/music-radio-ttn1gg` (no other message this session).
   - **Agent**: attached, set the inherited estimate, resumed the plan, built § "Changes" 5, 6's parse and 7, paused and relayed at the budget warning.

## 3. Intent

Unchanged from relays 1–4: a fixed radio with its own page (cover variant 1, “from _album_”, linked names, an outlined set, the cycle's length in the [i] note).

## 4. Decisions (this session)

- **Radio launcher** = `tuneIn()` then `router.push(radioRoute)` (context's `radioRoute`, the page's locale). `default` variant beside the primary Shuffle all, in one `launch-buttons.tsx`.
- **Needle**: `Needle` freezes its start offset in `useState` at mount and is remounted by the dial's key `${cycle}/${cursor}`; animation is `forwards`, not infinite. CSS vars go through Mantine `Box`'s `style` (a plain `div`'s `CSSProperties` rejects `--*`).
- **Clock**: `useClock` ticks on each whole second (slot bounds are whole seconds), undefined until mount; the now-playing and dial areas have `min-height` so nothing jumps.
- **Landing attempt**: `useEffectEvent` + mount effect, only when `current === undefined`.
- **[i] note**: `NotedSpan` with an `Info` icon carrying `aria-label` (lint forbids `role="img"`); the pitch is a `div`, as the popover is a `div` and cannot sit in a `p`.
- **Story fade**: `Excerpt` reuses `read-more.module.scss`'s `.clamped` with its own ResizeObserver, as `ReadMore` itself clamps a rendered document.
- **Shared pieces**: `billing-links.tsx` (bar + radio); `CoverZoom` gains `sizeClass`, `CoverHead` takes `CoverZoomLabels`.
- **Follow**: no change needed — a link to the playing song's page turns following on by the bar's own pathname rule.

## 5. Errors and dead ends

- Lint rules met on the way: `no-use-before-define` (timer), `jsx-a11y/prefer-tag-over-role`, `vova/no-redundant-property-copy` (use `pick`), no `as CSSProperties`.

## 6. State

- Branch `claude/music-radio-ttn1gg`, draft PR https://github.com/vzakharov/vovazakharov.com/pull/144 (open, draft, MERGEABLE). Last pushed commit e5d0edb before this summary.
- Plan: `docs/plans/music-radio.paused.md`, Progress updated with what is built and left.
- tsc (`-p apps/vova`), eslint on `src/pages/music`, stylelint on the new sheet and `lint:fsd` clean. **Never built and never looked at.** The build fails until `/music/radio.og.jpg` exists (`RADIO_CARD` in `lib/pictures.ts` → `pictureCard` → `intrinsicDimensions`).
- Estimate: this session 3 h senior developer ("the radio page's live dial, landing autoplay and tuned states sit on the media timing and needed the same care") + 0.5 h middle developer ("the launch buttons and route parse follow patterns the section already has"). **Remainder for the successor**: 1 h senior developer ("the page has never been rendered; its dial, autoplay and tuned states need checking and fixing in a real browser"), 1 h middle developer ("the link card extends the collage renderer the section already has"), 1.5 h middle qa ("sync has to be checked on two real devices side by side, plus the phone-width bar").

## 7. Pointers

- `docs/plans/music-radio.paused.md` — Progress and § "Changes" 8; the card's design is § "The radio's own page" last bullet and open question 5 (collage + “Radio” band).
- Built here: `src/pages/music/ui/{launch-buttons,radio-page,on-air,radio-dial,billing-links}.tsx`, `ui/radio.module.scss`, `lib/music-route-params.ts`, `lib/pictures.ts` (`RADIO_CARD`), `ui/cover-zoom.tsx`, `ui/music-route.tsx`.
- For § 8: `scripts/lib/music-collage.ts` and its caller in the `content:og:vova` render; `.claude/rules/content.md` traps on cards.
- Transcripts: this session https://claude.ai/code/session_01R9mdwwn8Tgywiqje7s8tWk; relay 4's https://claude.ai/code/session_01DUHAnnZzzgcaKd4DG4V1XJ; relay 3's https://claude.ai/code/session_01Lc9NEDDEfGjytEaBPsM1ur; relay 2's https://claude.ai/code/session_01NuNgqAkLrUD2mppHP9FcLF; the design session https://claude.ai/code/session_01GabWNBKr5XwE5zDjzPxxfA.

## 8. Next step

Resume the paused plan with `/go` from its Step 1: § "Changes" 8 first (render and commit `music/radio.og.jpg` via `pnpm content:og:vova`), then `pnpm build:vova` and `/preview` `/music/radio` at phone and wide widths in both themes, tuned and not, plus the bar's five-control strip at phone width; fix what that shows. Then Step 3 (`/polish`) and Step 4 (`/pr`). Keep reads narrow — the baseline context is heavy.
