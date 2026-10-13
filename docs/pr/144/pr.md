# PR #144: feat(vova): a fixed radio — same song, same second, for everyone

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/144
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/music-radio-ttn1gg
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-13T09:26:44Z
- **Updated:** 2026-10-13T12:03:16Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 3

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `src/pages/music/lib/player-state.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-13T11:59:58Z — "кажется для радио-штучек лучше отдельный хук (или что там)?…" → [↓](#t01)
- **T02** `src/pages/music/ui/hook-runs.tsx`:11 — unresolved — last: @vzakharov (human) 2026-10-13T12:01:20Z — "поясни для ликбеза, что за runs?" → [↓](#t02)
- **T03** `src/shared/i18n/messages/en.json`:281 — unresolved — last: @vzakharov (human) 2026-10-13T12:02:59Z — "опять же, "on a radio with no server" ненужная подкапотность" → [↓](#t03)

---

## Body

## Summary

- **A fixed radio for `/music`, with no server**: every listener hears the same song at the same second, because the station is a seeded shuffle of the public catalogue per cycle laid over Unix time — what is on air is a pure function of the device's clock. Launched from a **Radio** button beside **Shuffle all** and a round switch in the player bar.
- **Any action on playback releases it** — pause, seek, skip, shuffle, picking a song — enforced once in the player's reducer, and the music plays on from that action. Keeping the audio element on the timetable is the rest of the work: seek once the master loads, hand a finished track to the next slot, catch up after a stall.
- **The radio's own page, `/music/radio`**: a receiver with a tuning dial whose needle glides through the song on air, its cover, title and hook, a link to the song's story, and a one-paragraph account of how it works ("one round lasts 10 hours 29 minutes", in words and the right Russian case). Every tune-in opens this page; on it, the knob tunes in and the bar's switch is absent. The set is outlined only where the column has room for the outline. Its link card is the music index's cover collage under a band.

## QA Checklist

- [ ] `same-second` — Tune in on two devices (or two browsers) a minute apart: both play the same song within about a second of each other.
- [ ] `late-load` — Tune in on a throttled connection: playback joins at the live moment, not where the station was at the click.
- [ ] `handover` — Stay tuned across a track's end: the next song starts in sync on both devices, and the ended one does not replay.
- [ ] `release` — With the radio on, each of pause, seek, next, previous, shuffle, a song's own play button, the space bar and a media key releases the radio; the music carries on, and the radio page shows **Tune back in**.
- [ ] `opens-page` — From `/music` or a song page, the Radio launcher and the bar's switch each tune in and land on `/music/radio`.
- [ ] `no-switch-on-page` — On `/music/radio`, the player bar shows no radio switch; elsewhere it does, pressed while tuned in.
- [ ] `cold-load` — Opening `/music/radio` fresh starts on air where the browser allows autoplay, and shows **Tune in** where it does not.
- [ ] `knob-label` — `/music/radio/ru` after releasing: «Вернуться в эфир» sits inside the round knob on two centred lines, at phone width and wide.
- [ ] `cycle-words` — The about text gives the round as hours and minutes in words, with no seconds, in both languages.
- [ ] `frame` — Wide: the set is outlined; at phone width: no outline and no horizontal scroll.
- [ ] `og-card` — The page's link card unfurls (collage, band, title) in a link-preview checker.
- [ ] `sitemap` — The sitemap lists `/music/radio/en` and `/music/radio/ru`.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `same-second` | unit | partly | `station.test.ts` pins the slot and offset for a timestamp; the cross-device half is manual |
| `late-load` | manual-only | — | Depends on real network timing against the element |
| `handover` | unit | yes | `station.test.ts`: next slot at a slot's end and across a cycle boundary |
| `release` | unit | yes | `player-state.test.ts`: every action but tuning in releases the radio |
| `opens-page` | e2e | — | Click each launcher off-page, assert the route |
| `no-switch-on-page` | e2e | — | Assert the bar's radio control is absent on the radio route |
| `cold-load` | manual-only | — | Autoplay policy differs per browser and per visit history |
| `knob-label` | manual-only | — | Checked via `/preview` at 360px (ru) and 1280px (en) |
| `cycle-words` | unit | yes | `duration.test.ts`: `spokenLength`, accusative minutes included |
| `frame` | manual-only | — | Container query; visual check via `/preview` |
| `og-card` | unit | yes | `content:og:vova --check` holds the card's hash |
| `sitemap` | unit | — | `musicCatalogueRoutes()` includes the two locale addresses |

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01YC7QKfpQEECDcEpVBLGfaU

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-13T09:27:02Z — "Proposed squash title/body: ``` feat(vova): a fixed radio —…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-13T09:27:02Z

[https://github.com/vzakharov/vovazakharov.com/pull/144#issuecomment-6142505077](https://github.com/vzakharov/vovazakharov.com/pull/144#issuecomment-6142505077)

Proposed squash title/body:

```
feat(vova): a fixed radio — same song, same second, for everyone (pr #144)
```

```
The music section gets a radio: press it, and you hear what every other
listener who pressed it hears at that moment, with no server to keep
anyone in step. The station is a timetable over Unix time — the public
catalogue played back to back in cycles, each cycle a shuffle seeded by
its own index — so the song and the second are a pure function of the
clock and of the catalogue the page was built with. A deploy that
changes the catalogue redraws the station from that moment.

A Radio button beside Shuffle all and a round switch in the player bar
both tune in and open the radio's page. The player joins the station
where it is once the master has loaded, hands a finished track to the
next slot, and catches up after a stall. Any action on playback —
pause, seek, skip, shuffle, picking a song — releases the radio, which
the player's reducer enforces for every action but tuning in.

/music/radio is the radio's own set, which the music never moves the
reader off: a tuning dial whose needle glides through the song on air,
from the same timetable; once tuned in, the song's hook and a link to
its story; once released, Tune back in. Its own knob is how one tunes
in there, so the bar carries no switch on it. It starts at once where
the browser allows sound unasked, and unfurls as a static card. A
muted stream was not an option: most masters are FLAC, too heavy to
send to visitors who never listen.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `src/pages/music/lib/player-state.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-13T11:59:58Z — "кажется для радио-штучек лучше отдельный хук (или что там)?…" → [↓](#t01)
- **T02** `src/pages/music/ui/hook-runs.tsx`:11 — unresolved — last: @vzakharov (human) 2026-10-13T12:01:20Z — "поясни для ликбеза, что за runs?" → [↓](#t02)
- **T03** `src/shared/i18n/messages/en.json`:281 — unresolved — last: @vzakharov (human) 2026-10-13T12:02:59Z — "опять же, "on a radio with no server" ненужная подкапотность" → [↓](#t03)

<a id="t01"></a>

### `src/pages/music/lib/player-state.ts`:1 — unresolved

**@vzakharov (human)** — 2026-10-13T11:59:58Z

кажется для радио-штучек лучше отдельный хук (или что там)? слишком специфичная механика, не?

---

<a id="t02"></a>

### `src/pages/music/ui/hook-runs.tsx`:11 — unresolved

```diff
@@ -0,0 +1,19 @@
… 7 lines elided …
+ * A hook already split into its runs, for a client component: the split lives
+ * behind a barrel a client bundle cannot import.
+ */
+export function HookRuns({ runs }: HookRunsProps) {
```

**@vzakharov (human)** — 2026-10-13T12:01:20Z

поясни для ликбеза, что за runs?

---

<a id="t03"></a>

### `src/shared/i18n/messages/en.json`:281 — unresolved

```diff
@@ -275,6 +275,23 @@
… 3 lines elided …
+    "radio": "Radio",
+    "radioPage": {
+      "title": "Vova’s Radio",
+      "metaDescription": "Vova’s songs on a radio with no server: the same song, at the same second, for everyone listening.",
```

**@vzakharov (human)** — 2026-10-13T12:02:59Z

опять же, "on a radio with no server" ненужная подкапотность

---

## Timeline (status, references, and other events)

- **2026-10-13T12:03:16Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/144#pullrequestreview-5503155750.
